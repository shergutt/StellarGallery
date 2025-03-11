/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// routes/images.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { getImageMetadata } = require('../utils/imageMetadata');
const { getCachedMetadata, cacheMetadata } = require('../utils/cache');
const db = require('../database'); // Se agrega la conexión a la DB

const router = express.Router();
const imagesFolder = "C:/Users/alex1/OneDrive/Imágenes/borrar";

// Endpoint para listar imágenes con metadata (ya existente)
router.get('/', async (req, res) => {
  try {
    const cached = await getCachedMetadata(imagesFolder);
    if (cached) return res.json({ images: cached });

    const files = await fs.promises.readdir(imagesFolder);
    const imageFiles = files.filter(file => /.(jpg|jpeg|png|gif)$/i.test(file));

    const imagesWithMetadata = await Promise.all(imageFiles.map(async (file) => {
      const filePath = path.join(imagesFolder, file);
      const fileExtension = path.extname(file);
      const { metadata, error } = await getImageMetadata(filePath, fileExtension);
      return { file, metadata, error };
    }));

    await cacheMetadata(imagesFolder, imagesWithMetadata);
    res.json({ images: imagesWithMetadata });
  } catch (err) {
    console.error('Error processing images:', err);
    res.status(500).json({ error: 'Failed to process images' });
  }
});

// Endpoint para eliminar una imagen específica
router.delete('/:file', async (req, res) => {
  const { file } = req.params;
  const filePath = path.join(imagesFolder, file);

  console.log('Intentando eliminar:', filePath);
  // Prevención de directory traversal verificando que el path resuelto
  // esté dentro de la carpeta de imágenes
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve(imagesFolder))) {
    return res.status(400).json({ error: 'Nombre de archivo inválido' });
  }

  // Validación de extensión permitida
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  const fileExtension = path.extname(file).toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({ error: 'Extensión de archivo no permitida' });
  }

  try {
    // Verificar si el archivo existe
    await fs.promises.access(filePath, fs.constants.F_OK);
  } catch (err) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }

  try {
    // Eliminar el archivo
    await fs.promises.unlink(filePath);
    await clearCache(imagesFolder);
    res.json({ message: 'Imagen eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar la imagen:', err);
    res.status(500).json({ error: 'No se pudo eliminar la imagen' });
  }
});

// Nuevo endpoint para obtener comentarios de una imagen específica
router.get('/:file/comments', (req, res) => {
  const { file } = req.params;
  const sql = `SELECT * FROM comments WHERE image_file = ? ORDER BY created_at DESC`;
  db.all(sql, [file], (err, rows) => {
    if (err) {
      console.error("Error al obtener los comentarios:", err.message);
      return res.status(500).json({ error: "Error al obtener los comentarios" });
    }
    res.json({ comments: rows });
  });
});

// Nuevo endpoint para agregar un comentario a una imagen específica
router.post('/:file/comments', (req, res) => {
  const { file } = req.params;
  const { user_email, comment_text } = req.body;

  if (!user_email || !comment_text) {
    return res.status(400).json({ error: "user_email y comment_text son requeridos" });
  }

  const sql = `
    INSERT INTO comments (image_file, user_email, comment_text)
    VALUES (?, ?, ?)
  `;
  db.run(sql, [file, user_email, comment_text], function(err) {
    if (err) {
      console.error("Error al insertar el comentario:", err.message);
      return res.status(500).json({ error: "Error al insertar el comentario", details: err.message });
    }
    res.status(201).json({ 
      message: "Comentario agregado", 
      commentId: this.lastID,
      comment: { 
        id: this.lastID,
        image_file: file,
        user_email,
        comment_text,
        created_at: new Date().toISOString()
      }
    });
  });
});

module.exports = router;
