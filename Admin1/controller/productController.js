const db = require("../config/db");
const { get } = require("../routes/productRoutes");

//get product
const getProducts = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT pid, name, description, price_small, price_medium, price_large, quantity_small, quantity_medium, quantity_large, image FROM products');
        if (!rows) {
            return res.status(404).send({
                success: false,
                message: "No products found"
            });
        }

        const products = rows.map(product => {
            // Ensure the image is a buffer and convert it to a base64 string
            if (product.image && Buffer.isBuffer(product.image)) {
                product.image = product.image.toString('base64');
            }
            return product;
        });

        res.status(200).send({
            success: true,
            message: "Products fetched successfully",
            totalProducts: products.length,
            data: products
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in fetching products",
            error
        });
    }
};

//get product by id
const getProductById= async (req,res)=>{
    try {
        const prodcutid=req.params.id;
        if(!prodcutid){
            return res.status(400).send({
                success:false,
                message:"Product id is required or invalid"
            })
        }
    const data=await db.query('SELECT * FROM products WHERE pid=?',[prodcutid]);
        if(!data){
            return res.status(404).send({
                success:false,
                message:"No product found"
            })      
        }
        res.status(200).send({
            success:true,
            message:"Product fetched successfully",
            productDetails:data[0]
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Error in fetching product by id",
            error
    })
}
};

//create product
const createProduct = async (req, res) => {
    try {
        const { name, description, price_small, price_medium, price_large, quantity_small, quantity_medium, quantity_large } = req.body;
        if (!name || !description || !price_small || !price_medium || !price_large || !quantity_small || !quantity_medium || !quantity_large) {
            return res.status(500).send({
                success: false,
                message: "All fields are required"
            });
        }

        let image = null;
        if (req.file) {
            image = req.file.buffer;
        } else {
            return res.status(500).send({
                success: false,
                message: "Image file is required"
            });
        }

        const productData = { name, description, price_small, price_medium, price_large, quantity_small, quantity_medium, quantity_large, image };
        const data = await db.query('INSERT INTO products SET ?', [productData]);
        if (!data) {
            return res.status(404).send({
                success: false,
                message: "Error in creating product"
            });
        }
        res.status(201).send({
            success: true,
            message: "Product created successfully",
            data: data[0]
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in creating product",
            error
        });
    }
};

//update product
const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!productId) {
            return res.status(404).send({
                success: false,
                message: "Product id is required or invalid"
            });
        }
        const { name, description, price_small, price_medium, price_large, quantity_small, quantity_medium, quantity_large } = req.body;
        const productData = { name, description, price_small, price_medium, price_large, quantity_small, quantity_medium, quantity_large };
        if (req.file) {
            productData.image = req.file.buffer;
        }

        const data = await db.query('UPDATE products SET ? WHERE pid=?', [productData, productId]);
        if (!data) {
            return res.status(500).send({
                success: false,
                message: "Error in updating product"
            });
        }
        res.status(200).send({
            success: true,
            message: "Product updated successfully"

        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in updating product",
            error
        });
    }
};

//delete product
const deleteProduct= async (req,res)=>{
    try{
        const prodcutid=req.params.id;
        if(!prodcutid){
            return res.status(404).send({
                success:false,
                message:"Product id is required or invalid"
            })
        }
        const data=await db.query('DELETE FROM products WHERE pid=?',[prodcutid]);
        if(!data){
            return res.status(500).send({
                success:false,
                message:"Error in deleting product"
            })
        }
        res.status(200).send({
            success:true,
            message:"Product deleted successfully"
        });
    } catch(error){
        console.log(error);
        res.status(500).send({
        success:false,
        message:"Error in deleting product",    
        error
        })
    }   
};

module.exports={getProducts,getProductById,createProduct,updateProduct,deleteProduct};