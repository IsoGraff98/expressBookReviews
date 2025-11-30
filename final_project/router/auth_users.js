const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    // Valida solo que sea una cadena no vacía (puedes hacer más validaciones si quieres)
    return typeof username === 'string' && username.trim().length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Check if a user with the given username already exists
const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}



//only registered users can login
regd_users.post("/login", (req,res) => {
    // Login endpoint
        const username = req.body.username;
        const password = req.body.password;
    
        // Check if username or password is missing
        if (!username || !password) {
            return res.status(404).json({ message: "Error logging in" });
        }
    
        // Authenticate user
        if (authenticatedUser(username, password)) {
            // Generate JWT access token
            let accessToken = jwt.sign({
                data: password
            }, 'access', { expiresIn: 60 * 60 });
    
            // Store access token and username in session
            req.session.authorization = {
                accessToken, username
            }
            return res.status(200).send("User successfully logged in");
        } else {
            return res.status(208).json({ message: "Invalid Login. Check username and password" });
        }
    });

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    // Add or modify a book review by an authenticated user
    const isbn = req.params.isbn;
    const review = req.query.review || req.body.review; // review provided as a query string or request body
    const username = req.session && req.session.authorization && req.session.authorization.username;

    // Validate inputs
    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    if (!isbn) {
        return res.status(400).json({ message: "ISBN is required" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review text is required (provide as query parameter 'review')" });
    }

    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found with the provided ISBN" });
    }

    // Initialize reviews object if not present
    if (!book.reviews) {
        book.reviews = {};
    }

    // Add or update review by this username
    const alreadyReviewed = Object.prototype.hasOwnProperty.call(book.reviews, username);
    book.reviews[username] = review;

    if (alreadyReviewed) {
        return res.status(200).json({ message: "Review modified successfully", reviews: book.reviews });
    } else {
        return res.status(201).json({ message: "Review added successfully", reviews: book.reviews });
    }
});


// Delete a book review by an authenticated user
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session && req.session.authorization && req.session.authorization.username;

    // Validations
    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    if (!isbn) {
        return res.status(400).json({ message: "ISBN is required" });
    }

    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found with the provided ISBN" });
    }

    // If no reviews exist or there's no review for this username, return 404
    if (!book.reviews || !Object.prototype.hasOwnProperty.call(book.reviews, username)) {
        return res.status(404).json({ message: "Review not found for the current user" });
    }

    // Delete only the current user's review
    delete book.reviews[username];

    return res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
