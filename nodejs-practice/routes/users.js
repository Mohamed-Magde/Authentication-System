const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const { validationResults, check } = require("express-validator/check");
const jwt = require("jsonwebtoken");
const config = require("config");

const User = require("../modules/User");

router.post(
  "/",
  [
    check("name", " name is required")
      .not()
      .isEmpty(),
    check("email", "please include a valid email").isEmail(),
    check("password", "please include password with in 6 characters").isLength({
      min: 6
    })
  ],
  async (req, res) => {
    const errors = validationResults(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ errors: { msg: "user already exists" } });
      }

      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm"
      });

      user = new User({
        name,
        password,
        avatar,
        email
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
