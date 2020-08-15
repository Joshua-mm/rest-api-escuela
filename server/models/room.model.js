const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const roomSchema = new Schema({

    nombre: { type: String, required: [true, 'El nombre de la clase es necesario'] },
    seccion: { type: String, required: false },
    tareas: { type: [{ id_tarea: Schema.Types.ObjectId }], ref: 'Tarea', required: false },
    avisos: { type: [{ id_aviso: Schema.Types.ObjectId }], ref: 'Aviso', required: false },
    maestro: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    alumnos: { type: [{ id_alumno: Schema.Types.ObjectId }], ref: 'Usuario', required: false }
});

module.exports = mongoose.model('Room', roomSchema);