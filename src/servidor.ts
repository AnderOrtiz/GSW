import express, { type Request, type Response } from "express";
const app = express();
const PUERTO = 3000;

app.get("/", (req: Request, res: Response) => {
    res.send(`<h1>Contenedor de libre distribucion activo en el puerto ${PUERTO} </h1>`);
});

// Ruta 1: saludo personalizado (el route handler mas simple posible )
app.get("/saludo", (req: Request, res: Response) => {
    const nombre = (req.query.nombre as string) ?? "desconocido";
    res.send(`<h1 >Hola , ${nombre}!</h1 >`);
})

// Ruta 2: informacion del servidor en el momento de la peticion
app.get("/info", (req: Request, res: Response) => {
    res.json({
        fechaServidor: new Date().toISOString(),
        userAgent: req.headers["user -agent"],
    });
});

// Ruta 3: calculo dinamico -- total con IVA (13 %, El Salvador)
app.get("/cotizacion", (req: Request, res: Response) => {
    const monto = parseFloat((req.query.monto as string) ?? "0");
    if (isNaN(monto) || monto < 0) {
        res.status(400).json({ error: "monto invalido" });
        return;
    }
    const totalConIva = monto * 1.13;
    res.json({ montoOriginal: monto, iva: monto * 0.13, total: totalConIva });
});


app.listen(PUERTO, () => {
    console.log(`Escuchando en http://localhost:${PUERTO}`);
});