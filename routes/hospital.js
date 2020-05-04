var express = require('express');

var mdAutenticacion = require('./../middlewares/autenticacion');

// var SEED = require('./../config/config').SEED;

var app = express();

var Hospital = require('./../models/hospital');

// ===================================
// Obtener todos los hospitales
// ===================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .populate('usuario', 'nombre email') // llamo a los datos del usuario que creo el hospital especifico los campos requeridos
        .skip(desde)
        .limit(5)
        .exec( // ejecute
            (err, hospitales) => {

                if (err) {
                    return res.status(500).json({
                        ok: true,
                        mensaje: 'Error Cargando usuarios',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });

                });

            })


}); // ( request , response, next ) next que continue



// ===================================
// Actualizar Hospital
// ===================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el Hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' No existe',
                errors: { message: 'No existe un hospital con ese ID' }

            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err

                });
            }


            res.status(200).json({
                ok: true,
                usuahospital: hospitalGuardado,
            });

        });

    });

});

// ===================================
// Crear un nuevo Hospital
// ===================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,

    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el Hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
        });

    });

});


// ===================================
// Borrar hospital por id
// ===================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe un hospital con ese ID',
                errors: { message: 'No existe hospital ' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado,
        });

    });

});

module.exports = app;