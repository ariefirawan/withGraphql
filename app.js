const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const uuidv4 = require('uuid/v4');
const graphqlHttp = require('express-graphql'); 

const graphqlSchema = require('./graphql/schema');
const graphqlResolvers = require('./graphql/resolvers');

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4())
    }
});
//
const fileFilter = (req, file, cb) => {
        if ( 
            file.mimetype === 'image/png' || 
            file.mimetype === 'image/jpg' || 
            file.mimetype === 'image/jpeg'
            ) 
            {
            cb(null, true);
        } else {
            cb(null, false);
        }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json());
app.use(multer({ storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})

app.use('/graphql', graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true
}))

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data
    res.status(status).json({ message: message, data: data })
})

mongoose.connect('mongodb+srv://ariefirawant:dksq7mT60cz1Qdnj@cluster0-fv6bh.mongodb.net/messages?retryWrites=true&w=majority')
.then(result => {
    app.listen(8080);   
    console.log('CONNECTED!')
}).catch(err => console.log(err))