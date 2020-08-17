var socket = io();

var params = new URLSearchParams(window.location.search);

if (!params.has('nombre') || !params.has('sala')) {
    window.location = 'index.html';
    throw new Error('El nombre y/o la sala son necesarios');
}

var usuario = {
    nombre: params.get('nombre'),
    sala: params.get('sala')
};

socket.on('connect', function() {
    console.log('Conectado al servidor');

    socket.emit('entrarChat', usuario, function(resp) {
        //console.log('Usuarios conectados: ', resp);
        renderizarUsuarios(resp);
    });
});

socket.on('disconnect', function() {
    console.log('Perdimos la conexión con el servidor');
});

// Enviar información
/* socket.emit('crearMensaje', {
    nombre: 'Fernando',
    mensaje: 'Hola Mundo'
}, function(resp) {
    console.log('respuesta server: ', resp);
}); */

socket.on('crearMensaje', function(mensaje) {
    //console.log(mensaje);
    renderizarMensajes(mensaje, false);
    scrollBottom();

});

socket.on('listaPersona', function(personas) {
    renderizarUsuarios(personas);
    //console.log(personas);
});