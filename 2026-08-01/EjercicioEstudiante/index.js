// index.js (Arranque y Conexion)
import "dotenv/config";
import express from "express";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const app = express();

// 1. Configuracion del Driver y Cliente Prisma (ANTES de las rutas)
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});
const prisma = new PrismaClient({ adapter });

// 2. Middlewares Globales (ANTES de las rutas)
app.use(express.json()); // Habilita la lectura del req.body en POST/PUT

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Middleware de validacion especifico
const validarDescripcion = (req, res, next) => {
    if(!req.body.descripcion) {
        return res.status(400).json({error: "La descripcion es un campo requerido"});
    }
    next();
};

// 3. Rutas (Endpoints)
// GET todas las tareas
app.get('/tareas', async (req, res) => {
  const tareas = await prisma.tarea.findMany();
  res.json(tareas);
});

// GET tarea individual por ID
app.get('/tareas/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const tarea = await prisma.tarea.findUnique({
    where: { id }
  });

  if (!tarea) {
    return res.status(404).json({
      error: "Tarea no encontrada"
    });
  }

  res.json(tarea);
});

// POST: Crear nueva tarea
app.post('/tareas', validarDescripcion, async (req, res) => {
  const { descripcion } = req.body;
  const tarea = await prisma.tarea.create({ data: { descripcion } });
  res.status(201).json(tarea);
});

// PUT: Actualizacion dinamica
app.put('/tareas/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const tareaExiste = await prisma.tarea.findUnique({ where: { id } });

  if (!tareaExiste) return res.status(404).json({ error: "Tarea no encontrada" });

  const { descripcion, completada } = req.body;
  
  const tarea = await prisma.tarea.update({
    where: { id },
    data: {
      ...(descripcion !== undefined && { descripcion }),
      ...(completada !== undefined && { completada })
    }
  });
  
  res.json(tarea);
});

// DELETE: Eliminar 
app.delete('/tareas/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const tareaExiste = await prisma.tarea.findUnique({ where: { id } });

  if (!tareaExiste) return res.status(404).json({ error: "Tarea no encontrada" });

  await prisma.tarea.delete({ where: { id } });
  res.json({ mensaje: "Tarea eliminada exitosamente" });
});

// 4. Arranque del servidor
app.listen(3000, () => {
    console.log("Servidor de inventario en el puerto 3000");
});