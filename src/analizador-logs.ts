import * as fs from "fs";
import * as readline from "readline";
import * as path from "path";
import * as os from "os";

interface EstadisticasLog {
    totalPeticiones: number;
    porCodigo: Record<string, number>;
    ipsMasFrecuentes: Record<string, number>;
}

async function analizarLog(rutaArchivo: string) {
    const stats: EstadisticasLog = {
        totalPeticiones: 0,
        porCodigo: {},
        ipsMasFrecuentes: {},
    };

    if (!fs.existsSync(rutaArchivo)) {
        console.error(`Error: El archivo ${rutaArchivo} no existe.`);
        return;
    }

    const flujo = fs.createReadStream(rutaArchivo);
    const lector = readline.createInterface({ input: flujo });

    // Expresión regular para extraer la IP y el código de estado HTTP
    const patron = /^(\S+) +.*? "[A-Z]+ .+? HTTP\/[\d.]+" (\d{3})/;

    for await (const linea of lector) {
        const coincidencia = linea.match(patron);
        if (!coincidencia) continue;

        const [, ip, codigo] = coincidencia;

        stats.totalPeticiones++;
        stats.porCodigo[codigo] = (stats.porCodigo[codigo] ?? 0) + 1;
        stats.ipsMasFrecuentes[ip] = (stats.ipsMasFrecuentes[ip] ?? 0) + 1;
    }

    // --- IMPRESIÓN DE RESULTADOS ---
    console.log(`=== ANALIZADOR DE LOGS (CLASE 22) ===`);
    console.log(`Total de peticiones procesadas: ${stats.totalPeticiones}`);

    console.log("\nDesglose por Códigos de Estado:");
    console.table(stats.porCodigo);

    // Reto adicional: Cálculo del porcentaje de peticiones exitosas (200)
    const peticionesExitosas = stats.porCodigo["200"] ?? 0;
    const porcentajeExito = stats.totalPeticiones > 0
        ? ((peticionesExitosas / stats.totalPeticiones) * 100).toFixed(2)
        : "0.00";
    console.log(`Porcentaje de peticiones exitosas (HTTP 200): ${porcentajeExito}%`);

    console.log("\nTop 5 IPs más frecuentes:");
    const top5IPs = Object.entries(stats.ipsMasFrecuentes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    top5IPs.forEach(([ip, cantidad], index) => {
        console.log(`  ${index + 1}. IP: ${ip} - ${cantidad} peticiones`);
    });

    // Alerta si existen errores 500
    const errores500 = stats.porCodigo["500"] ?? 0;
    if (errores500 > 0) {
        console.log(`\n⚠️ ATENCIÓN: Se detectaron ${errores500} errores internos (HTTP 500).`);
    }
}

// Ruta al archivo copiado en el Home (~) del sistema
const rutaLog = path.join(os.homedir(), "log-ejemplo.txt");
analizarLog(rutaLog);