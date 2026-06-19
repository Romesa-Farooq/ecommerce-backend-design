require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Product = require("./models/Product");
const User = require("./models/User");
const auth = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("DB Connected");

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
.catch(err => {
    console.error("DB Connection Error:", err);
});

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/products", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;

    const products = await Product.find()
        .skip((page - 1) * limit)
        .limit(limit);

    res.render("products", { products });
});

app.get("/products/:id", async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render("productDetails", { product });
});

app.get("/search", async (req, res) => {
    const q = req.query.q;

    const products = await Product.find({
        $or: [
            { name: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } }
        ]
    });

    res.render("products", { products });
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
        name,
        email,
        password: hashedPassword
    });

    res.redirect("/login");
});

// LOGIN
app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.send("User not found");

    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.send("Wrong password");

    const token = jwt.sign(
        { id: user._id },
        "mysecretkey",
        { expiresIn: "1d" }
    );

    res.cookie("token", token);
    res.redirect("/products");
});

app.get("/add-product", auth, (req, res) => {
    res.render("addProduct");
});

app.post("/add-product", auth, async (req, res) => {
    await Product.create(req.body);
    res.redirect("/products");
});