const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
var jwt = require('jsonwebtoken');

// Middlewares
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6cq5lj6.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection

        const menuCollection = client.db("bistroBossDB").collection("menu");
        const reviewsCollection = client
            .db("bistroBossDB")
            .collection("reviews");
        const cartCollection = client.db("bistroBossDB").collection("cart");
        const userCollection = client.db("bistroBossDB").collection("user");

        app.get("/menu", async (req, res) => {
            const result = await menuCollection.find().toArray();
            res.send(result);
        });

        app.get("/reviews", async (req, res) => {
            const result = await reviewsCollection.find().toArray();
            res.send(result);
        });

        // Cart Related
        app.get("/cart", async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await cartCollection.find(query).toArray();
            res.send(result);
        });

        app.delete("/cart/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        });

        app.post("/cart", async (req, res) => {
            const cartItem = req.body;
            const result = await cartCollection.insertOne(cartItem);
            res.send(result);
        });

        // User Related
        app.post("/users", async (req, res) => {
            const newUser = req.body;
            newUser.role = "user";
            const query = { email: newUser.email };
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({
                    message: "User Already Exist",
                    insertedId: null,
                });
            }
            const result = await userCollection.insertOne(newUser);
            res.send(result);
        });

        app.get("/users", async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        });

        app.delete("/users/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        });

        app.patch("/users/admin/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    role: "admin",
                },
            };
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
        });

        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Server Is Running");
});

app.listen(port, () => {
    console.log(`Server Is Running On Port ${port}`);
});
