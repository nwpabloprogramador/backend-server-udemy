var express = require('express');

var app = express()

var Hospital = require('./../models/hospital');
var Medico = require('./../models/medico');
var Usuario = require('./../models/usuario');


// =====================================
// Busqueda Buqueda especifica
// =====================================

app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {


    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;

    var expresionRegular = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {

        case 'usuarios':
            promesa = buscarUsuarios(busqueda, expresionRegular);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, expresionRegular);
            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, expresionRegular);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensajes: 'Los tipos de busqueda son son usuario, medicos y hospitales',
                error: { message: 'Tipo de coleccion no valido' }
            });
    }



    promesa.then(data => {
        res.status(201).json({
            ok: true,
            [tabla]: data
        });
    });

});




// =====================================
// Busqueda general
// =====================================

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var expresionRegular = new RegExp(busqueda, 'i'); // ingnoramos caseSesibility 

    // genero arreglo de promesas
    Promise.all([
            buscarHospitales(busqueda, expresionRegular),
            buscarMedicos(busqueda, expresionRegular),
            buscarUsuarios(busqueda, expresionRegular)
        ])
        .then(respuestas => { // me da como resultado un arreglo llamado respuestas

            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuario: respuestas[2]
            });

        });



});

// aca aabajo las promesas

function buscarHospitales(busqueda, expresionRegular) {

    return new Promise((resolve, reject) => {

        Hospital.find({ 'nombre': expresionRegular })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => { // buscar en el campo nombre

                if (err) {
                    reject('Error al buscar en hospitales', err);
                } else {
                    resolve(hospitales);
                }

            });

    });
}

function buscarMedicos(busqueda, expresionRegular) {

    return new Promise((resolve, reject) => {

        Medico.find({ 'nombre': expresionRegular })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => { //  buscar en el campo nobre

                if (err) {
                    reject('Error al buscar medicos', err);
                } else {
                    resolve(medicos);
                }

            });

    });
}

function buscarUsuarios(busqueda, expresionRegular) {

    return new Promise((resolve, reject) => {

        // buscar en varios campos
        Usuario.find({}, 'nombre email')
            .or([{ 'nombre': expresionRegular }, { 'email': expresionRegular }])
            .exec((err, usuarios) => { // ejecuto query

                if (err) {
                    reject('Error al buscar usuario', err)
                } else {
                    resolve(usuarios)
                }

            });

    });
}

module.exports = app;