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

function change() {
  let npass = $('#npass').val();
  let cpass = $('#cpass').val();
  if (npass === cpass) {
    if (checkPassword(npass)) {
      axios.post(window.location.href, { npass: npass })
      .then(res => {
        if (res.data.result) {
          if (res.data.succ) {
            $('#h-alert').text('Update succeeded :)');
            $('#modal-alert').modal('show');
          } else {
            $('#h-alert').text('Update failed :(');
            $('#modal-alert').modal('show');
		  }
        } else {
          $('#h-alert').text('Link expired :(');
          $('#modal-alert').modal('show');
        }
      })
      .catch(err => {
        $('#h-alert').text('Network error :(');
        $('#modal-alert').modal('show');
      });
    } else {
      $('#h-alert').text('Too weak :(');
      $('#modal-alert').modal('show');
    }
  } else {
    $('#h-alert').text('Not confirmed :(');
    $('#modal-alert').modal('show');
  }
}

$(document).ready(() => {
  $('#change').click(change);
  $('#npass').keyup(e => {
    if (e.which == 13) change();
  });
  $('#cpass').keyup(e => {
    if (e.which == 13) change();
  });
  $('#close').click(() => {
    location.replace("https://edalias.sparcs.org");
  });
});
