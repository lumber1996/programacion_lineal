import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const aplicacion = express();

const archivoActual = fileURLToPath(import.meta.url);
const directorioActual = path.dirname(archivoActual);

aplicacion.use(express.static(directorioActual));

const PUERTO = 3000;

aplicacion.listen(PUERTO, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PUERTO}`);
});