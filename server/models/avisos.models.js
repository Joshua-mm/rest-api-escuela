const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const avisoSchema = new Schema({

    titulo: { type: String, required: [true, 'El título del nuevo aviso es necesario'], default: 'Nuevo Aviso' },
    descripcion: { type: String, required: false },
    fecha: { type: Date, required: [true, 'La fecha es necesaria'] },
    maestro: { type: Schema.Types.ObjectId, ref: 'Usuario', required: [true, 'El ID del profesor a cargo de la clase es necesario'] }
});

module.exports = mongoose.model('Aviso', avisoSchema);