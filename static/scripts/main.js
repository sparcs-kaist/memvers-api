$(document).ready(() => {
  axios.get('/api/un')
  .then(res => {
    if (res.data.expired) window.location.href = '/login';
    else if (res.data.un === 'wheel') {
      $('.a-wheel').css('display', 'flex');
      $('.a-non-wheel').css('display', 'none');
    }
  })
  .catch(err => {
    $('#h-alert').text('Network error :(');
    $('#close').click(() => { window.location.href = '/'; });
    $('#modal-alert').modal('show');
  });
});
