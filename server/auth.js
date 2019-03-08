function loginOnly(req, res, next) {
  let un = req.session.un;
  if (!un) res.sendStatus(401);
  else next();
}

function wheelOnly(req, res, next) {
  let un = req.session.un;
  if (!un) res.sendStatus(401);
  else if (un !== 'wheel') res.sendStatus(403);
  else next();
}

module.exports = { loginOnly, wheelOnly };
