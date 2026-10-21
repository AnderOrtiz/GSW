import express from 'express';
import type { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Ruta principal (http://mi-api.local:8090/)
app.get('/', (req: Request, res: Response) => {
    res.json({
        ok: true,
        mensaje: '¡Hola! La API con Express y TypeScript está respondiendo correctamente detrás del Proxy de Apache.',
        timestamp: new Date().toISOString()
    });
});

// Ruta de ejemplo para usuarios (/api/usuarios/:id)
app.get('/api/usuarios/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({
        ok: true,
        usuario: {
            id,
            nombre: 'Anderson Ortiz',
            rol: 'Desarrollador'
        }
    });
});

// Manejo de rutas no encontradas
app.use((req: Request, res: Response) => {
    res.status(404).json({
        ok: false,
        error: 'Ruta no encontrada'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en el puerto ${PORT}`);
});