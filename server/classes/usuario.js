const Usuario = require('../models/usuario.model');
const { JsonWebTokenError } = require('jsonwebtoken');

class Usuarios {

    constructor() {
        this.personas = [];
        this.mensajes = [];
        this.personasDB;
    }

    addPersona(id, nombre, sala) {

        let persona = {
            id,
            nombre,
            sala
        };

        this.personas.push(persona);

        return this.personas;
    }

    getPersona(id) {

        let persona = this.personas.filter(persona => persona.id === id)[0];

        return persona;
    }

    getPersonasPorSala(sala) {

        let personasEnSala = this.personas.filter(persona => persona.sala === sala);

        return personasEnSala;
    }

    borrarPersona(id) {
        let personaBorrar = this.getPersona(id);

        this.personas = this.personas.filter(persona => persona.id != id);

        return personaBorrar;
    }
}

module.exports = {
    Usuarios
}