### Crear el archivo con los logs
```bash
docker exec apache-clase21 cat /usr/local/apache2/logs/blog.local-ssl-access.log > ~/Desktop/Ciclo4/GSW/log-ejemplo.txt
```

## Ejecutar analizador-logs.ts
```bash
npx tsx src/analizador-logs.ts
```