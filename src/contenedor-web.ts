// Contenedor dinamico
import * as http from "http";
import { URL } from "url";

const server = http.createServer((req: any, res: any) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

    if (url.pathname === "/hora-saludo") {
        const name = url.searchParams.get("nombre") ?? "visitante",
            hora = new Date().getHours(),
            saludo = hora < 12 ? "Buenos dias"
                : hora < 19 ? "Buenas tardes"
                    : "Buenas noches";

        res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" })
        res.end(`<h1>${saludo}, ${name} </h1>`);
        return
    }
    res.writeHead(404).end("No encontrado")
});

server.listen(3006, () => console.log(`Contenedor corriendo en http://localhost:3006/hora-saludo?nombre=Anderson`));