const User = require("../models/User");

//@desc    Register a user
//@route   POST /api/v1/auth/register
//@access  Public
exports.register = async (req, res, next) => {
  try {
    // Destructuring an req (object) -> var
    const { name, telephone, email, password, balance, address } = req.body;

    //Creating a user
    const newUser = await User.create({
      name,
      telephone,
      email,
      password,
      balance,
      address,
    });

    sendTokenResponse(newUser, 200, res);
  } catch (error) {
    res.status(400).json({ success: false });
    console.log(error);
  }
};

//@desc    Login a user
//@route   POST POST /api/v1/auth/login
//@access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email && !password) {
      return res.status(400).json("Please Provide email and password");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid Credential" });
    }
    //Check if password matches
    const match = await user.isPasswordMatch(password);

    if (!match) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid Credential" });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    return res.status(401).json({
      success: false,
      msg: "Cannot convert email or password to string",
    });
  }
};

const sendTokenResponse = (user, statusCode, res) => {
  //Create a token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  });

  console.log(token);
};

//@desc     Get current Logged in user
//@route    POST /api/v1/auth/me
//@access   Private
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
};

//@desc     Log user out and clear cookie
//@route    GET /api/v1/auth/logout
//@access   Private
exports.logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, data: {} });
};

//@desc     Delete user
//@route    DELETE /api/v1/auth/deleteUser
//@access   Private
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: `No user with id of ${userId}` });
    }

    await user.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: "Cannot delete user" });
  }
};
