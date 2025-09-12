const express=require('express');
const session = require('express-session');
const colors=require('colors');
const morgan=require('morgan');
const dotenv=require('dotenv');
const mySqlPool=require('./config/db');
const path = require('path');

//config dotenv
dotenv.config();

//rest object
const app=express();

//middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(session({
    secret: 'your_secret_key', // Replace with a real secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files except index.html
app.use(express.static(__dirname, { index: false }));

//routes
app.use('/api/v1/product',require('./routes/productRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));


// Middleware to protect admin page
const checkAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login.html');
    }
};
// Product images routes (multiple images per product)
app.use('/api/v1/product', require('./routes/productImagesRoutes'));

// Redirect root to login page
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Serve admin page only if authenticated
app.get('/admin', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});


app.get('/test',(req,res)=>{
    res.status(200).send('<h1>Node js crud</h1>');
});


//port
const PORT=process.env.PORT || 5000;

//mysql
mySqlPool.query('SELECT 1').then(()=>{
    console.log('MySQL connected'.bgCyan.white);

//listen
    app.listen(PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`.bgMagenta.white);
    });
}).catch((error)=>{
    console.log(error);
});