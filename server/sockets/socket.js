const express = require('express');
const app = express();
const Usuario = require('../models/usuario.model');
const { verificaToken } = require('../middlewares/autenticacion')

const { Usuarios } = require('../classes/usuario');
const { crearMensaje } = require('../utils/utilidades');
const usuarios = new Usuarios();
const Chat = require('../models/chat.model');
const { find } = require('../models/usuario.model');

process.env.NOMBRE;
process.env.SALA;



app.get('/chat', verificaToken, (req, res) => {

    //res.redirect('http://localhost:3000/chat.html');

    let usuarioToken = req.usuario;

    Usuario.findById(usuarioToken._id)
        .populate({
            path: 'salas.id_sala',
            model: 'Room'
        })
        .exec((err, usuario) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            let nombreSala = usuario.salas[1].id_sala.nombre;

            const { io } = require('../server');
            io.on('connection', (client) => {

                client.on('entrarChat', (usuario, callback) => {

                    client.join(nombreSala);
                    usuarios.addPersona(req.usuario._id, req.usuario.nombre, nombreSala);

                    client.broadcast.to(nombreSala).emit('listaPersona', usuarios.getPersonasPorSala(nombreSala));
                    client.broadcast.to(nombreSala).emit('crearMensaje', crearMensaje('Administrador', `${ req.usuario.nombre } se ha unido al chat.`));
                    callback(usuarios.getPersonasPorSala(nombreSala));
                });

                client.on('crearMensaje', (data, callback) => {

                    console.log(data);

                    let fecha = new Date();
                    let hora = fecha.getHours() + ':' + fecha.getMinutes();

                    let persona = usuarios.getPersona(req.usuario._id);

                    let mensaje = crearMensaje(req.usuario.nombre, data.mensaje);

                    client.broadcast.to(nombreSala).emit('crearMensaje', mensaje);

                    let dataMensaje = new Chat({
                        sala: nombreSala,
                        nombre: req.usuario.nombre,
                        mensaje: data.mensaje,
                        hora
                    });

                    process.env.NOMBRE = req.usuario.nombre;
                    process.env.SALA = nombreSala;
                    console.log(dataMensaje);
                    callback(mensaje);
                });

                client.on('disconnect', () => {

                    let persona = usuarios.borrarPersona(req.usuario._id);
                    client.broadcast.to(nombreSala).emit('crearMensaje', crearMensaje('Administrador', `${ req.usuario.nombre } abandonó el chat.`));
                    client.broadcast.to(nombreSala).emit('listaPersona', usuarios.getPersonasPorSala(nombreSala));
                });
            });

        });
});

module.exports = app;