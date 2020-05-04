var express = require('express');
var fileUpload = require('express-fileupload');
var app = express()

// opciones por defecto 
app.use(fileUpload()); // viene de la libreria arriba

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensajes: 'El tipo de colleccion no es valido',
            errors: { message: 'El tipo de colleccion no es valido' }
        });
    }

    // viene un archivo ?
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            manseja: 'No cargao imagenes',
            errors: { message: 'Debe Seleccionar alguna imagen' }
        });

    }

    // obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCartado = archivo.name.split('.'); // dividir el archivos en el punto, buscar la ultima posicion del arregle
    var extensionArchivo = nombreCartado[nombreCartado.length - 1];

    // validar extenciones aceptables
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) { // comparamos la extencion con alguna del arreglo

        return res.status(400).json({
            ok: false,
            manseja: 'Extension no valida',
            errors: { message: 'Las Extenciones validas son ' + extensionesValidas.join(', ') } // mostrar arreglo separado por coma y espacio
        });

    }

    // nombre de archivo personalizado con id de usuario + random de 3 cifras + extencion capturada
    var nombreArchivo = `${id}-${ new Date().getMilliseconds() }.${ extensionArchivo }`

    // mover el archivo a una path en particular
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return req.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: { message: 'Error al mover el archvio' }
            });
        }
    });

    res.status(200).json({
        ok: true,
        mensaje: 'archivo cargado',
        nombre: nombreArchivo
    })

}); // ( request , response, next ) next que continue

module.exports = app;