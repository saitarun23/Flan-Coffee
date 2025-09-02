const express = require('express');
const { getProducts,getProductById, createProduct,updateProduct,deleteProduct 

 } = require('../controller/productController');
const multer = require('multer');

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


//router object
const router = express.Router();

// get all products
router.get('/getall',getProducts);

//get product by id
router.get('/get/:id',getProductById);

//createe product
router.post('/create',upload.single('image'),createProduct);

//update product
router.put('/update/:id',upload.single('image'),updateProduct);

//delete product
router.delete('/delete/:id',deleteProduct);

module.exports = router;