function disable(b) {
  $('#un').prop('disabled', b);
  $('#name').prop('disabled', b);
  $('#npass').prop('disabled', b);
  $('#cpass').prop('disabled', b);
  $('#add').prop('disabled', b);
}

function add() {
  let un = $('#un').val();
  let name = $('#name').val();
  let npass = $('#npass').val();
  let cpass = $('#cpass').val();
  if (un && name && npass && cpass) {
    disable(true);
    if (npass === cpass) {
      if (checkPassword(npass)) {
        axios.post('/api/wheel/add', { un: un, name: name, npass: npass })
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
  $('#name').keyup(e => {
    if (e.which == 13) add();
  });
  $('#npass').keyup(e => {
    if (e.which == 13) add();
  });
  $('#cpass').keyup(e => {
    if (e.which == 13) add();
  });
  $('#close').click(() => { disable(false); });
});
