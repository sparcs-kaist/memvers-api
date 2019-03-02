function del() {
  let un = $('#un').val();
  if (un) {
    axios.post('/api/wheel/delete', { un: un })
    .then(res => {
      if (res.data.expired) window.location.href = '/login';
      else if (res.data.result) {
        $('#h-alert').text('Deletion succeeded :)');
        $('#close').click(() => { window.location.href = '/'; });
        $('#modal-alert').modal('show');
      } else {
        $('#h-alert').text('Deletion failed:(');
        $('#modal-alert').modal('show');
        $('#un').val('');
      }
    })
    .catch(err => {
      $('#h-alert').text('Network error :(');
      $('#modal-alert').modal('show');
    });
  }
}

$(document).ready(() => {
  $('#add').click(del);
  $('#un').keyup(e => {
    if (e.which == 13) del();
  });
});
