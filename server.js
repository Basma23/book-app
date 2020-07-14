'use strict';
const express = require('express');
const cors = require('cors');
const souperagent = require('superagent');
const pg = require('pg')
const { request, response } = require('express');
require('dotenv').config();
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);
const server = express();
server.use(cors());
server.use(express.static('./public'));
server.use(express.json());
server.use(express.urlencoded({extended: true}));
server.set('view engine', 'ejs');
server.get('/', (request, response) =>{
    let SQL = 'SELECT * FROM books;';
    client.query(SQL).then(outputs =>{
        response.render('pages/index', {books: outputs.rows, numOfSavedBooks: outputs.rowCount});
    })
});
server.get('/searches/new', (req, res) => {
    res.render('pages/searches/new');
});
server.post('/searches', (request, response) =>{
    console.log('Get request', request.body);
    let search = request.body.searchBox;
    let url = `https://www.googleapis.com/books/v1/volumes?q=+` 
    if(request.body.search === 'title'){
        url += `intitle:${search}`;
    }else if(request.body.search === 'author'){
        url += `inauthor:${search}`;
    }
    souperagent.get(url).then(resOfShearch =>{
        let data = resOfShearch.body.items;
        let books = data.map(element =>{
            let newBook = new Book(element);
            return newBook;
        });
        response.render('pages/searches/show', {outpotBooks: books});
    });
});
function getShelves(){
    const SQL = 'SELECT DISTINCT bookshelf FROM books;';
    return client.query(SQL);
}
server.post('/books/:element_id', (request, response) =>{
    getShelves().then(shelves =>{
        const SQL = 'SELECT * FROM books WEHRE id=$1;';
        const assignValues = [request.param.book_id];
        return client.query(SQL, assignValues).then(outputs =>{
            response.render('pages/books/show', {dtailsOfBook: outputs.rows[0], listOfShelves: shelves.rows})
        })
    });
    const SQL = 'INSERT INTO books (image_url, title, author, description, isbn, bookshelf) VALUES ($1, $2, $3, $4, $5, $6);'
    const assignValues = [request.body.image_url, request.body.title,request.body.author, request.body.description, request.body.isbn, request.body.bookshelf];
    client.query(SQL, assignValues).then(() =>{
        response.redirect('/');
    })
});
function Book(info){
    const missingImgs = `https://i.imgur.com/J5LVHEL.jpg`;
    this.title = info.volumeInfo.title;
    this.author = info.volumeInfo.author;
    this.img = info.volumeInfo.imageLinks.thumbnail;
    this.description = info.volumeInfo.description;
    this.isbn = info.volumeInfo.industryIdentifiers;
    this.bookshelf = info.volumeInfo.categories;
}


server.get('*', (request, response) =>{
    response.status(404).send('Not Found');
});
server.use((error, request, response) => {
    response.status(500).send(error);
});
client.connect().then(() =>{
    server.listen(PORT, () => {
        console.log(`listening on port ${PORT}`)
    });
});