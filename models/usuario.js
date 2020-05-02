var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var usuarioSchema = new Schema({
    nombre: { type: String, require: [true, 'El Nombre es obligatorio'] },
    email: { type: String, unique: true, require: [true, 'El email es obligatorio'] },
    password: { type: String, require: [true, 'La contraseña es necesaria'] },
    img: { type: String, require: false },
    role: { type: String, require: true, default: 'USER_ROLE' }
});

module.exports = mongoose.model('Usuario', usuarioSchema);