const express = require('express');
const app = express();

app.get('/', (req, res) => {

    res.json({
        ok: true,
        message: 'si'
    });
});

module.exports = app;