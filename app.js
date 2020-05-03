// Requires 
// cargar libreria
var express = require('express');
var mongoose = require('mongoose'); // buscar el npm install en internet
var bodyParser = require('body-parser') // buscar el npm install en internet

// inicializar variables
var app = express();

// body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

// conexion a la base de datos
mongoose.connect('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;
    console.log('hospitalDB \x1b[32m%s\x1b[0m', 'online');

});


// RUTAS
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// escuchar peticiones
app.listen(3000, () => {
    console.log('express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});