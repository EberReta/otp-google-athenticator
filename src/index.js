const express = require("express");
const morgan = require('morgan');
const cors = require('cors')
const app = express();
const path = require('path');
require('dotenv').config(); 
require('./database/connection');
require('./routes/User');

// Settings
app.set('port',process.env.PORT || 3030);
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares
var corsOptions = {origin: '*'}
app.use(cors(corsOptions));

app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());


// Routes
app.use('/',require('./routes/User'));


// Starting the server
app.listen(app.get('port'), () => { console.log(`Listing on ${app.get('port')}`); });

module.exports = app;