const cf = 'I want to delete user ';
var cfm = '';

function setHcf() {
  $('#hcf').text(cf + $('#un').val());
}

function disable(b) {
  $('#un').prop('disabled', b);
  $('#cf').prop('disabled', b);
  $('#delete').prop('disabled', b);
}

function del() {
  let un = $('#un').val();
  let cf = $('#cf').val();
  let hcf = $('#hcf').text();
  if (un && cf) {
    disable(true);
    if (hcf === cf) {
      axios.post('/api/wheel/delete', { un: un })
      .then(res => {
        if (res.data.expired) window.location.href = '/login';
        else if (res.data.result) {
          $('#h-alert').text('Deletion succeeded :)');
          $('#close').click(() => { window.location.href = '/'; });
          $('#modal-alert').modal('show');
        } else {
          $('#h-alert').text('User not exists :(');
          $('#modal-alert').modal('show');
          $('#un').val('');
          $('#cf').val('');
          setHcf();
        }
      })
      .catch(err => {
        $('#h-alert').text('Network error :(');
        $('#modal-alert').modal('show');
      });
    } else {
      $('#h-alert').text('Not confirmed :(');
      $('#modal-alert').modal('show');
      $('#cf').val('');
    }
  }
}

$(document).ready(() => {
  $('#un').val('');
  $('#cf').val('');
  setHcf();

  $('#delete').click(del);
  $('#un').keyup(e => {
    if (e.which == 13) del();
    else setHcf();
  });
  $('#cf').keyup(e => {
    if (e.which == 13) del();
  });
  $('#close').click(() => { disable(false); });
});
