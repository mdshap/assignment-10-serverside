const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://booksHaven:6fgST8PpMukfzMzE@cluster0.blss57h.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("User Server Is Available");
});

async function run() {
  try {
    await client.connect();
    console.log("Connected");

    const db = client.db("booksHavenDB");
    const booksCollection = db.collection("books");
    const commentsCollection = db.collection("comments");

    app.get("/books", async (req, res) => {
      const books = booksCollection.find().sort({ createdAt: -1 });
      const result = await books.toArray();
      res.send(result);
    });

    app.get("/books/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await booksCollection.findOne(query);
      res.send(result);
    });

    app.get("/books/:id/comments", async (req, res) => {
      const bookId = req.params.id;
      const cursor = commentsCollection
        .find({ bookId })
        .sort({ createdAt: -1 });
      const comments = await cursor.toArray();
      
      res.send(comments);
    });

    app.post("/books/:id/comments", async (req, res) => {
      const bookId = req.params.id;
      const { userName, userEmail, text, photoURL } = req.body;

      const comment = {
        bookId,
        userName: userName || "Anonymous",
        userEmail,
        text,
        photoURL: photoURL || null,
        createdAt: new Date(),
      };

      const result = await commentsCollection.insertOne(comment);
      res.send(result);
    });

    app.get("/popular-books", async (req, res) => {
      const books = booksCollection.find().sort({ createdAt: -1 }).limit(6);
      const result = await books.toArray();
      res.send(result);
    });

    app.post("/books", async (req, res) => {
      const newBook = {
        ...req.body,
        createdAt: new Date(),
      };
      const result = await booksCollection.insertOne(newBook);
      res.send(result);
    });

    app.get("/my-books/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const books = booksCollection.find(query).sort({ rating: -1 });
      const result = await books.toArray();
      res.send(result);
    });

    app.patch("/my-books/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;

      const filter = { _id: new ObjectId(id) };
      const update = {
        $set: updatedData,
      };

      const result = await booksCollection.updateOne(filter, update);
      res.send(result);
    });

    app.delete("/my-books/:id/:email", async (req, res) => {
      const { id, email } = req.params;

      const query = { _id: new ObjectId(id), userEmail: email };
      const result = await booksCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log("User server is started on port:", port);
});
