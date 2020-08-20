const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.redirect(`/${ uuidv4() }`);
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});


module.exports = app;