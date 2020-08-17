const express = require('express');
const app = express();
const Usuario = require('../models/usuario.model');
const { verificaToken } = require('../middlewares/autenticacion')

const { Usuarios } = require('../classes/usuario');
const { crearMensaje } = require('../utils/utilidades');
const usuarios = new Usuarios();
const Chat = require('../models/chat.model');


app.get('/chat', verificaToken, (req, res) => {

    //res.redirect('http://localhost:3000/chat.html');

    let usuarioToken = req.usuario;

    Usuario.find({ _id: usuarioToken._id })
        .populate({
            path: 'salas.id_sala',
            model: 'Sala'
        })
        .exec((err, usuario) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            const usuariosDB = usuario;
        });

    console.log(usuariosDB);
    return;

    const { io } = require('../server');
    io.on('connection', (client) => {

        client.on('entrarChat', (usuario, callback) => {



            client.join(usuario.sala);
            usuarios.addPersona(client.id, usuario.nombre, usuario.sala);

            client.broadcast.to(usuario.sala).emit('listaPersona', usuarios.getPersonasPorSala(usuario.sala));
            client.broadcast.to(usuario.sala).emit('crearMensaje', crearMensaje('Administrador', `${ usuario.nombre } se ha unido al chat.`));
            callback(usuarios.getPersonasPorSala(usuario.sala));
        });

        client.on('crearMensaje', (data, callback) => {

            console.log(data);

            let fecha = new Date();
            let hora = fecha.getHours() + ':' + fecha.getMinutes();

            let persona = usuarios.getPersona(client.id);

            let mensaje = crearMensaje(persona.nombre, data.mensaje);

            client.broadcast.to(data.sala).emit('crearMensaje', mensaje);

            let dataMensaje = new Chat({
                sala: data.sala,
                nombre: persona.nombre,
                mensaje: data.mensaje,
                hora
            });

            console.log(dataMensaje);
            callback(mensaje);
        });

        client.on('disconnect', () => {

            let persona = usuarios.borrarPersona(client.id);
            client.broadcast.to(persona.sala).emit('crearMensaje', crearMensaje('Administrador', `${ persona.nombre } abandonó el chat.`));
            client.broadcast.to(persona.sala).emit('listaPersona', usuarios.getPersonasPorSala(persona.sala));
        });
    });

});

module.exports = app;