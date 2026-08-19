import express, { type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url),
    __dirname = path.dirname(__filename),

    app = express(),
    PORT = 4000,
    DB_PATH = path.join(__dirname, "../db/db.json"),

    limiter = rateLimit({
        windowMs: 60_0000,
        max: 20,
        message: {
            error: "Demaciadas peticiones. Intenta en 1 minuto"
        }
    });

// Middlewares de Seguridad
app.use(helmet());
app.use(express.json());
app.use(limiter);

// funciones para menejar la DB
async function leerDB() {
    try {
        const data = await fs.readFile(DB_PATH, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        const inicial = { productos: [] }
        await fs.writeFile(DB_PATH, JSON.stringify(inicial, null, 2));
        return inicial
    }
}

async function escribirDB(data: any) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2))
}

// GET /productos =>  Listar todos los productos
app.get("/productos", async (req: Request, res: Response) => {
    const db = await leerDB();
    res.json(db.productos);
});

//GET /productos/:id => obtener producto por id
app.get("/producto/:id", async (req: Request, res: Response) => {
    const db = await leerDB(),
        id = Number(req.params.id),
        producto = db.productos.find((p: any) => p.id === id);

    if (!producto) {
        return res.status(404).json({ error: "Producto no encontrado" })
    }

    res.json(producto);

});


app.post("/producto", async (req: Request, res: Response) => {
    const { nombre, precio, stock } = req.body;

    if (!nombre || typeof nombre !== "string" || nombre.length <= 2) {
        return res.status(400).json({ error: "El nombre no puedes venir vacio y mas de 2 caractere" })
    }

    if (!precio || typeof precio !== "number" || precio <= 0) {
        return res.status(400).json({ error: "El precio no puede ser negativo" })

    }

    if (!stock || typeof stock !== "number" || stock <= 0) {
        return res.status(400).json({ error: "El stock no puede ser negativo" })
    }

    const db = await leerDB();
    const nuevoID = db.productos.length > 0
        ? Math.max(...db.productos.map((p: any) => p.id)) + 1
        : 1;

    const nuevoProducto = {
        id: nuevoID,
        nombre: nombre.trim(),
        precio,
        stock
    }

    db.productos.push(nuevoProducto);
    await escribirDB(db)

    res.status(200).json({
        message: "Producto agregado exitosamente",
        nuevoProducto
    })
})

app.listen(PORT, () => console.log(`Estoy corriendo en: http://localhost:${PORT}`))