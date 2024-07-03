const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;

    // Read existing users from the JSON file
    const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'));

    // Create a new user object
    const newUser = {
        id: users.length + 1,
        username: username,
        email: email,
        password: password
    };

    // Add the new user to the array
    users.push(newUser);

    // Write the updated array back to the JSON file
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2), 'utf-8');

    res.status(200).send('Sign up successful! Please login.');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
