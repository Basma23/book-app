'use strict';

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');
require('ejs');
require('dotenv').config();
const methodOverride = require('method-override');
server.use(methodOverride('_method'));
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);
const server = express();
server.use(cors());
server.use(express.static('./public'));
server.use(express.json());
server.use(express.urlencoded({extended: true}));
server.set('view engine', 'ejs');

server.get('/', index);
server.get('/searches/new', newSearch);
server.post('/searches', searchResult);
server.post('/books', addingBooks);
server.get('/books/:book_id', bookDetails);
server.get('/books/:book_id', ubdateBook);
server.get('*', notFound);


function index(request, response){
    let SQL = 'SELECT * FROM books;';
    client.query(SQL).then(outputs =>{
        response.render('pages/index', {books: outputs.rows, numOfSavedBooks: outputs.rowCount});
    })
};

function newSearch(request, response){
    response.render('pages/searches/new');
};

function searchResult(request, response){
    let search = request.body.input;
    let url = `https://www.googleapis.com/books/v1/volumes?q=+` 
    if(request.body.search === 'title'){
        url += `intitle:${search}`;
    }else if(request.body.search === 'author'){
        url += `inauthor:${search}`;
    }
    superagent.get(url).then(resOfShearch =>{
        let data = resOfShearch.body.items;
        let books = data.map(book =>{
            let newBook = new Book(book);
            return newBook;
        });
        response.render('pages/searches/show', {books: books});
    });
};

function addingBooks(request, response){
    let SQL = 'INSERT INTO books (image_url, title, author, description, isbn, bookshelf) VALUES ($1, $2, $3, $4, $5, $6);';
    let assignValues = [request.body.image_url, request.body.title,request.body.author, request.body.description, request.body.isbn, request.body.bookshelf];
    console.log(request.body);
    client.query(SQL, assignValues).then(() =>{
        let SQL1 = 'SELECT * FROM books WHERE isbn=$1;';
        let assignValues = [request.body.isbn];
        client.query(SQL1, assignValues).then(output =>{
            response.redirect(`books/${output.rows[0].id}`);
        });
    });
};

function bookDetails(request, response){
    console.log(request.params)
    let SQL = 'SELECT * FROM books WHERE id=$1;';
    let assignValues = [request.params.book_id];
    client.query(SQL, assignValues).then(output =>{
        console.log('detail', output.rows);
        response.render('pages/books/show', {detailsOfBook: output.rows[0]});
    });
};

function Book(info){
    const missingImgs = `https://i.imgur.com/J5LVHEL.jpg`;
    this.title = info.volumeInfo.title ? info.volumeInfo.title : "No Name Avaliable";
    this.author = info.volumeInfo.authors ? info.volumeInfo.authors : "Not Found";
    this.img = info.volumeInfo.imageLinks ? info.volumeInfo.imageLinks.thumbnail : "https://i.ytimg.com/vi/uiCm88Me_3U/maxresdefault.jpg";
    this.description = info.volumeInfo.description ? info.volumeInfo.BookDescription : "No Description Found";
    this.isbn = info.volumeInfo.industryIdentifiers ? info.volumeInfo.industryIdentifiers[0].identifier : "Not Exists";
    this.bookshelf = info.volumeInfo.categories ? info.volumeInfo.categories : "Not under a class";
};

function ubdateBook(request, response){
    let SQL = `UPDATE booksdb SET title=$1, author=$2, description=$3, image_url=$4, bookshell=$5 WHERE ID =$6;`;
  let assignValues = [request.body.title, request.body.author, request.body.description, request.body.description.isbn, request.body.bookshelf, request.params.book_id];
  client.query(SQL, assignValues).then(() => {
      response.redirect('/');
  })
}

function notFound(request, response){
    response.status(404).send('404 not found');
};

server.use((error, request, response) => {
    response.status(500).send(error);
});

client.connect().then(() =>{
    server.listen(PORT, () => {
        console.log(`Connicting and listening on port ${PORT}`);
    });
});