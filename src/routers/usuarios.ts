import type { Request, Response } from "express";
import { Router } from "express";

const router = Router();

router.get("/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ mensaje: `Usuario encontrado con el ID: ${id}` })
})

export default router