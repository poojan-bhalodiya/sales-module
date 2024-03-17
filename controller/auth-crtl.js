const User = require("../modal/usermodal.js");
const { isValidEmail, isValidPassword } = require("../utils/validation.js");

exports.createUser = async (req, res) => {
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
    const newUser = new User({
      fullName,
      email,
      mobileNo,
      password,
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
