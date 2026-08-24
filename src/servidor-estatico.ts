import * as http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// servidor-estatico.ts
const __filename = fileURLToPath(import.meta.url),
    __dirname = path.dirname(__filename)


const servidor = http.createServer((req: any, res: any) => {
    const archivo = path.join(__dirname, "..", "public", "saludo.html")

    fs.readFile(archivo, (error: NodeJS.ErrnoException | null, contenido: Buffer<ArrayBuffer>) => {
        if (error) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Archivo no encontrado");
            return;
        }

        // no se calcula nada simplemente se entrega el html tal cual.
        res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" });
        res.end(contenido);
    })
});

servidor.listen(3005, () => console.log("Escuchar en http://localhost:3005"));