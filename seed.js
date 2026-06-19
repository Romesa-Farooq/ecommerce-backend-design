const mongoose = require("mongoose");
const Product = require("./models/Product");

mongoose.connect(process.env.MONGO_URI || 
    "mongodb+srv://romesafarooq5_db_user:UcbESiSmmRiUmIPj@cluster0.w4bl6cn.mongodb.net/ecommerce");

const products = [
    {
        name: "iPhone 14",
        price: 1200,
        category: "Mobile",
        image: "iphone.jpg",
        description: "Apple phone",
        stock: 10
    },
    {
        name: "Samsung TV",
        price: 800,
        category: "Electronics",
        image: "tv.jpg",
        description: "Smart TV",
        stock: 5
    }
];

Product.insertMany(products)
.then(() => {
    console.log("Data inserted");
    mongoose.connection.close();
});