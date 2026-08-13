# Levantar `miapp` como servicio de Windows (NSSM)

Guía probada de punta a punta en Windows 11 para instalar `miapp` (el servidor
Express/TypeScript de la Clase 7) como servicio del sistema con NSSM, corrigiendo
lo que el PDF original deja incompleto o no funciona tal cual en Windows.

**Todo se ejecuta en PowerShell abierta como Administrador** (clic derecho →
"Ejecutar como administrador").

Requisitos previos:
- Node.js instalado (`node -v` debe responder).
- NSSM instalado y en el PATH (`nssm --version` debe responder). Si no lo tienes:
  `winget install NSSM.NSSM`.
- Haber compilado el proyecto al menos una vez (`npm run build`) para tener
  `src\index.js`.

---

## 1. Copiar el proyecto a `C:\miapp`

El PDF ya sugiere `C:\miapp` como ubicación en Windows, y hay una razón práctica
para seguirlo: si dejas el proyecto dentro de tu carpeta de usuario
(`C:\Users\tu_usuario\...`), la cuenta de servicio dedicada no podrá leerlo por los
permisos NTFS por defecto de esa carpeta. `C:\miapp` es una ruta neutral sin ese
problema.

```powershell
New-Item -ItemType Directory -Path C:\miapp -Force | Out-Null
robocopy "<ruta-de-tu-proyecto>" "C:\miapp" /E /XD node_modules .git
Set-Location C:\miapp
npm ci
npm run build
```

Verifica que `C:\miapp\src\index.js` existe antes de seguir.

## 2. Crear la cuenta de servicio dedicada `appweb`

El PDF usa `New-LocalUser -Name "appweb" -NoPassword`. En la práctica, un servicio
de Windows necesita una cuenta con credenciales reales para poder "iniciar sesión
como servicio" — una cuenta sin contraseña casi siempre falla con
`Error 1069 (logon failure)`. Por eso se crea **con contraseña**:

```powershell
$claveAppweb = "CambiaEstaClave123!"
New-LocalUser -Name "appweb" `
  -Password (ConvertTo-SecureString $claveAppweb -AsPlainText -Force) `
  -PasswordNeverExpires `
  -UserMayNotChangePassword `
  -Description "Cuenta de servicio para miapp (Node/Express)"
```

Guarda `$claveAppweb` en la misma sesión — la necesitas en el paso 4. Usa tu
propia contraseña, no dejes la del ejemplo.

No hace falta configurar manualmente el derecho "Iniciar sesión como servicio":
el Administrador de Control de Servicios de Windows se lo concede solo a la
cuenta en cuanto la asocias al servicio con `nssm set ... ObjectName`.

## 3. Dar permisos sobre `C:\miapp` a `appweb`

```powershell
icacls C:\miapp /grant "appweb:(OI)(CI)M" /T
```

Usa **`M` (Modify)**, no `RX`. Con solo lectura/ejecución, `appweb` no puede
crear el archivo de log del paso 4, y NSSM falla al arrancar el proceso porque no
logra abrir el archivo para redirigir la salida.

## 4. Instalar el servicio con NSSM

```powershell
nssm install miapp "C:\Program Files\nodejs\node.exe" "C:\miapp\src\index.js"
nssm set miapp AppDirectory "C:\miapp"
nssm set miapp ObjectName ".\appweb" $claveAppweb
nssm set miapp Start SERVICE_AUTO_START
nssm set miapp AppStdout "C:\miapp\service.log"
nssm set miapp AppStderr "C:\miapp\service.log"
```

**Si ya existía un servicio `miapp` de un intento anterior**, `nssm install` va a
fallar con `CreateService(): El servicio especificado ya existe` — pero los
`nssm set` de las líneas siguientes sí se aplican sobre el servicio existente. El
problema es que el ejecutable y los argumentos (`Application` /
`AppParameters`) quedan con lo que sea que tenía esa instalación vieja, y
`nssm install` es el único comando que los define — si falla, nunca se
actualizan. Verifica siempre lo que quedó guardado:

```powershell
nssm get miapp Application
nssm get miapp AppParameters
```

Debe decir exactamente `C:\Program Files\nodejs\node.exe` y
`C:\miapp\src\index.js`. Si dice otra cosa (por ejemplo `cmd.exe` con `/c ...`, o
una ruta distinta), corrígelo a mano:

```powershell
nssm set miapp Application "C:\Program Files\nodejs\node.exe"
nssm set miapp AppParameters "C:\miapp\src\index.js"
```

Si prefieres partir de cero en vez de reparar el servicio viejo, es más simple
eliminarlo primero y repetir este paso:

```powershell
nssm stop miapp
nssm remove miapp confirm
```

## 5. Arrancar y verificar

Antes de arrancar, confirma que no haya un `node` suelto de una prueba manual
tuya (`npm start`, `node src/index.js`, etc.) ocupando el puerto 3000 — si lo
hay, el proceso del servicio no podrá abrir el puerto y NSSM lo va a marcar en
estado `Paused` tras varios intentos fallidos:

```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
```

Ahora sí:

```powershell
nssm start miapp
Start-Sleep -Seconds 2
Get-Service miapp
Invoke-WebRequest http://localhost:3000 -UseBasicParsing | Select-Object -ExpandProperty Content
```

Deberías ver `Status: Running` y el `<h1>Contenedor de libre distribucion
activo...</h1>`. Confirma que quien responde en el puerto 3000 es realmente el
servicio (no un proceso suelto):

```powershell
Get-CimInstance Win32_Service -Filter "Name='miapp'" | Select-Object ProcessId
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
```

Los dos números de proceso deben coincidir.

## 6. Ejercicio del PDF: detener y confirmar que deja de responder

```powershell
nssm stop miapp
Invoke-WebRequest http://localhost:3000 -UseBasicParsing
```

Esto debe fallar con un error de **conexión rechazada** (no un 404) — es la
diferencia que pide observar la diapositiva 20 del PDF: "el contenedor responde
pero no encuentra la ruta" vs. "no hay nadie escuchando en ese puerto".

```powershell
nssm start miapp
Get-Service miapp
```

---

## Solución de problemas

**`Error creating service! El servicio especificado ya existe`**
Ya había un servicio `miapp` (de un intento anterior). No es un error fatal — ver
Paso 4: verifica y corrige `Application`/`AppParameters`, o elimínalo y repite
desde cero con `nssm remove miapp confirm`.

**El servicio queda en estado `Paused` después de arrancarlo**
NSSM pausa el servicio como protección cuando la app se cae/reinicia
repetidamente muy rápido. Revisa el log para ver el motivo real:
```powershell
Get-Content C:\miapp\service.log -Tail 40
```
Las dos causas más comunes: (a) el puerto 3000 ya estaba ocupado por otro
proceso (Paso 5), o (b) `appweb` no tiene permiso de escritura sobre
`C:\miapp` para crear el log (Paso 3, usar `M` no `RX`).

**`No se puede iniciar el servicio debido a un error en el inicio de sesión`
(logon failure)**
La contraseña que tiene NSSM guardada para `appweb` no coincide con la cuenta,
o la cuenta quedó bloqueada por Windows tras varios intentos fallidos. Corrige
ambas cosas y reintenta:
```powershell
# Desbloquear la cuenta (NO uses "Unlock-LocalUser": ese cmdlet no existe en
# PowerShell — este es el método que sí funciona)
$u = [ADSI]"WinNT://./appweb"
$u.IsAccountLocked = $false
$u.SetInfo()

# Resetear la contraseña en la cuenta y en NSSM al mismo tiempo, para que
# queden sincronizadas sí o sí
$claveAppweb = "OtraClave456!"
Set-LocalUser -Name appweb -Password (ConvertTo-SecureString $claveAppweb -AsPlainText -Force)
nssm set miapp ObjectName ".\appweb" $claveAppweb
nssm stop miapp
nssm start miapp
```

**El log muestra `"C:\Program" no se reconoce como un comando...`**
El campo `Application` del servicio quedó mal registrado — típicamente porque
alguna instalación anterior usó `cmd.exe /c "ruta con espacios sin comillas"`
en vez de apuntar directo al ejecutable. Corrígelo (Paso 4):
```powershell
nssm set miapp Application "C:\Program Files\nodejs\node.exe"
nssm set miapp AppParameters "C:\miapp\src\index.js"
nssm stop miapp
nssm start miapp
```
Nota: NSSM **agrega** al log en vez de reemplazarlo, así que después de corregir
un error vas a seguir viendo las líneas de fallos viejos arriba — fíjate en la
**última línea**, no en las primeras. `Clear-Content C:\miapp\service.log` lo
limpia si quieres empezar a leerlo de cero.

---

## Desinstalar / limpiar (cuando termines de probar)

```powershell
nssm stop miapp
nssm remove miapp confirm
Remove-LocalUser -Name appweb
Remove-Item C:\miapp -Recurse -Force
```
