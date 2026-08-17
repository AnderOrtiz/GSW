import express, { type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const app = express(),
    PUERTO = 3000,
    limiter = rateLimit({
        max: 5,
        message: {
            error: "Demaciadas solicitudes https",
            mensaje: "Haz superado el limite esperate un momento para volde a probar"
        },
        statusCode: 429 //codigo http por defecto muchas deciciones 
    });

// Permite leer JSON enviado en el body de las peticiones POST
app.use(express.json())
app.use(limiter);
app.use(helmet());
app.use((err: Error, req: Request, res: Response, next: Function) => {
    console.error(err); // esto si queda en el log , que solo ve el administrador
    res.status(500).json({ error: "Ocurrio un error interno" });
});

app.get("/", (req: Request, res: Response) => {
    res.send(
        `<h1>Contenedor de libre distribución activo en el puerto ${PUERTO}</h1>`
    );
});

// Ruta 1: saludo personalizado con GET
app.get("/saludo", (req: Request, res: Response) => {
    const nombre = (req.query.nombre as string) ?? "desconocido";

    res.send(`<h1>Hola, ${nombre}!</h1>`);
});

// Ruta 1: saludo personalizado con POST
app.post("/saludo", (req: Request, res: Response) => {
    const nombre = req.body.nombre ?? "desconocido";

    res.send(`<h1>Hola, ${nombre}!</h1>`);
});

// Ruta 2: información del servidor en el momento de la petición
app.get("/info", (req: Request, res: Response) => {
    res.json({
        fechaServidor: new Date().toISOString(),
        userAgent: req.headers["user-agent"],
    });
});

// Ruta 3: cálculo dinámico -- total con IVA (13 %, El Salvador)
app.get("/cotizacion", (req: Request, res: Response) => {
    const montoRaw = req.query.monto as string;
    const monto = Number(montoRaw);

    if (!montoRaw || isNaN(monto) || monto < 0 || monto > 1_000_000) {
        res.status(400).json({ error: "Monto invalido" });
        return;
    }

    const totalConIva = monto * 1.13;

    res.json({
        montoOriginal: monto,
        iva: monto * 0.13,
        total: totalConIva,
    });
});

// Ruta 4: cálculo del factorial
function factorial(n: number): number {
    // Caso base
    if (n === 0) {
        return 1;
    }

    // Llamada recursiva
    return n * factorial(n - 1);
}

app.get("/factorial", (req: Request, res: Response) => {
    const n = Number(req.query.n);

    if (!Number.isInteger(n) || n < 0) {
        res.status(400).json({
            error: "n debe ser un número entero no negativo",
        });
        return;
    }

    const resultado = factorial(n);

    res.json({
        n: n,
        factorial: resultado,
    });
});



app.listen(PUERTO, () => {
    console.log(`Escuchando en http://localhost:${PUERTO}`);
});

// TODO Entregar: código modificado + captura del mensaje de ”demasiadas peticiones” + breve