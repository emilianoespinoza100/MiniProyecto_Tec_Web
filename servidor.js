const express = require('express');
const path = require('path');
const app = express();

// Servir archivos estáticos en la misma carpeta
app.use(express.static(__dirname));

// Ruta para servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
