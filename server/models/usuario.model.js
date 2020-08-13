const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let rolesValidos = {
    values: ['ALUMNO', 'MAESTRO', 'ADMIN'],
    message: '{VALUE} no es un rol válido'
}

let usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    matricula: { type: String, required: [true, 'La matricula es necesaria'], unique: true },
    edad: { type: Number, required: [true, 'La edad es necesaria'] },
    fecha_inscripcion: { type: String, required: false },
    direccion: { type: String, required: false },
    numero: { type: Number, required: false },
    numero_tutor: { type: Number, required: [true, 'El número telefónico del tutor es necesario'] },
    nombre_tutor: { type: String, required: [true, 'El nombre del tutor es necesario'] },
    pago_mensual: { type: Number, required: [true, 'El pago mensual del alumno es necesario'], },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    estado: { type: Boolean, required: true, default: true },
    role: { type: String, required: true, default: 'ALUMNO', enum: rolesValidos }
});

/* usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
} */

module.exports = mongoose.model('Usuario', usuarioSchema);