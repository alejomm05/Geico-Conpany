const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { admin,db, bucket } = require('./firebase');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});

const handleFileUpload = upload.fields([
  { name: 'fotoLicencia', maxCount: 1 },
  { name: 'fotoSeguro', maxCount: 1 }
]);

app.get('/api/',(req,res) =>{
  res.json({"message": "Hola mundo"})
})

app.post('/api/FormData', handleFileUpload, async (req, res) => {
  try {
    const { nombres, apellidos, correo } = req.body;
    const fotoLicencia = req.files['fotoLicencia'] ? req.files['fotoLicencia'][0] : null;
    const fotoSeguro = req.files['fotoSeguro'] ? req.files['fotoSeguro'][0] : null;

    let fotoLicenciaUrl = null;
    let fotoSeguroUrl = null;

    if (fotoLicencia) {
      fotoLicenciaUrl = await subirArchivoAFirebase(fotoLicencia, 'licencias');
    }

    if (fotoSeguro) {
      fotoSeguroUrl = await subirArchivoAFirebase(fotoSeguro, 'seguros');
    }

    const docRef = await db.collection('formularios').add({
      nombres,
      apellidos,
      correo,
      fotoLicenciaUrl,
      fotoSeguroUrl,
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pendiente'
    });

    res.status(200).json({ 
      success: true,
      message: 'Datos guardados en Firebase correctamente',
      id: docRef.id
    });

  } catch (error) {
    console.error('Error al procesar el formulario:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al guardar en Firebase',
      details: error.message 
    });
  }
});

async function subirArchivoAFirebase(archivo, carpeta) {
  const nombreArchivo = `${carpeta}/${Date.now()}_${archivo.originalname}`;
  const file = bucket.file(nombreArchivo);

  await new Promise((resolve, reject) => {
    const blobStream = file.createWriteStream({
      metadata: {
        contentType: archivo.mimetype
      }
    });

    blobStream.on('error', reject);
    blobStream.on('finish', resolve);
    blobStream.end(archivo.buffer);
  });

  await file.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${file.name}`;
}

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: 'Error al subir archivos',
      details: err.code === 'LIMIT_UNEXPECTED_FILE' 
        ? `Campo '${err.field}' no esperado o demasiados archivos` 
        : err.message
    });
  }
  
  if (err.code === 'storage/unknown') {
    return res.status(500).json({
      success: false,
      error: 'Error al subir archivos a Firebase Storage'
    });
  }

  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});