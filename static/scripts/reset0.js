function resetPassword() {
  let un = $('#un-reset').val();
  if (un) {
    axios.post('/api/reset', { un: un });
    window.location.href = '/login';
  }
}

$(document).ready(() => {
  $('#resetpass').click(resetPassword);
  $('#un-reset').keyup(e => {
    if (e.which == 13) resetPassword();
  });
});
