var express = require('express');
var bcrypt = require('bcrypt'); // npm install bcrypt --save
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('./../middlewares/autenticacion');

// var SEED = require('./../config/config').SEED;

var app = express();



var Usuario = require('./../models/usuario');

// ===================================
// Obtener todos los usuario
// ===================================
app.get('/', mdAutenticacion.verificaToken, (req, res, next) => {

    Usuario.find({}, 'nombre email img role password') //  indico que campos mostrar
        .exec( // ejecute
            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: true,
                        mensaje: 'Error Cargando usuarios',
                        errors: err
                    });
                }


                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                })

            })


}); // ( request , response, next ) next que continue



// ===================================
// Actualizar Usuario
// ===================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' No existe',
                errors: { message: 'No existe un usuario con ese ID' }

            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err

                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado,
                usuarioToken: req.usuario, // esto viene del middleware
            });

        });

    });

});

// ===================================
// Crear un nuevo Usuario
// ===================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), // se necesita libreria bcrypt
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario, // esto viene del middleware
        });

    });

});


// ===================================
// Borrar usuario por id
// ===================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID',
                errors: { message: 'No existe usuario ' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado,
            usuarioToken: req.usuario, // esto viene del middleware
        });

    });

});

module.exports = app;