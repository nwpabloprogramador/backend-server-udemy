var express = require('express');

var mdAutenticacion = require('./../middlewares/autenticacion');

var app = express();

var Medico = require('./../models/medico');

// ===================================
// Obtener todos los Medicos
// ===================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);


    Medico.find({})
        .populate('usuario', 'nombre email') // hacemos referencia al modelo
        .populate('hospital')
        .skip(desde)
        .limit(2)
        .exec(
            (err, medicos) => {

                if (err) {
                    return res.status(500).json({
                        ok: true,
                        mensaje: 'Error Cargando medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    })

                });

            })


});



// ===================================
// Actualizar Medico
// ===================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' No existe',
                errors: { message: 'No existe un medico con ese ID' }

            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err

                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado,
            });

        });

    });

});

// ===================================
// Crear un nuevo Medico
// ===================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital,
    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
        });

    });

});


// ===================================
// Borrar medico por id
// ===================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID',
                errors: { message: 'No existe medico ' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
        });

    });

});

module.exports = app;