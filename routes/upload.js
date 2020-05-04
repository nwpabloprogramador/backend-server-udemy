var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('./../models/usuario');
var Medico = require('./../models/medico');
var Hospital = require('./../models/hospital');

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

    subirPorTipo(tipo, id, nombreArchivo, res);


});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    mensjae: 'Usuario no existe'
                })
            }

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error',
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;


            // si existe, eliminar imagen vieja
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo)
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActulizado) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar el usuario',
                        errors: { message: 'Error al actualizar img de usuario' }
                    });
                }
                usuarioActulizado.password = '';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActulizado
                });

            });

        });


    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    mensjae: 'medico no existe'
                })
            }

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error',
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // si existe, eliminar imagen vieja
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo)
            }

            medico.img = nombreArchivo;


            medico.save((err, medicoActulizado) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar el medico',
                        errors: { message: 'Error al actualizar img de medico' }
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActulizado
                });

            });

        });

    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    mensjae: 'hospital no existe'
                })
            }

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error',
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;



            // si existe, eliminar imagen vieja
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo)
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActulizado) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar el hospital',
                        errors: { message: 'Error al actualizar img de hospital' }
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActulizado
                });

            });

        });
    }


}

module.exports = app;