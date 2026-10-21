import express from 'express';
import type {Request, Response} from 'express';
import * as os from 'os';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint de Health Check
app.get('/health', (req: Request, res: Response) => {
    // Si recibe ?simular=falla, devuelve 503 Service Unavailable
    if (req.query.simular === 'falla') {
        return res.status(503).json({
            estado: 'no saludable',
            nodo: os.hostname(),
            timestamp: new Date().toISOString(),
            mensaje: 'Falla simulada'
        });
    }

    // Respuesta normal de estado saludable
    res.status(200).json({
        estado: 'saludable',
        nodo: os.hostname(),
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Backend corriendo en el puerto ${PORT}`);
});