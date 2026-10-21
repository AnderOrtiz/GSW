import express from 'express';
import type { Request, Response } from 'express';
import * as os from 'os';

const app = express();
// Debe ser 9000 para coincidir con la directiva ProxyPass de blog.local.conf
const PORT = process.env.PORT || 9000;

app.use(express.json());

// Ruta consumida a través del Reverse Proxy (https://blog.local/api/status)
app.get('/status', (req: Request, res: Response) => {
    res.json({
        estado: 'Online',
        mensaje: 'Conexión exitosa entre blog.local (Apache) y Express (9000)',
        nodo: os.hostname(),
        timestamp: new Date().toISOString()
    });
});

// Endpoint de Health Check (https://blog.local/api/health)
app.get('/health', (req: Request, res: Response) => {
    if (req.query.simular === 'falla') {
        return res.status(503).json({
            estado: 'no saludable',
            nodo: os.hostname(),
            mensaje: 'Falla simulada'
        });
    }

    res.status(200).json({
        estado: 'saludable',
        nodo: os.hostname(),
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Backend de blog.local corriendo en http://localhost:${PORT}`);
});