function isLower(ch) { return 'a' <= ch && ch <= 'z'; }
function isUpper(ch) { return 'A' <= ch && ch <= 'Z'; }
function isDigit(ch) { return '0' <= ch && ch <= '9'; }

function checkPassword(str) {
  if (str.length < 8) return false;

  function exists(f) {
    for (var i = 0; i < str.length; i++)
      if (f(str[i])) return true;
	return false;
  }

  if (!exists(isLower)) return false;
  if (!exists(isUpper)) return false;
  if (!exists(isDigit)) return false;
  if (!exists(
    ch => { return !isLower(ch) && !isUpper(ch) && !isDigit(ch); }
  )) return false;

  return true;
}
