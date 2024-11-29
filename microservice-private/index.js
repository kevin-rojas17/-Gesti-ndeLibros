const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jwt-simple');
const app = express();
const port = 4000;

// Middleware para procesar JSON en el body de las solicitudes
app.use(express.json());

// Cadena de conexión a MongoDB
const dbURI = "mongodb+srv://TOMut4mn3tPvITie:TOMut4mn3tPvITie@comedor.zhardxq.mongodb.net/?retryWrites=true&w=majority&appName=comedor";
mongoose.connect(dbURI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch(err => console.log("Error al conectar con MongoDB:", err));

// Esquema de libro con campo de "reservado" y "reservado por"
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  genre: String,
  reserved: { type: Boolean, default: false }, // Indica si el libro está reservado
  reservedBy: { type: String, default: null }, // Nombre de quien reservó el libro
});

// Modelo de libro
const Book = mongoose.model('Book', bookSchema);

// Clave secreta para JWT
const secretKey = 'miSecretaClave';

// Middleware de autenticación JWT
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send("Token no proporcionado.");

  try {
    const decoded = jwt.decode(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(500).send("No se pudo verificar el token.");
  }
};

// Ruta para generar un token JWT (para autenticación)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Aquí puedes verificar las credenciales de manera real (usuario y contraseña)
  // Si la autenticación es exitosa, generas el token:
  if (username === 'usuario' && password === 'contraseña') {
    const payload = { username }; // Puedes agregar más datos en el payload si lo deseas
    const token = jwt.encode(payload, secretKey);
    return res.json({ token });
  }

  res.status(401).send('Credenciales inválidas');
});

// Ruta pública para obtener libros
app.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).send("Error en la base de datos.");
  }
});

// Ruta privada para agregar libros
app.post('/books', authenticate, async (req, res) => {
  const { title, author, genre } = req.body;
  const newBook = new Book({ title, author, genre });

  try {
    // Usamos await para guardar el libro sin callback
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (err) {
    res.status(500).send("Error al guardar el libro.");
  }
});

// Ruta privada para reservar un libro
app.post('/reserve', authenticate, async (req, res) => {
  const { bookId } = req.body;

  try {
    // Verificar si el libro existe y si ya está reservado
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).send("Libro no encontrado.");
    }

    if (book.reserved) {
      return res.status(400).send("Este libro ya está reservado.");
    }

    // Marcar el libro como reservado y registrar quién lo reservó
    book.reserved = true;
    book.reservedBy = req.user.username; // Usamos el username del usuario que está autenticado

    await book.save();
    res.status(200).json({ message: "Libro reservado con éxito", book });
  } catch (err) {
    res.status(500).send("Error al intentar reservar el libro.");
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Microservicio Privado escuchando en http://localhost:${port}`);
});
