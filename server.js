const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para obtener las imágenes
const obtenerImagenes = (callback) => {
    fs.readFile(path.join(__dirname, 'imagenes.json'), 'utf8', (err, data) => {
        if (err) {
            return callback(err);
        }
        try {
            const imagenes = JSON.parse(data);
            callback(null, imagenes);
        } catch (parseErr) {
            callback(parseErr);
        }
    });
};


const ordenarImagenesPorFecha = (imagenes) => {
    return imagenes.sort((a, b) => new Date(b.fechaSubida) - new Date(a.fechaSubida));
};

app.get('/imagenes', (req, res) => {
    obtenerImagenes((err, imagenes) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer o parsear el archivo JSON' });
        }
        const imagenesOrdenadas = ordenarImagenesPorFecha(imagenes);
        res.json(imagenesOrdenadas);
    });
});

// Ruta para eliminar una imagen
const leerArchivoImagenes = (callback) => {
    fs.readFile(path.join(__dirname, 'imagenes.json'), 'utf8', (err, data) => {
        if (err) {
            return callback(err);
        }
        try {
            const imagenes = JSON.parse(data);
            callback(null, imagenes);
        } catch (parseErr) {
            callback(parseErr);
        }
    });
};

const escribirArchivoImagenes = (imagenes, callback) => {
    fs.writeFile(path.join(__dirname, 'imagenes.json'), JSON.stringify(imagenes, null, 2), (err) => {
        if (err) {
            return callback(err);
        }
        callback(null);
    });
};



app.delete('/imagen/:id', (req, res) => {
    const id = req.params.id;
    leerArchivoImagenes((err, imagenes) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer el archivo' });
        }
        const index = imagenes.findIndex(imagen => imagen.id.toString() === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Imagen no encontrada' });
        }
        imagenes.splice(index, 1);
        escribirArchivoImagenes(imagenes, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al escribir en el archivo' });
            }
            res.status(200).json({ message: 'Imagen eliminada correctamente' });
        });
    });
});

// Ruta para agregar una nueva imagen
app.post('/imagen', (req, res) => {
  fs.readFile(path.join(__dirname, 'imagenes.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer el archivo' });
    }
    let imagenes;
    try {
      imagenes = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).json({ error: 'Error al parsear el archivo JSON' });
    }
    const nuevaImagen = req.body;
    imagenes.push(nuevaImagen);
    fs.writeFile(path.join(__dirname, 'imagenes.json'), JSON.stringify(imagenes, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al escribir en el archivo' });
      }
      res.status(201).json(nuevaImagen);
    });
  });
});


app.put('/imagen/:id', (req, res) => {
    const id = req.params.id;
    const nuevaDescripcion = req.body.descripcion;

    leerArchivoImagenes((err, imagenes) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer el archivo' });
        }
        const imagen = imagenes.find(imagen => imagen.id.toString() === id);
        if (!imagen) {
            return res.status(404).json({ error: 'Imagen no encontrada' });
        }
        imagen.descripcion = nuevaDescripcion;
        escribirArchivoImagenes(imagenes, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al escribir en el archivo' });
            }
            res.status(200).json({ message: 'Descripción actualizada correctamente' });
        });
    });
});


app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});