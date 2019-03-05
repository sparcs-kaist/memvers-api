function checkSession(wheel) {
  axios.get('/api/un')
  .then(res => {
    if (res.data.expired) window.location.href = '/login';
    else if (wheel && res.data.un !== 'wheel') window.location.href = '/';
  })
  .catch(err => {
    window.location.href = '/';
  });
}
