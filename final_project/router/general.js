const express = require('express');
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

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    // Retrieve the ISBN parameter from the request URL and send the corresponding friend's details
    const isbn = req.params.isbn;
    res.send(books[isbn]);
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
