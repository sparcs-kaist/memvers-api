function change() {
  let npass = $('#npass').val();
  let cpass = $('#cpass').val();
  if (npass === cpass) {
    if (checkPassword(npass)) {
      let href = window.location.href;
      if (href.endsWith('/')) href = href.substring(0, href.length - 1);
      let index = href.lastIndexOf('/');
      axios.post('/api/reset' + href.substring(index), { npass: npass })
      .then(res => {
        if (res.data.result) {
          if (res.data.succ) {
            $('#h-alert').text('Update succeeded :)');
            $('#close').click(() => { location.replace("https://edalias.sparcs.org"); });
            $('#modal-alert').modal('show');
          } else {
            $('#h-alert').text('Update failed :(');
            $('#modal-alert').modal('show');
		  }
        } else {
          $('#h-alert').text('Link expired :(');
          $('#close').click(() => { location.replace("https://edalias.sparcs.org"); });
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
});
