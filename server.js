const express = require('express');
// para manejar el sistema de archivos
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// FUNCIONES AXULIARES
const ObtenerImagenes = (callback) => {
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

const escribirArchivoImagenes = (imagenes, callback) => {
    fs.writeFile(path.join(__dirname, 'imagenes.json'), JSON.stringify(imagenes, null, 2), (err) => {
        if (err) {
            return callback(err);
        }
        callback(null);
    });
};

const agregarImagen = (nuevaImagen, callback) => {
    ObtenerImagenes((err, imagenes) => {
        if (err) {
            return callback(err);
        }
        imagenes.push(nuevaImagen);
        escribirArchivoImagenes(imagenes, callback);
    });
};

const eliminarImagen = (id, callback) => {
    ObtenerImagenes((err, imagenes) => {
        if (err) {
            return callback(err);
        }
        const index = imagenes.findIndex(imagen => imagen.id.toString() === id);
        if (index === -1) {
            return callback(new Error('Imagen no encontrada'));
        }
        imagenes.splice(index, 1);
        escribirArchivoImagenes(imagenes, callback);
    });
};
const actualizarDescripcionImagen = (id, nuevaDescripcion, callback) => {
    ObtenerImagenes((err, imagenes) => {
        if (err) {
            return callback(err);
        }
        const imagen = imagenes.find(imagen => imagen.id.toString() === id);
        if (!imagen) {
            return callback(new Error('Imagen no encontrada'));
        }
        imagen.descripcion = nuevaDescripcion;
        escribirArchivoImagenes(imagenes, callback);
    });
};

//RUTAS PARA LAS OPERACIONES
app.get('/imagenes', (req, res) => {
    ObtenerImagenes((err, imagenes) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer o parsear el archivo JSON' });
        }
        const imagenesOrdenadas = ordenarImagenesPorFecha(imagenes);
        res.json(imagenesOrdenadas);
    });
});
app.delete('/imagen/:id', (req, res) => {
    const id = req.params.id;
    eliminarImagen(id, (err) => {
        if (err) {
            if (err.message === 'Imagen no encontrada') {
                return res.status(404).json({ error: err.message });
            }
            return res.status(500).json({ error: 'Error al eliminar la imagen' });
        }
        res.status(200).json({ message: 'Imagen eliminada correctamente' });
    });
});

app.post('/imagen', (req, res) => {
    const nuevaImagen = req.body;
    agregarImagen(nuevaImagen, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al agregar la imagen' });
        }
        res.status(201).json(nuevaImagen);
    });
});

app.put('/imagen/:id', (req, res) => {
    const id = req.params.id;
    const nuevaDescripcion = req.body.descripcion;
    actualizarDescripcionImagen(id, nuevaDescripcion, (err) => {
        if (err) {
            if (err.message === 'Imagen no encontrada') {
                return res.status(404).json({ error: err.message });
            }
            return res.status(500).json({ error: 'Error al actualizar la descripción' });
        }
        res.status(200).json({ message: 'Descripción actualizada correctamente' });
    });
});


app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});