const jwt = require('jsonwebtoken');

// --------------------------
// Verificar token
// --------------------------

let verificaToken = (req, res, next) => {

    let token = req.get('token'); /// Header

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'El token no es valido'
                }
            });
        }

        req.usuario = decoded.alumno;

        next();
    });
};

// -----------------------------------
// Verifica alumno rol
// -----------------------------------

let verificaAlumnoRole = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role === 'ALUMNO') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'No tienes permiso para acceder a esta función'
            }
        });
    }
};

// -----------------------------------
// Verifica maestro rol
// -----------------------------------

let verificaMaestroRole = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.role === 'MAESTRO') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'No tienes permiso para acceder a esta función'
            }
        });
    }
};

// -----------------------------------
// Verifica ADMIN rol
// -----------------------------------

let verificaAdminRole = (req, res, next) => {

    let usuario = req.usuario;

    console.log(usuario);

    if (usuario.role != 'ADMIN') {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'No tienes permiso para acceder a esta función'
            }
        });
    } else {
        next();
    }
};

module.exports = {
    verificaToken,
    verificaAlumnoRole,
    verificaMaestroRole,
    verificaAdminRole
}