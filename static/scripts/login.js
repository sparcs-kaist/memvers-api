function disable(b) {
  $('#un').prop('disabled', b);
  $('#pw').prop('disabled', b);
  $('#login').prop('disabled', b);
}

function login() {
  let un = $('#un').val();
  let pw = $('#pw').val();
  if (un && pw) {
    disable(true);
    axios.post('/api/login', { un: un, pw: pw })
    .then(res => {
      if (res.data.result)
        window.location.href = '/';
      else {
        $('#h-alert').text('Login failed :(');
        $('#modal-alert').modal('show');
        $('#pw').val('');
      }
    })
    .catch(err => {
      $('#h-alert').text('Network error :(');
      $('#modal-alert').modal('show');
    });
  }
}

$(document).ready(() => {
  axios.get('/api/un')
  .then(res => {
    if (!res.data.expired) window.location.href = '/';
  });

  $('#login').click(login);
  $('#un').keyup(e => {
    if (e.which == 13) login();
  });
  $('#pw').keyup(e => {
    if (e.which == 13) login();
  });
  $('#close').click(() => { disable(false); });
});
