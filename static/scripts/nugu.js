var obj = {};

function disable(b) {
  $('#save').prop('disabled', b);
  for (field in fields) {
    $('#input-' + field).prop('disabled', b);
    $('#input-' + field).prop('readonly', b);
  }
}

function get() {
  disable(true);
  axios.get('/api/nugu')
  .then(res => {
    if (res.data.expired) window.location.href = '/login';
    else if (res.data.result) {
      obj = res.data.obj;
      draw(obj);
      disable(false);
    } else {
      $('#h-alert').text('User not found :(');
      $('#close').click(() => { window.location.href = '/'; });
      $('#modal-alert').modal('show');
    }
  })
  .catch(err => {
    $('#h-alert').text('Network error :(');
    $('#close').click(() => { window.location.href = '/'; });
    $('#modal-alert').modal('show');
  });
}

function save() {
  disable(true);
  let nobj = {};
  for (field in fields) {
    let type = fields[field].type;
    let value =
      (type === 'boolean') ?
      ($('#input-' + field).prop('checked') ? 1 : 0) :
      ($('#input-' + field).val());
    if (value !== obj[field]) nobj[field] = value;
  }
  axios.post('/api/nugu', { nobj: nobj })
  .then(res => {
    if (res.data.expired) window.location.href = '/login';
    else if (res.data.result) {
      $('#h-alert').text('Update succeeded :)');
      $('#close').click(() => { window.location.href = '/'; });
      $('#modal-alert').modal('show');
    } else {
      $('#h-alert').text('Update failed :(');
      $('#modal-alert').modal('show');
      $('#opass').val('');
    }
  })
  .catch(err => {
    $('#h-alert').text('Network error :(');
    $('#modal-alert').modal('show');
  });
}

$(document).ready(() => {
  get();
  $('#save').click(save);
  $('#close').click(() => { disable(false); });
});
