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
    window.location.href = '/';
  });
});

function logout() {
  axios.get('/api/logout');
  window.location.href = '/login';
}
