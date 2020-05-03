var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var app = express();
var Usuario = require('./../models/usuario');

var SEED = require('./../config/config').SEED;

app.post('/', (req, res) => {

    var body = req.body; // capturamos la request

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email ',
                errors: err

            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) { // comparamos el id de la base con el que envio el usuario
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password ',
                errors: err

            });
        }

        // ahora a crear un token

        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // el token se puede usar por 4 horas

        usuarioDB.password = ':)';
        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            id: usuarioDB._id,
            token: token
        });

    });


});



module.exports = app;