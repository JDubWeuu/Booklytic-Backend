const sequelize = require('../database/database');
const jwt = require('jsonwebtoken');
const adminAuth = require('../firebase/admin');

const signUp = async (req, res, next) => {
  const userDetails = req.body.userDetails;
  const idToken = req.headers['Authorization'].split(" ")[1];
  let decodedToken = null;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  }
  catch (error) {
    res.status(500).json({
      error: "Token is not valid"
    })
  }
  // const tokenInfo = jwt.decode(idToken);

  const { name, email, password, age } = userDetails;
  const { exp, sub } = decodedToken;
  
  res.cookie("accessToken", idToken, {
    maxAge: (exp - Date.now()) / 1000,
    httpOnly: true,
    // change to true when in prod or dev
    secure: false,
    sameSite: "none",
  });

//   res.cookie("refreshToken", refreshToken, {
//     maxAge: 2592000 * 1000,
//     httpOnly: true,
//     secure: false,
//   });

  try {
    const query = `INSERT INTO "user" (name, email, password, age, google_uid) VALUES (:name, :email, :password, :age, :uid)`;
    const [result, metadata] = sequelize.query(query, {
        replacements: {
            name: name,
            email: email,
            password: password,
            age: Number(age),
            uid: sub
        }
    });

    console.log(result);

    res.status(201).json({
        message: "successfully signed up user"
    })
  }
  catch (error) {
    res.status(500).json({
        message: "Unsuccessful sign up",
        error: error.message
    })
  }
};

const logIn = async (req, res, next) => {
  const idToken = req.headers['Authorization'].split(" ")[1];
  let decodedToken = null;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    res.status(500).json({
      error: "Token is not valid",
    });
  }

  // check if the user exists in db (already signed up, if not then redirect to sign up page)
  try {
    let query = `SELECT COUNT(*) FROM "user" WHERE "user".google_uid = :uid`;

    const [result, metadata] = await sequelize.query(query, {
      replacements: {
        uid: decodedToken.sub
      }
    });

    if (Number(result[0].count) >= 1) {
      res.cookie("accessToken", idToken, {
        maxAge: (exp - Date.now()) / 1000,
        httpOnly: true,
        // change to true when in prod or dev
        secure: false,
        sameSite: "none",
      });

      return res.status(200).json({
        message: "Successfully logged in"
      })
    }
    else {
      return res.status(404).json({
        message: "User not found. Please sign up first."
      })
    }

  }
  catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}

const signOut = async (req, res, next) => {
  // clear cookies
  res.clearCookie('accessToken');
  res.redirect('https://localhost:3000/login');
}


module.exports = {
    signUp,
    logIn,
    signOut
}
