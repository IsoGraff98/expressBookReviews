const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    return users.some((user) => user.username === username);
};

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});


// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books,null,4));
});

// Get the book list using axios + Promise callbacks
public_users.get('/promise', function (req, res) {
  const baseUrl = req.protocol + '://' + req.get('host');
  const url = `${baseUrl}/`;
  axios.get(url)
    .then(response => res.json(response.data))
    .catch(error => {
      console.error('Error fetching books via axios (Promise):', error.message || error);
      return res.status(500).json({ message: 'Error fetching book list (Promise)', error: error.message });
    });
});

// Get the book list using axios + async/await
public_users.get('/async', async function (req, res) {
  try {
    const baseUrl = req.protocol + '://' + req.get('host');
    const url = `${baseUrl}/`;
    const response = await axios.get(url);
    return res.json(response.data);
  } catch (error) {
    console.error('Error fetching books via axios (async):', error.message || error);
    return res.status(500).json({ message: 'Error fetching book list (async)', error: error.message });
  }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    // Retrieve the ISBN parameter from the request URL and send the corresponding friend's details
    const isbn = req.params.isbn;
    res.send(books[isbn]);
});

// Get book details by ISBN using axios + Promise callbacks
public_users.get('/promise/isbn/:isbn', function (req, res) {
  const isbn = encodeURIComponent(req.params.isbn);
  const baseUrl = req.protocol + '://' + req.get('host');
  const url = `${baseUrl}/isbn/${isbn}`;
  axios.get(url)
    .then(response => res.json(response.data))
    .catch(error => {
      console.error('Error fetching book by ISBN via axios (Promise):', error.message || error);
      return res.status(500).json({ message: 'Error fetching book by ISBN (Promise)', error: error.message });
    });
});

// Get book details by ISBN using axios + async/await
public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    const isbn = encodeURIComponent(req.params.isbn);
    const baseUrl = req.protocol + '://' + req.get('host');
    const url = `${baseUrl}/isbn/${isbn}`;
    const response = await axios.get(url);
    return res.json(response.data);
  } catch (error) {
    console.error('Error fetching book by ISBN via axios (async):', error.message || error);
    return res.status(500).json({ message: 'Error fetching book by ISBN (async)', error: error.message });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const authorParam = req.params.author.toLowerCase();

    // books es un objeto con ISBN como claves; usamos Object.entries para filtrar
    const filtered_books = Object.entries(books)
      .filter(([isbn, book]) => book.author && book.author.toLowerCase().includes(authorParam))
      .map(([isbn, book]) => ({ isbn, ...book }));

    if (filtered_books.length === 0) {
      return res.status(404).json({ message: "No se encontraron libros para ese autor" });
    }

    return res.json(filtered_books);
});

// Get books by author using axios + Promise callbacks
public_users.get('/promise/author/:author', function (req, res) {
  const author = encodeURIComponent(req.params.author);
  const baseUrl = req.protocol + '://' + req.get('host');
  const url = `${baseUrl}/author/${author}`;
  axios.get(url)
    .then(response => res.json(response.data))
    .catch(error => {
      console.error('Error fetching books by author via axios (Promise):', error.message || error);
      return res.status(500).json({ message: 'Error fetching books by author (Promise)', error: error.message });
    });
});

// Get books by author using axios + async/await
public_users.get('/async/author/:author', async function (req, res) {
  try {
    const author = encodeURIComponent(req.params.author);
    const baseUrl = req.protocol + '://' + req.get('host');
    const url = `${baseUrl}/author/${author}`;
    const response = await axios.get(url);
    return res.json(response.data);
  } catch (error) {
    console.error('Error fetching books by author via axios (async):', error.message || error);
    return res.status(500).json({ message: 'Error fetching books by author (async)', error: error.message });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const titleParam = req.params.title.toLowerCase();

    // books es un objeto con ISBN como claves; usamos Object.entries para filtrar
    const filtered_title = Object.entries(books)
      .filter(([isbn, book]) => book.title && book.title.toLowerCase().includes(titleParam))
      .map(([isbn, book]) => ({ isbn, ...book }));

    if (filtered_title.length === 0) {
      return res.status(404).json({ message: "No se encontraron libros con este titulo" });
    }

    return res.json(filtered_title);
});

// Get books by title using axios + Promise callbacks
public_users.get('/promise/title/:title', function (req, res) {
  const title = encodeURIComponent(req.params.title);
  const baseUrl = req.protocol + '://' + req.get('host');
  const url = `${baseUrl}/title/${title}`;
  axios.get(url)
    .then(response => res.json(response.data))
    .catch(error => {
      console.error('Error fetching books by title via axios (Promise):', error.message || error);
      return res.status(500).json({ message: 'Error fetching books by title (Promise)', error: error.message });
    });
});

// Get books by title using axios + async/await
public_users.get('/async/title/:title', async function (req, res) {
  try {
    const title = encodeURIComponent(req.params.title);
    const baseUrl = req.protocol + '://' + req.get('host');
    const url = `${baseUrl}/title/${title}`;
    const response = await axios.get(url);
    return res.json(response.data);
  } catch (error) {
    console.error('Error fetching books by title via axios (async):', error.message || error);
    return res.status(500).json({ message: 'Error fetching books by title (async)', error: error.message });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "No se encontró el review con ese ISBN" });
    }

    // Devuelve las reseñas del libro (objeto vacío si no hay reseñas)
    const reviews = book.reviews || {};
    return res.json(reviews);
});

module.exports.general = public_users;
