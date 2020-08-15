const express = require('express');
const app = express();
const Room = require('../models/room.model');
const Usuario = require('../models/usuario.model');
const Tarea = require('../models/tareas.model');
const Aviso = require('../models/avisos.models');
const TareaTerminada = require('../models/tarea-terminada.model');
const { verificaToken, verificaAlumnoRole, verificaMaestroRole, verificaAdminRole } = require('../middlewares/autenticacion');
let alumnos = [];
let tareas = [];
process.env.TAREAS = [];
const _ = require('underscore');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

/// ---------------------------------------------------------------------------------
/// Crear una nueva sala, Solo maestros o administradores tienen acceso a esta funcion
/// ---------------------------------------------------------------------------------

app.post('/room', [verificaToken, verificaMaestroRole || verificaAdminRole], (req, res) => {

    let body = req.body;
    let usuario_id = req.usuario._id;

    let room = new Room({
        nombre: body.nombre,
        seccion: body.seccion,
        maestro: usuario_id,
        alumnos: []
    });

    room.save((err, room) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        Usuario.findByIdAndUpdate(room.maestro, { $push: { salas: { id_sala: room._id } } }, (err, usuario) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                room
            });
        });
    });
});

/// -----------------------------------------------------------------
/// Unirse a una sala, solo alumnos podran acceder a esta funcion
/// -----------------------------------------------------------------

app.post('/sala', [verificaToken, verificaAlumnoRole], (req, res) => {

    let body = req.body;

    let sala_id = body.sala_id;

    Room.findByIdAndUpdate(sala_id, { $push: { alumnos: { id_alumno: req.usuario._id } } }, (err, roomDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        Usuario.findByIdAndUpdate(req.usuario._id, { $push: { salas: { id_sala: roomDB._id } } }, (err, usuario) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                sala: roomDB,
                usuario
            });
        });

    });
});

/// ------------------------------------------------------------------------------
//// Crear una nueva tarea. Solo los maestros creadores de la sala podrán hacerlo
// -------------------------------------------------------------------------------

app.post('/tarea', [verificaToken, verificaMaestroRole], (req, res) => {

    let body = req.body;

    let usuario_id = req.usuario._id;

    let fecha = new Date(body.fecha_terminado).toISOString().substring(0, 10);

    let fecha_si = fecha.split('-').join('');

    Room.findOne({ maestro: usuario_id }, (err, room) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        let tarea = new Tarea({
            titulo: body.titulo,
            descripcion: body.descripcion,
            fecha: new Date().toISOString().substring(0, 10),
            fecha_terminado: fecha,
            hora_terminado: body.hora_terminado,
            maestro: req.usuario._id,
            sala: body.sala
        });

        tarea.save((err, tarea) => {
            if (err) {
                return res.status(400), json({
                    ok: false,
                    err
                });
            }

            Room.findByIdAndUpdate(room._id, { $push: { tareas: { id_tarea: tarea._id } } }, (err, roomDB) => {

                if (err) {
                    return res.status(400), json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    tareas,
                    roomDB
                });
            });
        });
    });
});

// --------------------------------------------
// Obtener todas las salas de un alumno logeado
// --------------------------------------------

app.get('/salas_alumno', verificaToken, (req, res) => {


    Room.find({ 'alumnos.id_alumno': req.usuario._id })
        .populate({
            path: 'tareas.id_tarea',
            model: 'Tarea'
        })
        .populate('maestro', 'nombre matricula')
        .populate({
            path: 'alumnos.id_alumno',
            model: 'Usuario'
        })
        .exec((err, rooms) => {


            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                rooms
            });
        });
});

// --------------------------------------------
// Obtener todas las salas de un maestro logeado
// --------------------------------------------

app.get('/salas_maestro', [verificaToken, verificaMaestroRole], (req, res) => {


    Room.find({ maestro: req.usuario._id })
        .populate({
            path: 'tareas.id_tarea',
            model: 'Tarea'
        })
        .populate('maestro', 'nombre matricula')
        .populate({
            path: 'alumnos.id_alumno',
            model: 'Usuario'
        })
        .exec((err, rooms) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                rooms
            });
        });
});

// -----------------------------------------------------------
// Obtener todas las salas, solo administradores podrán acceder 
// -----------------------------------------------------------

app.get('/salas_admin', [verificaToken, verificaAdminRole], (req, res) => {

    Room.find({})
        .populate('maestro', 'nombre, matricula')
        .populate({
            path: 'tareas.id_tarea',
            model: 'Tarea'
        })
        .populate({
            path: 'alumnos.id_alumno',
            model: 'Usuario'
        })
        .exec((err, rooms) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                rooms
            });
        });
});

// --------------------------------------------------------------------------
// Editar una sala. Solo el maestro de esa clase podrá acceder a esta función
// ---------------------------------------------------------------------------

app.put('/sala/:sala_id', [verificaToken, verificaMaestroRole], (req, res) => {

    let body = req.body;
    let sala_id = req.params.sala_id;

    let update = _.pick(body, ['nombre', 'seccion']);

    Room.findByIdAndUpdate(sala_id, update, { new: true, runValidators: true }, (err, room) => {

        if (room.maestro != req.usuario._id) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'No tienes permiso para acceder a esta sala'
                }
            });
        }

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            room
        });
    });
});

// ------------------------------------------------------
// Salirse de una clase
// ------------------------------------------------------

app.delete('/sala_alumno/:sala_id', [verificaToken, verificaAlumnoRole], (req, res) => {

    let sala_id = req.params.sala_id;

    Usuario.findByIdAndUpdate(req.usuario._id, { $pull: { salas: { id_sala: sala_id } } }, (err, usuario) => {

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Something went wrong'
                }
            });
        }

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        Room.findByIdAndUpdate(sala_id, { $pull: { alumnos: { id_alumno: req.usuario._id } } }, (err, room) => {

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
});

// ---------------------------------------------------------
// Eliminar un alumno. Solo el maestro a cargo podrá hacerlo
// ---------------------------------------------------------

app.delete('/sala_maestro/:id_alumno/:id_sala', [verificaToken, verificaMaestroRole], (req, res) => {

    let alumno_id = req.params.id_alumno;
    let sala_id = req.params.id_sala;



    Room.findByIdAndUpdate(sala_id, { $pull: { alumnos: { id_alumno: alumno_id } } }, (err, room) => {

        if (room.maestro != req.usuario._id) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'No tienes permiso para acceder a las funciones de esta sala'
                }
            });
        }

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        Usuario.findByIdAndUpdate(alumno_id, { $pull: { salas: { id_sala: sala_id } } }, (err, usuario) => {

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
});

// -------------------------------------------------------------
// Actualizar una tarea
// -------------------------------------------------------------

app.put('/tarea/:id_tarea', [verificaToken, verificaMaestroRole], (req, res) => {

    let body = req.body;
    let tarea_id = req.params.id_tarea;
    let update = _.pick(body, ['titulo', 'descripcion', 'fecha_terminado', 'hora_terminado']);

    Tarea.findByIdAndUpdate(tarea_id, update, { new: true, runValidators: true }, (err, tarea) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            tarea
        });
    });

});

// -------------------------------------------------------------
// Borrar una tarea
// -------------------------------------------------------------

app.delete('/tarea/:tarea_id/:sala_id', [verificaToken, verificaMaestroRole], (req, res) => {

    let tarea_id = req.params.tarea_id;
    let sala_id = req.params.sala_id;

    Room.findByIdAndUpdate(sala_id, { $pull: { tareas: { id_tarea: tarea_id } } }, (err, room) => {

        if (room.maestro != req.usuario._id) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'No tienes permiso para acceder a las funciones de esta sala'
                }
            });
        }

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        Tarea.findByIdAndRemove(tarea_id, (err, tareaDB) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                tarea: tareaDB
            });
        });
    });
});

// --------------------------------------------------------------------------------------
// Entregar una tarea - Se tendrá que pasar el archivo por el body con el nombre 'archivo'
// -------------------------------------------------------------------------------------

app.use(fileUpload({ useTempFiles: true }));

app.post('/subir_tarea/:id_tarea', [verificaToken, verificaAlumnoRole], (req, res) => {

    let tarea_id = req.params.id_tarea;
    let body = req.body;

    let fecha = new Date().toISOString().substring(0, 10);

    if (req.files) {

        let archivo = req.files.archivo; /// se pasará por el body el nombre archivo
        let nombreCortado = archivo.name.split('.');
        let extension = nombreCortado[nombreCortado.length - 1];

        let nombreArchivo = `${req.usuario._id}-${new Date().getMilliseconds()}.${extension}`;


        archivo.mv(`uploads/tareas/${nombreArchivo}`, (err) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            /// Imagen guardada

            imagenTarea(tarea_id, res, nombreArchivo, req, fecha);
        });

    } else {

        let tareat = new TareaTerminada({
            titulo: req.body.titulo,
            descripcion: req.body.descripcion,
            tarea: tarea_id,
            usuario: req.usuario._id,
            terminado: true,
            fecha
        });

        tareat.save((err, tarea) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                tarea
            })
        });
    }

});

function imagenTarea(id, res, nombreArchivo, req, fecha) {

    let tareat = new TareaTerminada({
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        tarea: id,
        usuario: req.usuario._id,
        terminado: true,
        archivo: nombreArchivo,
        fecha
    });

    tareat.save((err, tareaGuardada) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            tarea: tareaGuardada,
            archivo: nombreArchivo
        });
    });
}

// ---------------------------------------------------------
// Obtener todos los usuarios que entregaron una tarea
// ---------------------------------------------------------

app.get('/tareas_terminadas/:tarea_id', [verificaToken, verificaMaestroRole], (req, res) => {

    let tarea_id = req.params.tarea_id;

    TareaTerminada.find({ tarea: tarea_id })
        .populate('tarea', 'titulo descripcion fecha_terminado')
        .populate('usuario', 'nombre matricula')
        .exec((err, tarea) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                tarea
            });
        });
});

/////////////////////// Avisos //////////////////////////////////

app.post('/aviso', [verificaToken, verificaMaestroRole], (req, res) => {

    let body = req.body;

    let fecha = new Date().toISOString().substring(0, 10);

    let aviso = new Aviso({
        titulo: body.titulo,
        descripcion: body.descripcion,
        fecha,
        maestro: req.usuario._id
    });

    aviso.save((err, aviso) => {

    });
});

module.exports = app;