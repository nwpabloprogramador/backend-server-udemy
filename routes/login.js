var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

//  google
var CLIENT_ID = require('./../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library'); // npm install google-auth-library --save
const client = new OAuth2Client(CLIENT_ID); // agregar esto al cofig.js

var app = express();
var Usuario = require('./../models/usuario');

var SEED = require('./../config/config').SEED;

// =================================
// Autenticacion con Google
// =================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        google: true,
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        // payload: payload info que pasa google

    }
}


app.post('/google', async(req, res) => {


    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no valido'
            });
        });



    // Guardamos el usuario de google como nuevo en nuestra DB

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'error al registar usuario de base de datos',
            });
        }

        // pregunto si ya existe
        if (usuarioDB) {

            if (usuarioDB.google === false) { // si el usuario no fue creado al loguearse con google

                return res.status(400).json({
                    ok: true,
                    mensaje: 'Debe usuar su login normal y no de google',
                });

            } else {

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // el token se puede usar por 4 horas

                usuarioDB.password = ':)))))';
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    id: usuarioDB._id,
                    token: token
                });
            }

        } else {

            // el usuario se logueo con una cuenta de google y no existe en nuestra DB paso a crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = 'XD';

            usuario.save((err, usuarioDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: true,
                        mensaje: 'Debe usuar su login normal y no de google',
                    });
                }

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // el token se puede usar por 4 horas

                usuarioDB.password = 'xD';
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    id: usuarioDB._id,
                    token: token
                });

            });
        }

    });

    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'Petición realizada correctamente',
    //     googleUser: googleUser
    // });

});

// =================================
// Autenticacion normal
// =================================

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