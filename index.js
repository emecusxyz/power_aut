require("dotenv").config();
//const http = require("http");
//const app = require("./app");
//const server = http.createServer(app);
//require("dotenv").config();
const connectDB = require("./config/database");
//require("./config/database").connect();
const User = require("./model/user");
const auth = require("./middleware/Auth");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();

app.use(cors()); // Use this after the variable declaration
app.use(express.json());

connectDB();

// ...

app.post("/register", async (req, res) => {
  // Our register logic starts here
  try {
    // Get user input
    const {
      first_name,
      last_name,
      email,
      password,
      first_group,
      second_group,
    } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name)) {
      res.status(400).send({ message: "All input is required" });
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res
        .status(409)
        .send({ message: "User Already Exist. Please Login" });
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    // const user = await User.create({
    //   first_name,
    //   last_name,
    //   email: email.toLowerCase(), // sanitize: convert email to lowercase
    //   password: encryptedPassword,
    // });
    const user = new User({
      first_name,
      last_name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
      group: [first_group, second_group],
    });

    // save the new user
    let result = user.save();

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json({ message: "User created succesfully", user });
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});
//
// ...

app.post("/login", async (req, res) => {
  // Our login logic starts here
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      return res.status(400).send({ message: "All input is required" });
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;

      // user
      return res.status(200).json({
        message: "Login Successful",
        name: user.name,
        email: user.email,
        token,
        data: [user],
      });
    }
    return res.status(400).send({ message: "Invalid Credentials" });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
  // Our register logic ends here
});

// ...
// ...
app.post("/welcome", auth, (req, res) => {
  return res.status(200).json({ message: "Welcome 🙌 " });
});
//
app.get("/auth-endpoint", auth, (req, res) => {
  console.log(req.user);
  return res.json({ message: "You are authorized to access me" });
});
//
app.get("/users", async (req, res) => {
  //response.send("hello!")

  await User.find({})
    .then((foundUser) => res.send(foundUser.reverse()))
    .catch((e) => {
      console.log(e);
    });
});
// ...
app.get("/user/:userid", async (req, res) => {
  //response.send("hello!")
  const userid = req.params.userid;
  try {
    const user = await User.findById(userid);
    res.status(200).send(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

app.get("/find_group", async (req, res) => {
  //response.send("hello!")
  const { first_group, second_group } = req.body;
  try {
    const group = await User.findOne({
      group: { $all: [first_group, second_group] },
    });

    if (group) return res.status(200).send(group);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});
app.get("/find_one_group/:first_group", async (req, res) => {
  //response.send("hello!")
  const firstgroup = req.params.first_group;
  try {
    const group = await User.findOne({
      group: { $in: [firstgroup] },
    });

    res.status(200).send(group);
    console.log(group.group[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// ...
//const { API_PORT } = process.env;
const port = process.env.PORT || 5000;

// server listening
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
