var all = [];
var aliases = [];

function disable(b) {
  $('#update').prop('disabled', b);
}

function get() {
  disable(true);
  axios.get('/api/edalias')
  .then(res => {
    if (res.data.expired) window.location.href = '/login';
    else {
      all = res.data.all;
      aliases = res.data.aliases;
      let info = res.data.info;
      $('#div-list').html('');
      all.forEach(m => {
        $('#div-list').append(`<div class="form-check" id="check-div-${m}"></div>`);
        $(`#check-div-${m}`).append(`<input class="form-check-input" type="checkbox" value="" id="check-${m}">`);
        $(`#check-div-${m}`).append(`<label class="form-check-label" for="check-${m}">${m}</label>`);
        let i = info[m];
        if (i) $(`#check-div-${m}`).append(`<label class="form-check-label">&nbsp(${i.trim()})</label>`);
      });
      aliases.forEach(m => {
        $(`#check-${m}`).attr('checked', true);
      });
      disable(false);
    }
  })
  .catch(err => {
    $('#h-alert').text('Network error :(');
    $('#close').click(() => { window.location.href = '/'; });
    $('#modal-alert').modal('show');
  });
}

function update() {
  disable(true);
  let added = all.filter(m => {
    return $(`#check-${m}`).prop('checked') && !aliases.includes(m);
  });
  let removed = aliases.filter(m => {
    return !$(`#check-${m}`).prop('checked');
  });
  axios.post('/api/edalias', { added: added, removed: removed })
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
  get();
  $('#update').click(update);
  $('#close').click(() => { disable(false); });
});
