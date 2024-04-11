const Router = require("express").Router;
const Messages = require("../models/message");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const expressCors = require("express-cors");
const ExpressError = require("../expressError");

const router = new Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const id = req.params.id;
    const username = req.user.username;
    const msg = await Messages.get(id);
    if (
      msg.from_user.username === username ||
      msg.to_user.username === username
    ) {
      return res.json({ message: msg });
    }
    throw new ExpressError("Unauthorized", 401);
  } catch (err) {
    next(err);
  }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const from_user = req.user.username;
    const { to_username, body } = req.body;
    const msg = await Messages.create(from_user, to_username, body);
    return res.json({ message: msg });
  } catch (err) {
    next(err);
  }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureLoggedIn, async function (req, res, next) {
  try {
    const id = req.params.id;
    const username = req.user.username;
    const msg = await Messages.get(id);
    if (msg.to_user.username === username) {
      const read = await Messages.markRead(id);
      return res.json({ message: read });
    }
    throw new ExpressError("Unauthorized", 401);
  } catch (err) {
    next(err);
  }
});
