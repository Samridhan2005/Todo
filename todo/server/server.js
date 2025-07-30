const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());


const uri = 'mongodb+srv://root:root@cluster0.bxloypl.mongodb.net/todolist?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('todolist');
    console.log(' Connected to MongoDB Atlas');
  } catch (err) {
    console.error(' MongoDB connection error:', err);
  }
}

connectDB();

app.get('/api/todos', async (req, res) => {
  const todos = await db.collection('todo').find().toArray();
  res.json(todos);
});

app.post('/api/todos', async (req, res) => {
  const { text, priority = 'Low', dueDate = null } = req.body;
  const newTask = {
    text,
    completed: false,
    priority,
    dueDate,
    createdAt: new Date(),
  };
  const result = await db.collection('todo').insertOne(newTask);
  res.json({ _id: result.insertedId, ...newTask });
});

app.put('/api/todos/:id/toggle', async (req, res) => {
  const id = req.params.id;
  const objectId = new ObjectId(id);
  const task = await db.collection('todo').findOne({ _id: objectId });

  if (!task) return res.status(404).json({ error: 'Task not found' });

  await db.collection('todo').updateOne(
    { _id: objectId },
    { $set: { completed: !task.completed } }
  );
  res.json({ message: 'Task toggled' });
});

app.put('/api/todos/:id', async (req, res) => {
  const id = req.params.id;
  const objectId = new ObjectId(id);
  const { text, priority, dueDate } = req.body;

  const updateFields = {};
  if (text !== undefined) updateFields.text = text;
  if (priority !== undefined) updateFields.priority = priority;
  if (dueDate !== undefined) updateFields.dueDate = dueDate;

  await db.collection('todo').updateOne(
    { _id: objectId },
    { $set: updateFields }
  );

  res.json({ message: 'Task updated' });
});

app.delete('/api/todos/:id', async (req, res) => {
  const id = req.params.id;
  const objectId = new ObjectId(id);
  const result = await db.collection('todo').deleteOne({ _id: objectId });

  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json({ message: 'Task deleted' });
});

app.delete('/api/todos', async (req, res) => {
  const result = await db.collection('todo').deleteMany({});
  res.json({ message: `Deleted ${result.deletedCount} tasks` });
});

app.listen(port, () => {
  console.log(` Server running at http://localhost:${port}`);
});
