import * as http from "http";
import { URL } from "url";

// router handler -- equivalente a servlet

function manejarMensaje(nombre: string): string {
    return `<h1>Hola, ${nombre}</h1>
    <p>Bienvenidos a tu primer contenerdor web.</p>`;
}

const servidor = http.createServer((req: any, res: any) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

    if (url.pathname === "/saludo") {
        const nombre = url.searchParams.get("nombre") ?? "desconocido";
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(manejarMensaje(nombre));
        return;
    }

    if (url.pathname === "/suma") {
        const a = Number(url.searchParams.get("a") ?? 0);
        const b = Number(url.searchParams.get("b") ?? 0);

        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`El resultado de ${a} + ${b} = ${a + b} `)
        return;
    }

    if (url.pathname === "/despedida") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`See you later, alligator!`);
        return;
    }


    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Ruta no encontrada");
});

servidor.listen(3000, () => console.log("Escuchar en http://localhost:3000"));