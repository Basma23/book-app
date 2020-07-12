'use strict';
const express = require('express');
const cors = require('cors');
const souperagent = require('superagent');
const { request, response } = require('express');
require('dotenv').config();
const PORT = process.env.PORT;
const server = express();
server.use(cors());
server.use(express.static('./public'));
server.use(express.json());
server.use(express.urlencoded({extended: true}));
server.set('view engine', 'ejs');
server.get('/', (request, response) =>{
    response.render('pages/index');
});
server.get('/searches/new', outpot);
function outpot(request, response){
    let url = `https://www.googleapis.com/books/v1/volumes?q=` 
    // if(request.body.search[1] === 'title'){
    //     url += `+intitle:${request.body.search[0]}`;
    // }else if(request.body.search[1] === 'aouthor'){
    //     url += `+inauthor:${request.body.search[0]}`;
    // }
    // return souperagent.get(url).then(resOfShearch =>{
    //     resOfShearch.body.items.map(result =>{
    //         new Book(result.info).then(output =>{
    //             response.render('pages/searches/new', {output: output.body});
    //         });
    //     });
    // });
    response.render('pages/searches/new');
};
function Book(info){
    this.title = info.title;
    this.author = info.author;
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