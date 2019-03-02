function add() {
  let un = $('#un').val();
  let npass = $('#npass').val();
  let cpass = $('#cpass').val();
  if (un && npass && cpass) {
    if (npass === cpass) {
      if (checkPassword(npass)) {
        axios.post('/api/wheel/add', { un: un, npass: npass })
        .then(res => {
          if (res.data.expired) window.location.href = '/login';
          else if (res.data.result) {
            $('#h-alert').text('Addition succeeded :)');
            $('#close').click(() => { window.location.href = '/'; });
            $('#modal-alert').modal('show');
          } else {
            $('#h-alert').text('User already exists :(');
            $('#modal-alert').modal('show');
            $('#un').val('');
            $('#npass').val('');
            $('#cpass').val('');
          }
        })
        .catch(err => {
          $('#h-alert').text('Network error :(');
          $('#modal-alert').modal('show');
        });
      } else {
        $('#h-alert').text('Too weak :(');
        $('#modal-alert').modal('show');
        $('#npass').val('');
        $('#cpass').val('');
      }
    } else {
      $('#h-alert').text('Not confirmed :(');
      $('#modal-alert').modal('show');
      $('#npass').val('');
      $('#cpass').val('');
    }
  }
}

$(document).ready(() => {
  $('#add').click(add);
  $('#un').keyup(e => {
    if (e.which == 13) add();
  });
  $('#npass').keyup(e => {
    if (e.which == 13) add();
  });
  $('#cpass').keyup(e => {
    if (e.which == 13) add();
  });
});