function disable(b) {
  $('#opass').prop('disabled', b);
  $('#npass').prop('disabled', b);
  $('#cpass').prop('disabled', b);
  $('#change').prop('disabled', b);
}

function change() {
  let opass = $('#opass').val();
  let npass = $('#npass').val();
  let cpass = $('#cpass').val();
  if (opass && npass && cpass) {
    disable(true);
    if (npass === cpass) {
      axios.post('/api/passwd', { opass: opass, npass: npass })
      .then(res => {
        if (res.data.expired) window.location.href = '/login';
        else if (res.data.result) {
          $('#h-alert').text('Update succeeded :)');
          $('#close').click(() => { window.location.href = '/'; });
          $('#modal-alert').modal('show');
        } else if (res.data.weak) {
          $('#h-alert').text('Too weak :(');
          $('#modal-alert').modal('show');
          $('#npass').val('');
          $('#cpass').val('');
        } else {
          $('#h-alert').text('Wrong current password :(');
          $('#modal-alert').modal('show');
          $('#opass').val('');
        }
      })
      .catch(err => {
        $('#h-alert').text('Network error :(');
        $('#modal-alert').modal('show');
      });
    } else {
      $('#h-alert').text('Not confirmed :(');
      $('#modal-alert').modal('show');
      $('#npass').val('');
      $('#cpass').val('');
    }
  }
}

$(document).ready(() => {
  $('#change').click(change);
  $('#opass').keyup(e => {
    if (e.which == 13) change();
  });
  $('#npass').keyup(e => {
    if (e.which == 13) change();
  });
  $('#cpass').keyup(e => {
    if (e.which == 13) change();
  });
  $('#close').click(() => { disable(false); });
});
