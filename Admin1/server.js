const express=require('express');
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

// Static Files
app.use(express.static(__dirname));

//routes
app.use('/api/v1/product',require('./routes/productRoutes'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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