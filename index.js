const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// console.log("User: ", process.env.DB_USER_NAME);
// console.log("Password: ", process.env.DB_PASSWORD);

const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.s278t41.mongodb.net/?retryWrites=true&w=majority`;

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

    const toyCollection = client.db("toyDB").collection("toys");
    // client.db("toyDB").toyCollection.createIndex("toy_name");
    // client.db("toyDB").createIndex({ toy_name: "text" });

    // View All Toys
    app.get("/toys", async (req, res) => {
      const limit = parseInt(req?.query.limit) || 20;
      const sort = req.query?.sort;
      // const search = req.query?.search;
      // console.log(search);
      // const query = { $text: { $search: search } };
      
      const cursor = toyCollection
        .find()
        .sort({ price: sort })
        .limit(limit); // Documentation: https://www.mongodb.com/docs/drivers/node/current/usage-examples/find/
      const result = await cursor.toArray();
      // console.log(result);
      res.send(result);
    });

    // Get My Toys
    app.get("/my-toys", async (req, res) => {
      const limit = parseInt(req.query?.limit) || 20;
      const email = req.query?.email;
      const sort = req.query?.sort;
      // console.log(email);
      // console.log(limit);
      // console.log(sort);
      // console.log({ price: sort });
      let query = {};
      if (email) {
        query = { seller_email: email };
      }
      // console.log(query);
      const result = await toyCollection
        .find(query)
        .sort({ price: sort })
        .limit(limit)
        .toArray();
      // console.log(result);
      res.send(result);
    });

    // View Single Toy
    app.get("/toy/:id", async (req, res) => {
      const toyID = req.params.id;
      // console.log("Single Toy ID to Load: ", toyID);
      const query = { _id: new ObjectId(toyID) };
      const result = await toyCollection.findOne(query); // Documentation: https://www.mongodb.com/docs/drivers/node/current/usage-examples/findOne/
      // console.log(result);
      res.send(result);
    });

    // Insert One Toy
    app.post("/add-a-toy", async (req, res) => {
      const toy = req.body;
      // console.log("New Toy: ", toy);
      const result = await toyCollection.insertOne(toy); // Documentation: https://www.mongodb.com/docs/drivers/node/current/usage-examples/insertOne/
      res.send(result);
    });

    // Update One Toy
    app.patch("/update/:id", async (req, res) => {
      const toyID = req.params.id;
      const toyInfo = req.body;
      // console.log("Update Toy ID: ", toyID);
      // console.log("Update Toy Info: ", toyInfo);

      const filter = { _id: new ObjectId(toyID) };
      // const options = { upsert: true };

      const updateToy = {
        $set: {
          toy_name: toyInfo.toy_name,
          photo_url: toyInfo.photo_url,
          seller_name: toyInfo.seller_name,
          seller_email: toyInfo.seller_email,
          sub_category: toyInfo.sub_category,
          rating: toyInfo.rating,
          price: toyInfo.price,
          quantity: toyInfo.quantity,
          description: toyInfo.description,
        },
      };
      const result = await toyCollection.updateOne(filter, updateToy); // Documentation: https://www.mongodb.com/docs/drivers/node/current/usage-examples/updateOne/
      res.send(result);
    });

    // Delete Toy Data
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      // console.log(result);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
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
  res.send("LearnitToys is Running!");
});

app.listen(port, () => {
  console.log(`LearnitToys Server is running on port ${port}`);
});
