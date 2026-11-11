import express, { type Request, type Response } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const app = express();
const PORT = 3000;

// Configuración del almacenamiento temporal en memoria con Multer
const upload = multer({ storage: multer.memoryStorage() });

// Configuración del cliente AWS S3 apuntando a MinIO local
const s3Client = new S3Client({
    region: 'us-east-1',
    endpoint: 'http://localhost:9000', // Apunta a la API local de MinIO
    credentials: {
        accessKeyId: 'admin_cloud',
        secretAccessKey: 'Password123!'
    },
    forcePathStyle: true // Obligatorio para emuladores S3 locales como MinIO
});

const BUCKET_NAME = 'mi-bucket-simulado';

// Endpoint para subir un archivo a la nube simulada
app.post('/api/upload', upload.single('archivo'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha adjuntado ningún archivo.' });
        }

        const params = {
            Bucket: BUCKET_NAME,
            Key: `${Date.now()}_${req.file.originalname}`,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        };

        // Enviar el archivo a MinIO
        await s3Client.send(new PutObjectCommand(params));

        const publicUrl = `http://localhost:9000/${BUCKET_NAME}/${params.Key}`;

        return res.status(200).json({
            mensaje: '¡Archivo subido exitosamente a la nube simulada!',
            detalles: {
                nombreOriginal: req.file.originalname,
                bucket: BUCKET_NAME,
                urlAcceso: publicUrl
            }
        });
    } catch (error: any) {
        console.error('Error detallado al subir:', error);
        return res.status(500).json({
            error: 'Fallo interno en el almacenamiento cloud.',
            detalle: error.message || error
        });
    }
});

app.listen(PORT, () => {
    console.log(`Backend de prueba escuchando en http://localhost:${PORT}`);
    console.log(`Conectado exitosamente al emulador Cloud MinIO en el puerto 9000`);
});

// /Users/ander-ortiz/Desktop/Screenshot