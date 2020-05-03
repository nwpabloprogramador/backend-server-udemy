// npm install mongoose
var mongoose = require('mongoose');

// npm install mongoose-unique-validator
var uniqueValidator = require('mongoose-unique-validator');

// Controlar datos de roles
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
}

var Schema = mongoose.Schema;

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El Nombre es obligatorio'] },
    email: { type: String, unique: true, required: [true, 'El email es obligatorio'] },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos }
});

usuarioSchema.plugin(uniqueValidator, { message: ' {PATH} ya existe' })
module.exports = mongoose.model('Usuario', usuarioSchema);