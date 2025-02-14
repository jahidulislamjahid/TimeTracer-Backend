const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Open API
app.get("/", (req, res) => {
  res.send("Welcome to Time Tracer!");
});

// Connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qtoag.mongodb.net/timetracer?retryWrites=true&w=majority&serverSelectionTimeoutMS=5000`;
// console.log(uri);

let db; // Declare db outside the run function

// DB Connection
async function connectToDB() {
  if (!db) {
    try {
      console.log("Connecting to MongoDB...");
      const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      await client.connect();
      db = client.db("timetracer");
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }
  return db;
}

// Routes
app.post("/users", async (req, res) => {
  try {
    const db = await connectToDB();
    const user_collection = db.collection("users");
    const result = await user_collection.insertOne(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/admin/:email", async (req, res) => {
  try {
    const db = await connectToDB();
    const user_collection = db.collection("users");
    const email = req.params.email;
    const result = await user_collection.findOne({ email: email });
    res.json(result);
  } catch (error) {
    console.error("Error fetching admin:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/addAdmin", async (req, res) => {
  try {
    const db = await connectToDB();
    const user_collection = db.collection("users");
    const email = req.body.email;
    const result = await user_collection.updateOne(
      { email },
      { $set: { role: "admin" } }
    );
    res.json(result);
  } catch (error) {
    console.error("Error adding admin:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/products", async (req, res) => {
  try {
    const db = await connectToDB();
    const product_collection = db.collection("products");
    const result = await product_collection.find({}).toArray();
    res.json(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/placeorder/:id", async (req, res) => {
  try {
    const db = await connectToDB();
    const product_collection = db.collection("products");
    const result = await product_collection.findOne({
      _id: ObjectId(req.params.id),
    });
    res.json(result);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/placeorder", async (req, res) => {
  try {
    const db = await connectToDB();
    const order_collection = db.collection("orders");
    const order = req.body;
    order.status = "Pending";
    delete order._id;
    const result = await order_collection.insertOne(order);
    res.json(result);
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/orders", async (req, res) => {
  try {
    const db = await connectToDB();
    const order_collection = db.collection("orders");
    const email = req.query.email;
    let result;
    if (email) {
      result = await order_collection.find({ email }).toArray();
    } else {
      result = await order_collection.find({}).toArray();
    }
    res.json(result);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/updateOrderStatus", async (req, res) => {
  try {
    const db = await connectToDB();
    const order_collection = db.collection("orders");
    const id = req.body.id;
    const status = req.body.status;
    const result = await order_collection.updateOne(
      { _id: ObjectId(id) },
      { $set: { status: status } }
    );
    res.json(result.modifiedCount);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/updateProduct", async (req, res) => {
  try {
    const db = await connectToDB();
    const product_collection = db.collection("products");
    const id = req.query.id;
    const product = req.body;
    const result = await product_collection.updateOne(
      { _id: ObjectId(id) },
      { $set: product }
    );
    res.json(result);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/placeorder/:id", async (req, res) => {
  try {
    const db = await connectToDB();
    const order_collection = db.collection("orders");
    const result = await order_collection.deleteOne({
      _id: ObjectId(req.params.id),
    });
    res.json(result);
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/addProduct", async (req, res) => {
  try {
    const db = await connectToDB();
    const product_collection = db.collection("products");
    const result = await product_collection.insertOne(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/addReview", async (req, res) => {
  try {
    const db = await connectToDB();
    const review_collection = db.collection("review");
    const result = await review_collection.insertOne(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/reviews", async (req, res) => {
  try {
    const db = await connectToDB();
    const review_collection = db.collection("review");
    const result = await review_collection.find({}).toArray();
    res.json(result);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/deleteProduct/:id", async (req, res) => {
  try {
    const db = await connectToDB();
    const product_collection = db.collection("products");
    const result = await product_collection.deleteOne({
      _id: ObjectId(req.params.id),
    });
    res.json(result);
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/updateOne/:id", async (req, res) => {
  try {
    const db = await connectToDB();
    const product_collection = db.collection("products");
    const result = await product_collection.findOne({
      _id: ObjectId(req.params.id),
    });
    res.json(result);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start server
app.listen(port, () => console.log(`Server is running on port ${port}`));
