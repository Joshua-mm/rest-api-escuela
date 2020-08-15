const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const tareaSchema = new Schema({
    titulo: { type: String, required: [true, 'El titulo de la tarea es necesario'], default: 'Nueva Tarea' },
    descripcion: { type: String, required: false },
    fecha: { type: String, required: [true, 'La fecha es necesaria'] },
    fecha_terminado: { type: String, required: [true, 'La fecha de terminación es necesaria'], default: 'Sin fecha límite' },
    hora_terminado: { type: String, required: false },
    maestro: { type: Schema.Types.ObjectId, ref: 'Usuario', required: [true, 'El ID de la sala es necesario'] },
    sala: {type: Schema.Types.ObjectId, ref: 'Room', required: true}
});

module.exports = mongoose.model('Tarea', tareaSchema);