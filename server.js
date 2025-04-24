const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/image', express.static('image'));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipeId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
});


const Favorite = mongoose.model('Favorite', favoriteSchema);

app.post('/api/favorites', async (req, res) => {
  const { userId, recipeId, title, image } = req.body;
  try {
    const existing = await Favorite.findOne({ userId, recipeId });
    if (existing) {
      return res.status(409).json({ message: 'Already favorited' });
    }

    const fav = new Favorite({ userId, recipeId, title, image });
    await fav.save();
    res.status(201).json({ message: 'Added to favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const favorites = await Favorite.find({ userId });
    res.json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api', (req, res) => {
  res.json({ message: 'API is working' });
});


app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
  
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
   
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    res.status(200).json({ message: 'Login successful', userId: user._id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/front.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'front.html'));
});
app.get('/trial.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'trial.html'));
});
app.get('/display.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'display.html'));
});
app.get('/fav.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'fav.html'));
});
app.get('/recipie.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'recipie.html'));
});
app.get('/joke.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'joke.html'));
});
app.get('/BG.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'BG.png'));
});
app.get('/fonts/CuteEasterPersonalUse-Wy8nV.ttf', (req, res) => {
  res.sendFile(path.join(__dirname, 'fonts/CuteEasterPersonalUse-Wy8nV.ttf'));
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
