const express = require('express');
const app = express();

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario.model');

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ matricula: body.matricula, password: body.password }, (err, alumnoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!alumnoDB) {
            return res.status(400).json({
                ok: false,
                message: 'La matricula y/o la contraseña son incorrectos'
            });
        }

        let token = jwt.sign({
            alumno: alumnoDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD });

        res.json({
            ok: true,
            message: 'Login exitoso',
            alumno: alumnoDB,
            token
        });
    });
});

module.exports = app;