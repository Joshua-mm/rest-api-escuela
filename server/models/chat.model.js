const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatSchema = new Schema({
    sala: { type: String, required: true },
    nombre: { type: String, required: true },
    mensaje: { type: String, required: true },
    hora: { type: String, required: true }
});

module.exports = mongoose.model('Chat', chatSchema);