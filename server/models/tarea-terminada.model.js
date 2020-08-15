const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let tarea_terminada_schema = new Schema({
    titulo: { type: String, required: [true, 'El titulo es necesario'] },
    descripcion: { type: String, required: false },
    tarea: { type: Schema.Types.ObjectId, ref: 'Tarea', required: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    terminado: { type: Boolean, required: [true, 'El estado de la tarea es necesario'], default: false },
    archivo: { type: String, required: false },
    fecha: { type: String, required: [true, 'La fecha de terminación es necesaria'] }
});

module.exports = mongoose.model('TareaTerminada', tarea_terminada_schema);