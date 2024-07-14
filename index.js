const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection

mongoose.connect("mongodb+srv://pratik1995123:Pratik%401995@pratik-jewellers.gr3gdss.mongodb.net/?retryWrites=true&w=majority&appName=Pratik-jewellers", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// MongoDB Schemas
const itemSchema = new mongoose.Schema({
  title: String,
  cost: Number
});

const dataSchema = new mongoose.Schema({
  date: Date,
  items: [itemSchema]
});

const Data = mongoose.model('Data', dataSchema);

// Routes
app.post('/add_data', async (req, res) => {
  const data = req.body;

  // Validate and parse date
  let date;
  try {
    date = new Date(data.date);
    if (isNaN(date)) throw new Error('Invalid date');
  } catch {
    return res.status(400).json({ error: 'Invalid or missing date. Format should be YYYY-MM-DD.' });
  }

  // Validate items
  const items = data.items.map(item => ({
    title: item.title,
    cost: parseFloat(item.cost)
  }));

  // Check if document with the same date exists
  try {
    let existingData = await Data.findOne({ date: date.toISOString() });

    if (existingData) {
      // Update existing document
      existingData.items = items;
      await existingData.save();
      return res.status(200).json({ message: 'Data updated in MongoDB', data: existingData });
    } else {
      // Create a new Data instance
      const newData = new Data({ date, items });
      await newData.save();
      return res.status(201).json({ message: 'Data added to MongoDB', data: newData });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/get_data', async (req, res) => {
  try {
    const data = await Data.find({});
    if (data.length === 0) {
      return res.status(404).json({ error: 'No data found' });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/get_data', async (req, res) => {
  const { date } = req.body;

  try {
    const data = await Data.findOne({ date: new Date(date).toISOString() });
    if (!data) {
      return res.status(404).json({ error: 'Data not found for the given date' });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
