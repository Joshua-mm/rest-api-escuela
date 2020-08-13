const express = require('express');
const app = express();

const bcrypt = require('bcrypt');

const Usuario = require('../models/usuario.model');

const _ = require('underscore');

const { verificaToken, verificaAlumnoRole, verificaMaestroRole, verificaAdminRole } = require('../middlewares/autenticacion');

// ------------------------------
// Obtener todos los alumnos
// ------------------------------

app.get('/usuarios', [verificaToken, verificaAdminRole], (req, res) => {

    let desde = req.query.desde || 0;
    let hasta = req.query.hasta || 10;

    desde = Number(desde);
    hasta = Number(hasta);

    Usuario.find({})
        .skip(desde)
        .limit(hasta)
        .exec((err, alumnos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (alumnos.length === 0) {
                return res.json({
                    ok: true,
                    message: 'No hay alúmnos para mostrar',
                    alumnos
                });
            }

            res.json({
                ok: true,
                alumnos
            });
        });
});

// ----------------------------------------------
// Obtener información de un usuario mediante su ID
// ----------------------------------------------

app.get('/usuario', [verificaToken], (req, res) => {

    let usuario = req.usuario._id;

    Usuario.findById(usuario, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});


// ------------------------------
// Crear un nuevo alumno
// ------------------------------

app.post('/usuario', (req, res) => {

    let body = req.body;

    usuario = new Usuario({
        nombre: body.nombre,
        matricula: body.matricula,
        edad: body.edad,
        fecha_inscripcion: body.fecha_inscripcion,
        direccion: body.direccion,
        numero: body.numero,
        numero_tutor: body.numero_tutor,
        nombre_tutor: body.nombre_tutor,
        pago_mensual: body.pago_mensual,
        password: body.password, //bcrypt.hashSync(body.password, 10),
        estado: body.estado,
        role: body.role
    });

    usuario.save((err, alumno) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            alumno
        });
    });

});

// ----------------------------------------
// Editar datos del propio usuario logeado
// ----------------------------------------

app.put('/usuario', verificaToken, (req, res) => {

    let usuario_id = req.usuario._id;

    let body = req.body;

    let update = _.pick(body, ['nombre', 'edad', 'direccion', 'numero', 'numero_tutor', 'nombre_tutor', 'pago_mensual', 'estado']);

    Usuario.findByIdAndUpdate(usuario_id, update, { new: true, runValidators: true }, (err, usuario) => {
        if (err) {
            res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario
        });
    });
});

// ------------------------------------------------
// Actualizar cualquier usuario siendo administrador
// ------------------------------------------------

app.put('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let body = req.body;
    let id = req.params.id;

    let update = {
        nombre: body.nombre,
        matricula: body.matricula,
        edad: body.edad,
        fecha_inscripcion: body.fecha_inscripcion,
        direccion: body.direccion,
        numero: body.numero,
        numero_tutor: body.numero_tutor,
        nombre_tutor: body.nombre_tutor,
        pago_mensual: body.pago_mensual,
        password: body.password, //bcrypt.hashSync(body.password, 10),
        estado: body.estado,
        role: body.role
    }

    Usuario.findByIdAndUpdate(id, update, { new: true, runValidators: true }, (err, usuario) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario
        });
    });
});

// ------------------------------------------------
// Desactivar cualquier usuario siendo administrador
// ------------------------------------------------

app.delete('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id;

    let update = {
        estado: false
    }

    Usuario.findByIdAndUpdate(id, update, { new: true }, (err, usuario) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario
        });
    });
});

module.exports = app;