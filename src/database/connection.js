const mongoose = require('mongoose')

const uri = process.env.DB_URI;
console.log({uri});
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('open', () => {
    console.log('Database is Connected on ' + uri);
});

mongoose.connection.on('error', (err) => {
    console.log('Database is not Connected on ' + err);
});