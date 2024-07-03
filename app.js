const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: 'secret-key', // Change this to a random secret key
  resave: false,
  saveUninitialized: true
}));

// Load users and products from JSON files
let users = loadJSONFile('users.json');
let products = loadJSONFile('products.json');

function loadJSONFile(filename) {
  try {
    const data = fs.readFileSync(filename);
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function saveJSONFile(filename, data) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}
function saveUsers() {
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

// Signup endpoint
app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  const lowercaseUsername = username.toLowerCase();

  const existingUser = users.find(u => u.username.toLowerCase() === lowercaseUsername);
  if (existingUser) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const newUser = { id: users.length + 1, username, email, password, cart: [] };
  users.push(newUser);
  saveJSONFile('users.json', users);
  req.session.user = newUser; // Create session for the new user
  res.status(201).json({ message: 'Signup successful', user: newUser });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const lowercaseUsername = username.toLowerCase();

  const user = users.find(u => u.username.toLowerCase() === lowercaseUsername && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  req.session.user = user; // Create session for the logged-in user
  res.status(200).json({ message: 'Login successful', user });
});

// Logout endpoint
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: 'Logout successful' });
});

// Endpoint to get user data
app.get('/user', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});







// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Index route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
