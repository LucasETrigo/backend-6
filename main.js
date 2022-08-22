const express = require('express');

const { Server: HttpServer } = require('http');
const { Server: Socket } = require('socket.io');

const ContenedorMemoria = require('./ContenedorMemoria');
const ContenedorArchivo = require('./ContenedorArchivo');

const app = express();
const httpServer = new HttpServer(app);
const io = new Socket(httpServer);

const productosApi = new ContenedorMemoria();
const mensajesApi = new ContenedorArchivo('./mensajes.json');

io.on('connection', async (socket) => {
    console.log('Nuevo cliente conectado!');

    socket.emit('productos', productosApi.listarAll());

    socket.on('update', (producto) => {
        productosApi.guardar(producto);
        io.sockets.emit('productos', productosApi.listarAll());
    });

    socket.emit('mensajes', await mensajesApi.listarAll());

    socket.on('nuevoMensaje', async (mensaje) => {
        mensaje.fyh = new Date().toLocaleString();
        await mensajesApi.guardar(mensaje);
        io.sockets.emit('mensajes', await mensajesApi.listarAll());
    });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const PORT = process.env.PORT || 8080;
const connectedServer = httpServer.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
connectedServer.on('error', (error) =>
    console.log(`Error en servidor ${error}`)
);
