const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json()); 

const { MongoClient, ObjectId } = require('mongodb');  
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const url = require('url');

//aqui el socket para comunicar
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());                         
app.use(express.json());               

const uri = "mongodb://localhost:27017";   
const client = new MongoClient(uri);      

let db;                                  
let coleccionUsuarios;  
let coleccionAnuncios;  
let coleccionReglas;       
let coleccionPagos;
let coleccionMensajes;
let coleccionChats;

let tokensRecuperacion = {}; 

async function conectarDB() {
  try {
    await client.connect();                
    console.log('Conectado a MongoDB exitosamente');
    
    db = client.db("DBSeguridadFraccionaria");     
    
    coleccionUsuarios = db.collection("DatosUsuarios");   
    coleccionAnuncios = db.collection("Anuncios");
    coleccionReglas = db.collection("ReglasUnidad");
    coleccionPagos = db.collection("Pagos");
    coleccionMensajes = db.collection("Mensajes");
    coleccionChats = db.collection("Chats");

    console.log('Base de datos y colección configuradas');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1); 
  }
}

conectarDB().then(() => {
  server.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
    console.log('Base de datos conectada y lista');
  });
});                           

app.get('/', (req, res) => {
  res.send('API de AplicacionTareas funcionando');
});


//Rutas para el manejo de la informacion de los usuarios
app.post('/login', async (req, res) => {
  const { email, password } = req.body; 
  try {
    const usuario = await coleccionUsuarios.findOne({ 
      email, 
      password
    });
    console.log('Usuario encontrado:', usuario);
    if (usuario) {
      res.json({
        success: true, 
        id: usuario._id, 
        tipoUsuario: usuario.TipoUsuario 
      });
    } else {
      res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ mensaje: 'Error en el login' });
  }
});

app.post('/agregarUsuarios', async (req, res) => {
  console.log('Datos recibidos en /añadirUsuarios:', req.body);
  const { NombreCompleto, Edificio, Departamento, Telefono, email, password, TipoUsuario, Ine } = req.body;
  try {
    const nuevoUsuario = {
      NombreCompleto,
      Edificio,
      Departamento,
      Telefono,
      email,
      password,
      TipoUsuario,
      Ine
    };
    const resultado = await coleccionUsuarios.insertOne(nuevoUsuario);
    console.log('Usuario añadido con ID:', resultado.insertedId);
    res.status(201).json({ _id: resultado.insertedId, ...nuevoUsuario });
  } catch (error) {
    console.error('Error añadiendo usuario:', error);
    res.status(500).json({ mensaje: 'Error añadiendo usuario' });
  }
});

app.post('/editarUsuario', async (req, res) => {
  const { id, NombreCompleto, Edificio, Departamento, Telefono, email, password, TipoUsuario, Ine } = req.body;
  try {
    const resultado = await coleccionUsuarios.updateOne(
      { _id: new ObjectId(id) },
      { $set: { NombreCompleto, Edificio, Departamento, Telefono, email, password, TipoUsuario, Ine } }
    );
    console.log('Usuario editado:', resultado);
    res.status(200).json({ mensaje: 'Usuario editado correctamente' });
  } catch (error) {
    console.error('Error editando usuario:', error);
    res.status(500).json({ mensaje: 'Error editando usuario' });
  }
});

app.get('/verUsuarios', async (req, res) => {
  try {
    const usuarios = await coleccionUsuarios.find({}).toArray();
    res.json(usuarios);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).send('Error obteniendo usuarios');
  }
});

app.get('/nombresUsuario', async (req, res) => {
  try {
    // Devuelve un array de objetos con _id y NombreCompleto
    const usuarios = await coleccionUsuarios.find({}, { projection: { _id: 1, NombreCompleto: 1 } }).toArray();
    // Renombra el campo para el frontend
    const resultado = usuarios.map(u => ({
      _id: u._id.toString(),
      nombre: u.NombreCompleto
    }));
    res.json(resultado);
  } catch (error) {
    console.error('Error obteniendo nombres de usuario:', error);
    res.status(500).send('Error obteniendo nombres de usuario');
  }
});

app.post('/eliminarUsuario', async (req, res) => {
  const { id } = req.body;
  try {
    // 1. Busca el usuario para obtener la URL de la imagen
    const usuario = await coleccionUsuarios.findOne({ _id: new ObjectId(id) });

    // 2. Elimina la imagen si existe
    if (usuario && usuario.Ine) {
      const parsedUrl = url.parse(usuario.Ine);
      const filename = path.basename(parsedUrl.pathname);
      const filePath = path.join(__dirname, 'imagenesIne', filename);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.warn('No se pudo eliminar la imagen:', err.message);
        } else {
          console.log('Imagen eliminada:', filePath);
        }
      });
    }

    // 3. Elimina el usuario de la base de datos
    await coleccionUsuarios.deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error eliminando usuario' });
  }
});

//Rutas para el manejo de la informacion de los anuncios
app.get('/verAnuncios', async (req, res) => {
  try {
    const anuncios = await coleccionAnuncios.find({}).toArray();
    res.json(anuncios);
  } catch (error) {
    console.error('Error obteniendo anuncios:', error);
    res.status(500).send('Error obteniendo anuncios');
  }
}); 

app.get('/verAnunciosResidente/:nombreEdificio', async (req, res) => {
  const { nombreEdificio } = req.params;
  try {
    const anuncios = await coleccionAnuncios.find({
      $or: [
        { tipo: 'General' },
        { tipo: 'Edificio', nombreEdificio }
      ]
    }).toArray();
    res.json(anuncios);
  } catch (error) {
    console.error('Error obteniendo anuncios para residente:', error);
    res.status(500).send('Error obteniendo anuncios para residente');
  }
});


app.get('/verResidente/:idResidente', async (req, res) => {
  const { idResidente } = req.params;
  try {
    const residente = await coleccionUsuarios.findOne({ _id: new ObjectId(idResidente) });
    res.json(residente);
  } catch (error) {
    res.status(500).send('Error obteniendo residente');
  }
});

app.post('/agregarAnuncio', async (req, res) => {
  const { titulo, contenido, tipo, nombreEdificio, fechaEnvio, programado, fechaProgramada, idAdmin } = req.body;
  try {
    const nuevoAnuncio = {
      titulo,
      contenido,
      tipo,
      nombreEdificio,
      fechaEnvio,
      programado,
      fechaProgramada,
      idAdmin
    };
    const resultado = await coleccionAnuncios.insertOne(nuevoAnuncio);
    console.log('Anuncio añadido con ID:', resultado.insertedId);
    res.status(201).json({ _id: resultado.insertedId, ...nuevoAnuncio });
  } catch (error) {
    console.error('Error añadiendo anuncio:', error);
    res.status(500).json({ mensaje: 'Error añadiendo anuncio' });
  }
});

app.post('/editarAnuncio', async (req, res) => {
  const { id, titulo, contenido, tipo, nombreEdificio, fechaEnvio, programado, fechaProgramada, idAdmin } = req.body;
  try {
    const resultado = await coleccionAnuncios.updateOne(
      { _id: new ObjectId(id) },
      { $set: { titulo, contenido, tipo, nombreEdificio, fechaEnvio, programado, fechaProgramada, idAdmin } }
    );
    console.log('Anuncio editado:', resultado);
    res.status(200).json({ mensaje: 'Anuncio editado correctamente' });
  } catch (error) {
    console.error('Error editando anuncio:', error);
    res.status(500).json({ mensaje: 'Error editando anuncio' });
  }
});

app.post('/eliminarAnuncio', async (req, res) => {
  const { id } = req.body;
  try {
    const resultado = await coleccionAnuncios.deleteOne({ _id: new ObjectId(id) });
    console.log('Anuncio eliminado:', resultado);
    res.status(200).json({ mensaje: 'Anuncio eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando anuncio:', error);
    res.status(500).json({ mensaje: 'Error eliminando anuncio' });
  }
});


app.get('/verEdificios', async (req, res) => {
  try {
    const edificios = await coleccionUsuarios.distinct('Edificio');
    res.json(edificios);
  } catch (error) {
    console.error('Error obteniendo edificios:', error);
    res.status(500).send('Error obteniendo edificios');
  }
});

//rutas para el manejo de la informacion de las reglas

app.get('/verReglas', async (req, res) => {
  try {
    const reglamento = await coleccionReglas.find({}).toArray();
    res.json(reglamento);
  } catch (error) {
    console.error('Error obteniendo reglamento de unidad:', error);
    res.status(500).send('Error obteniendo reglamento de unidad');
  }
});

app.post('/agregarRegla', async (req, res) => {
  const { regla } = req.body;
  try {
    const nuevaRegla = { regla };
    const resultado = await coleccionReglas.insertOne(nuevaRegla);
    console.log('Regla añadida con ID:', resultado.insertedId);
    res.status(201).json({ _id: resultado.insertedId, ...nuevaRegla });
  } catch (error) {
    console.error('Error añadiendo regla:', error);
    res.status(500).json({ mensaje: 'Error añadiendo regla' });
  }
});

app.post('/editarRegla', async (req, res) => {
  const { id, regla } = req.body;
  try {
    const resultado = await coleccionReglas.updateOne(
      { _id: new ObjectId(id) },
      { $set: { regla } }
    );
    console.log('Regla editada:', resultado);
    res.status(200).json({ mensaje: 'Regla editada correctamente' });
  } catch (error) {
    console.error('Error editando regla:', error);
    res.status(500).json({ mensaje: 'Error editando regla' });
  }
});

app.post('/eliminarRegla', async (req, res) => {
  const { id } = req.body;
  try {
    const resultado = await coleccionReglas.deleteOne({ _id: new ObjectId(id) });
    console.log('Regla eliminada:', resultado);
    res.status(200).json({ mensaje: 'Regla eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando regla:', error);
    res.status(500).json({ mensaje: 'Error eliminando regla' });
  }
});


//rutas para el manejo de la informacion de los chats

app.get('/verChats', async (req, res) => {
  try {
    const chats = await db.collection('Chats').find({}).toArray();
    res.json(chats);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error obteniendo chats' });
  }
});

app.get('/verChatsUsuario/:idUsuario', async (req, res) => {
  const { idUsuario } = req.params;
  try {
    const chats = await db.collection('Chats').find({ usuarios: idUsuario }).toArray();
    res.json(chats);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error obteniendo chats del usuario' });
  }
});

app.post('/crearChat', async (req, res) => {
  const { tipo, nombreEdificio, usuarios } = req.body;
  try {
    const chat = {
      tipo,
      nombreEdificio: tipo === "edificio" ? nombreEdificio : null,
      usuarios: (tipo === "privado" || tipo === "edificio")
        ? (usuarios || []).map(id => new ObjectId(id))
        : [],
      fechaCreacion: new Date()
    };
    const resultado = await db.collection('Chats').insertOne(chat);
    res.status(201).json({ _id: resultado.insertedId, ...chat });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error creando chat' });
  }
});

app.post('/eliminarChat', async (req, res) => {
  const { id } = req.body;
  try {
    const resultado = await db.collection('Chats').deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ mensaje: 'Chat eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error eliminando chat' });
  }
});

//Rutas para los pagos xxdxdxd

app.post('/agregarPago', async (req, res) => {
  const {
    edificio,
    departamento,
    idUsuario,
    nombreUsuario,
    tipoPago,
    metodoPago,
    monto,
    fechaPago,
    vigencia,
    estatus,
    procesadoPor,
    referenciaStripe
  } = req.body;

  try {
    const nuevoPago = {
      edificio,
      departamento,
      idUsuario: new ObjectId(idUsuario),
      nombreUsuario,
      tipoPago,
      metodoPago,
      monto,
      fechaPago: new Date(fechaPago),
      vigencia: new Date(vigencia),
      estatus,
      procesadoPor,
      referenciaStripe
    };
    const resultado = await db.collection('Pagos').insertOne(nuevoPago);
    res.status(201).json({ _id: resultado.insertedId, ...nuevoPago });
  } catch (error) {
    console.error('Error agregando pago:', error);
    res.status(500).json({ mensaje: 'Error agregando pago' });
  }
});

app.get('/verPagos', async (req, res) => {
  try {
    const pagos = await coleccionPagos.find({}).toArray();
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error obteniendo pagos' });
  }
});

app.get('/verPagosResidente/:idResidente', async (req, res) => {
  const { idResidente } = req.params;
  try {
    const pagos = await coleccionPagos.find({ idUsuario: new ObjectId(idResidente) }).toArray();
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error obteniendo pagos del residente' });
  }
});

//Ruta pra recuperar contraseña

app.post('/recuperarContrasena', async (req, res) => {
  const { email } = req.body;
  try {
    const usuario = await coleccionUsuarios.findOne({ email });
    if (!usuario) {
      return res.status(200).json({ mensaje: 'Si el correo existe, recibirás instrucciones.' });
    }
    // Genera token
    const token = crypto.randomBytes(32).toString('hex');
    tokensRecuperacion[token] = { id: usuario._id, expira: Date.now() + 1000 * 60 * 30 }; // 30 min

    // Configura nodemailer (ajusta con tus datos reales)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'armand89231@gmail.com',
        pass: 'xbns cjrd ywlb ifpv'
      }
    });

    const link = `http://localhost:3000/restablecerContrasena?token=${token}`;
    await transporter.sendMail({
      from: 'armand89231@gmail.com',
      to: email,
      subject: 'Recupera tu contraseña',
      text: `Haz clic en este enlace para restablecer tu contraseña: ${link}`
    });

    res.status(200).json({ mensaje: 'Si el correo existe, recibirás instrucciones.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error recuperando contraseña' });
  }
});

// Página web para restablecer contraseña (GET)
app.get('/restablecerContrasena', (req, res) => {
  const { token } = req.query;
  // Muestra un formulario HTML simple
  res.send(`
    <html>
      <head>
        <title>Restablecer contraseña</title>
        <style>
          body { font-family: Arial; background: #f5f5f5; display: flex; justify-content: center; align-items: center; height: 100vh; }
          form { background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px #ccc; }
          input, button { margin: 8px 0; padding: 8px; width: 100%; }
        </style>
      </head>
      <body>
        <form method="POST" action="/restablecerContrasena">
          <h2>Restablecer contraseña</h2>
          <input type="hidden" name="token" value="${token}" />
          <input type="password" name="nuevaContrasena" placeholder="Nueva contraseña" required />
          <button type="submit">Cambiar contraseña</button>
        </form>
      </body>
    </html>
  `);
});

// Procesa el formulario de restablecimiento (POST desde HTML)
app.use(express.urlencoded({ extended: true })); // Para leer datos de formularios HTML

app.post('/restablecerContrasena', async (req, res) => {
  const { token, nuevaContrasena } = req.body;
  const datos = tokensRecuperacion[token];
  if (!datos || datos.expira < Date.now()) {
    return res.send('<h2>Token inválido o expirado</h2>');
  }
  try {
    await coleccionUsuarios.updateOne(
      { _id: new ObjectId(datos.id) },
      { $set: { password: nuevaContrasena } }
    );
    delete tokensRecuperacion[token];
    res.send('<h2>¡Contraseña actualizada correctamente!</h2>');
  } catch (error) {
    res.send('<h2>Error actualizando contraseña</h2>');
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'imagenesIne/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.post('/subirIne', upload.single('imagen'), (req, res) => {
  res.json({ url: `http://192.168.0.103:3000/imagenesIne/${req.file.filename}` });
});

// Sirve la carpeta de imágenes
app.use('/imagenesIne', express.static('imagenesIne'));

//Rutas para el manejo de chats y mensajes

app.get('/verTusChats', async (req, res) => {
  const { idResidente } = req.query;
  try {
    const chats = await coleccionChats.find({ idResidente }).toArray();
    res.json(chats);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error obteniendo chats' });
  }
});

app.get('/verChatsResidente/:idResidente', async (req, res) => {
  try {
    const idResidente = new ObjectId(req.params.idResidente);
    const chats = await coleccionChats.find({
      usuarios: idResidente
    }).toArray();
    res.json(chats);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error obteniendo chats del residente' });
  }
});

app.post('/agregarMensaje', async (req, res) => {
  const { idChat, idUsuario, contenido } = req.body;
  try {
    const nuevoMensaje = {
      idChat: new ObjectId(idChat),
      idUsuario: new ObjectId(idUsuario),
      contenido,
      fechaEnvio: new Date()
    };
    const resultado = await coleccionMensajes.insertOne(nuevoMensaje);

    // Busca el mensaje con nombre de usuario para emitirlo como que en el fetch
    const mensajeEmitir = await coleccionMensajes.aggregate([
      { $match: { _id: resultado.insertedId } },
      {
        $lookup: {
          from: 'DatosUsuarios',
          localField: 'idUsuario',
          foreignField: '_id',
          as: 'usuario'
        }
      },
      {
        $addFields: {
          nombreUsuario: { $arrayElemAt: ['$usuario.NombreCompleto', 0] }
        }
      },
      { $project: { usuario: 0 } }
    ]).toArray();

    mensajeEmitir[0].idChat = mensajeEmitir[0].idChat.toString();
    // Emitir el mensaje a los clientes conectados
    io.emit('nuevoMensaje', mensajeEmitir[0]);

    res.status(201).json({ _id: resultado.insertedId, ...nuevoMensaje });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error agregando mensaje' });
  }
});

app.post('/editarMensaje', async (req, res) => {
  const { id, contenido } = req.body;
  try {
    const resultado = await coleccionMensajes.updateOne(
      { _id: new ObjectId(id) },
      { $set: { contenido } }
    );
    res.status(200).json({ mensaje: 'Mensaje editado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error editando mensaje' });
  }
});

app.post('/eliminarMensaje', async (req, res) => {
  const { id } = req.body;
  try {
    const resultado = await coleccionMensajes.deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ mensaje: 'Mensaje eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error eliminando mensaje' });
  }
});

app.get('/verMensajes/:idChat', async (req, res) => {
  try {
    const mensajes = await coleccionMensajes.aggregate([
      { $match: { idChat: new ObjectId(req.params.idChat) } },
      {
        $lookup: {
          from: 'DatosUsuarios', // Asegúrate que este es el nombre correcto de tu colección de usuarios
          localField: 'idUsuario',
          foreignField: '_id',
          as: 'usuario'
        }
      },
      {
        $addFields: {
          nombreUsuario: { $arrayElemAt: ['$usuario.NombreCompleto', 0] }
        }
      },
      { $project: { usuario: 0 } },
      { $sort: { fechaEnvio: 1 } }
    ]).toArray();
    res.json(mensajes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error obteniendo mensajes' });
  }
});

app.post('/eliminarImagenIne', (req, res) => {
  const { url: urlImagen } = req.body;
  if (!urlImagen) return res.status(400).json({ mensaje: 'No se envió la URL' });

  const parsedUrl = url.parse(urlImagen);
  const filename = path.basename(parsedUrl.pathname);
  const filePath = path.join(__dirname, 'imagenesIne', filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.warn('No se pudo eliminar la imagen:', err.message);
      return res.status(500).json({ mensaje: 'No se pudo eliminar la imagen' });
    }
    res.json({ mensaje: 'Imagen eliminada correctamente' });
  });
});

app.get('/verChatsVigilante/:idVigilante', async (req, res) => {
  try {
    const idVigilante = new ObjectId(req.params.idVigilante);
    const chats = await coleccionChats.find({
      usuarios: idVigilante
    }).toArray();
    res.json(chats);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error obteniendo chats del vigilante' });
  }
});


//conexion y desconexion de sockets
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });

});
 