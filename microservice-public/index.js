const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Cadena de conexión a MongoDB
const dbURI = "mongodb+srv://TOMut4mn3tPvITie:TOMut4mn3tPvITie@comedor.zhardxq.mongodb.net/?retryWrites=true&w=majority&appName=comedor";
mongoose.connect(dbURI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch(err => console.log("Error al conectar con MongoDB:", err));

// Definir el esquema de libro
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  genre: String
});

// Crear el modelo de libro
const Book = mongoose.model('Book', bookSchema);

// Ruta pública para obtener libros
app.get('/books', async (req, res) => {
  try {
    const books = await Book.find(); // Esperamos a que se resuelva la promesa
    res.json(books); // Respondemos con los libros en formato JSON
  } catch (err) {
    res.status(500).send("Error en la base de datos."); // En caso de error, respondemos con un mensaje de error
  }
});

// Escuchar en el puerto
app.listen(port, () => {
  console.log(`Microservicio Público escuchando en http://localhost:${port}`);
});
