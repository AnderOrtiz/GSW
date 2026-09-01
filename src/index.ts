import express, { type Application } from "express";
import usuariosRouters from './routers/usuarios'

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/usuarios', usuariosRouters);

app.listen(PORT, () => {
    console.log(`Servidor corriendo ene el puerto ${PORT}`)
})