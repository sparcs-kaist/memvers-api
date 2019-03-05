function disable(b) {
  $('#name').prop('disabled', b);
  $('#search').prop('disabled', b);
  if (b) $('#div-nugu').empty();
}

function search() {
  let name = $('#name').val();
  console.log(name);
  if (name) {
    disable(true);
    axios.post('/api/nugus', { name: name })
    .then(res => {
      if (res.data.expired) window.location.href = '/login';
      else if (res.data.result) {
        let objs = res.data.objs;
        if (objs) objs.forEach(obj => { draw(obj, obj.id); });
        else {
          $('#h-alert').text('Not found :(');
          $('#modal-alert').modal('show');
          $('#name').val('');
        }
        disable(false);
      } else {
        $('#h-alert').text('Search failed :(');
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
}

$(document).ready(() => {
  checkSession();
  $('#search').click(search);
  $('#name').keyup(e => {
    if (e.which == 13) search();
  });
});
