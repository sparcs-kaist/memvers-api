function get() {
  axios.get('/api/forward')
  .then(res => {
    if (res.data.expired) window.location.href = '/login';
    else {
      $('#mail').val(res.data.mail);
      $('#mail').prop('disabled', false);
    }
  })
  .catch(err => {
    $('#h-alert').text('Network error :(');
    $('#close').click(() => { window.location.href = '/'; });
    $('#modal-alert').modal('show');
  });
}

function save() {
  let mail = $('#mail').val();
  axios.post('/api/forward', { mail: mail })
  .then(res => {
    if (res.data.expired) window.location.href = '/login';
    else if (res.data.result) {
      $('#h-alert').text('Update succeeded :)');
      $('#close').click(() => { window.location.href = '/'; });
      $('#modal-alert').modal('show');
    } else {
      $('#h-alert').text('Update failed :(');
      $('#modal-alert').modal('show');
    }
  })
  .catch(err => {
    $('#h-alert').text('Network error :(');
    $('#modal-alert').modal('show');
  });
}

$(document).ready(() => {
  $('#mail').prop('disabled', true);
  get();

  $('#save').click(save);
  $('#mail').keyup(e => {
    if (e.which == 13) save();
  });
});
