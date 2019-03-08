function checkPassword(pw, un) {
  return pw && un && pw.length >= 8 && !pw.toLowerCase().includes(un.toLowerCase());
}

module.exports = { checkPassword };
