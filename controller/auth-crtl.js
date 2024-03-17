const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../modal/usermodal.js");
const { isValidEmail, isValidPassword } = require("../utils/validation.js");

const createUser = async (req, res) => {
  const { fullName, email, mobileNo, password, role, avatar } = req.body;

  // Validations
  if (!fullName || !email || !mobileNo || !password || !role || !avatar) {
    return res.status(400).json({
      statusCode: 1,
      response: {
        status: false,
        message: "Required fields are missing or empty",
      },
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      statusCode: 1,
      response: {
        status: false,
        message: "Invalid email address",
      },
    });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      statusCode: 1,
      response: {
        status: false,
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
    });
  }

  try {
    // Check if email or mobileNo already exists
    const existingUser = await User.findOne({ $or: [{ email }, { mobileNo }] });
    if (existingUser) {
      return res.status(400).json({
        statusCode: 1,
        response: {
          status: false,
          message: "Email or Mobile Number is already registered",
        },
      });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email,
      mobileNo,
      password: hashedPassword,
      role,
      avatar,
    });

    await newUser.save();

    res.status(200).json({
      statusCode: 1,
      response: {
        status: true,
        message: "User is registered",
        user: { id: newUser._id, email },
      },
    });
  } catch (err) {
    console.error("Error creating user: " + err.stack);
    res.status(500).send("Internal Server Error");
  }
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      statusCode: 1,
      response: {
        status: false,
        message: "Email or password is missing",
      },
    });
  }

  try {
    // Check if email matches
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        statusCode: 1,
        response: {
          status: false,
          message: "Invalid email",
        },
      });
    }

    // Check if password matches
    // const passwordMatch = await bcrypt.compare(password, user.password);
    if (password !== user.password) {
      return res.status(400).json({
        statusCode: 1,
        response: {
          status: false,
          message: "Invalid password",
        },
      });
    }

    // If email and password both match
    // Generate JWT token with email as payload
    const token = jwt.sign(
      { user_id: user._id, email: user.email },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "8h" }
    );

    res.status(200).json({
      statusCode: 1,
      response: {
        status: true,
        message: "User login successful",
        user: { id: user._id, email: user.email },
        token,
      },
    });
  } catch (err) {
    console.error("Error logging in user: " + err.stack);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  createUser,
  userLogin
};
