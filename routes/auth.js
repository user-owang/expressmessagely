const jwt = require("jsonwebtoken");
const Router = require("express").Router;
const router = new Router();

const User = require("../models/user");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async function (req, res, next) {
  try {
    let { username, password } = req.body;
    if (!(username && password)) {
      throw new ExpressError("Username and password required", 400);
    }
    if (await User.authenticate(username, password)) {
      await User.updateLoginTimestamp();
      let token = jwt.sign({ username }, SECRET_KEY);
      return res.json(token);
    } else {
      throw new ExpressError("Invalid login info", 400);
    }
  } catch (err) {
    next(err);
  }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async function (req, res, next) {
  try {
    let { username, password, first_name, last_name, phone } = req.body;
    if (!(username && password && first_name && last_name && phone)) {
      throw new ExpressError(
        "Username, password, first name, last name and phone are required",
        400
      );
    }
    await User.register(username, password, first_name, last_name, phone);
    let token = jwt.sign({ username }, SECRET_KEY);
    return res.json(token);
  } catch (err) {
    next(err);
  }
});
