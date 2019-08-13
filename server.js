const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");
const morgan = require('morgan');

const register = require("./controllers/register");
const signin = require("./controllers/signin");
const profile = require("./controllers/profile");
const image = require("./controllers/image");

/* const postgres = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true
  }
}); */

const postgres = knex({
  client: 'pg',
  connection: process.env.POSTGRES_URI
});

const app = express();

const whitelist = ['http://localhost:3001']
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(morgan('combined'));
app.use(cors(corsOptions))
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Heroku deployment");
});
app.post("/signin", signin.handleSignin(postgres, bcrypt));
app.post("/register", (req, res) => {
  register.handleRegister(req, res, postgres, bcrypt);
});
app.get("/profile/:id", (req, res) => {
  profile.handleProfileGet(req, res, postgres);
});
app.put("/image", (req, res) => {
  image.handleImage(req, res, postgres);
});
app.post("/imageurl", (req, res) => {
  image.handleApiCall(req, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
