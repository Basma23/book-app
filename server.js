'use strict';
const express = require('express');
const cors = require('cors');
const souperagent = require('superagent');
const { request, response } = require('express');
require('dotenv').config();
const PORT = process.env.PORT;
const server = express();
// server.use(cors());
server.use(express.static('./public'));
server.use(express.json());
server.use(express.urlencoded({extended: true}));
server.set('view engine', 'ejs');
server.get('/', (request, response) =>{
    response.render('pages/index');
});
server.get('/searches/new', (req, res) => {
    res.render('pages/searches/new')
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
function Book(info){
    this.title = info.volumeInfo.title;
    this.author = info.volumeInfo.author;
    this.img = info.volumeInfo.imageLinks.thumbnail;
    this.description = info.volumeInfo.description;
    const missingImgs = `https://i.imgur.com/J5LVHEL.jpg`;
}


server.get('*', (request, response) =>{
    response.status(404).send('Not Found');
});
server.use((error, request, response) => {
    response.status(500).send(error);
});
server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
});