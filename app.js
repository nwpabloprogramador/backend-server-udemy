// Requires 
// cargar libreria
var express = require('express');
var mongoose = require('mongoose');

// declarar variables
var app = express();

// conexion a la base de datos
mongoose.connect('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;
    console.log('hospitalDB \x1b[32m%s\x1b[0m', 'online');

});

// importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');

// RUTAS
app.use('/usuario', usuarioRoutes);
app.use('/', appRoutes);

// escuchar peticiones
app.listen(3000, () => {
    console.log('express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});