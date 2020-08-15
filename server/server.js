// Implementación express
const express = require('express');
const app = express();

/// Configuración cors
const cors = require('cors');
app.use(cors());

// Implementación path
const path = require('path');
const publicPath = path.resolve(__dirname, '../public');

// Implementacion body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Rutas

app.use(require('./routes/usuario'));
app.use(require('./routes/login'));
app.use(require('./routes/sala'));

/// Configs

require('./config/config');

// Implementación base de datos
const mongoose = require('mongoose');

mongoose.connect(process.env.URLDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err, res) => {

    if (err) throw new Error(err);

    console.log('Database working !!!!');
});

// Server
app.use(express.static(publicPath));

app.listen(process.env.PORT, (err) => {

    if (err) {
        throw new Error(err);
    }

    console.log(`Server on port ${ process.env.PORT }`);
});