import * as fs from "fs";
import * as readline from "readline";
import * as path from "path";
import { fileURLToPath } from "url";

interface EstadisticasLog {
    totalPeticiones: number;
    porCodigo: Record<string, number>;
    ipsMasFrecuentes: Record<string, number>;
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rutaArchivo = process.argv[2] ?? path.join(__dirname, "..", "data", "log-ejemplo.txt");

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

    const lector = readline.createInterface({ input: fs.createReadStream(rutaArchivo) });

    // Expresión regular para extraer la IP y el código de estado HTTP
    const patron = /^(\S+) +.*? "[A-Z]+ .+? HTTP\/[\d.]+" (\d{3})/;

    for await (const linea of lector) {
        const coincidencia = linea.match(patron);
        if (!coincidencia) continue;

        const [, ip, codigo] = coincidencia;


        stats.porCodigo[codigo!] = (stats.porCodigo[codigo!] ?? 0) + 1;
        stats.ipsMasFrecuentes[ip!] = (stats.ipsMasFrecuentes[ip!] ?? 0) + 1;
    }

    return stats;
}

async function main() {
    const stats: EstadisticasLog = await analizarLog(rutaArchivo);
    console.log(`Total de peticiones ${stats.totalPeticiones}`);
    console.log(`Por código: ${stats.porCodigo}`);

    const top5 = Object.entries(stats.ipsMasFrecuentes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    console.log("Top 5 IPs: ")
    for (const [ip, n] of top5) {
        console.log(`${ip}: ${n}`)
    }

    const errores500 = stats.porCodigo["500"] ?? 0;
    if (errores500 > 0) {
        console.log(`Atención: ${errores500} errores 500`);
    }


}