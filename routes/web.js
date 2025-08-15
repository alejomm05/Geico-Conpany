// routes/web.js
const express = require('express');
const multer = require('multer');
const { db, bucket } = require('../src/firebase'); // ✅ Importa db también

const router = express.Router();

// Configurar multer
const upload = multer({ dest: 'uploads/' });

router.post('/registrar', upload.array('files', 2), async (req, res) => {
  try {
    const { nombres, apellidos, correo } = req.body;
    const [fotoLicencia, fotoSeguro] = req.files;

    // Subir fotos
    const fotoLicenciaUrl = await subirFoto(bucket, fotoLicencia, 'licencias/');
    const fotoSeguroUrl = await subirFoto(bucket, fotoSeguro, 'seguros/');

    // Guardar en Firestore
    const solicitud = {
      nombres,
      apellidos,
      correo,
      fotoLicenciaUrl,
      fotoSeguroUrl,
      fechaRegistro: new Date()
    };

    const docRef = await db.collection('solicitudes').add(solicitud);

    res.status(200).json({
      mensaje: 'Datos guardados correctamente',
      id: docRef.id
    });

  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'No se pudo procesar la solicitud' });
  }
});

// Función para subir foto
async function subirFoto(bucket, file, folder) {
  if (!file) return null;
  const filePath = `${folder}${Date.now()}_${file.originalname}`;
  const fileRef = bucket.file(filePath);
  await fileRef.save(file.buffer, {
    metadata: { contentType: file.mimetype }
  });
  return fileRef.publicUrl();
}

module.exports = router;