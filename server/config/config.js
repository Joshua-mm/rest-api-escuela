// Configuración del puerto
process.env.PORT = process.env.PORT || 3000;

// Environment
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// JWT
process.env.SEED = process.env.SEED || 'secret';
process.env.CADUCIDAD = '43800h';

// Base de datos

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/escuela';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;