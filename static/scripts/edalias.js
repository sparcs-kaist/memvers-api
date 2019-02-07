var un = '';
var pw = '';
var all = [];
var aliases = [];

function login() {
  un = $('#un').val();
  pw = $('#pw').val();
  if (un && pw) {
    axios.post('/login', { un: un, pw: pw })
    .then(res => {
      if (res.data.result) {
        all = res.data.all;
        info = res.data.info;
        aliases = res.data.aliases;
        mail = res.data.mail;
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
        $('#mail').val(mail);

        $('#modal-action').modal('show');
      } else {
        $('#h-alert').text('Login failed :(');
        $('#modal-alert').modal('show');
        $('#pw').val('');
      }
    })
    .catch(err => {
      $('#h-alert').text('Network error :(');
      $('#modal-alert').modal('show');
    });
  }
}

function init() {
  un = '';
  pw = '';
  all = [];
  aliases = [];

  $('#un').val('');
  $('#pw').val('');
  $('#name').val('');
  $('#desc').val('');
  $('#div-list').html('');
  $('#div-alias').hide();
  $('#div-create').hide();
  $('#div-forward').hide();
  $('#div-login').show();
}

function _acceptable(ch) {
  return ('a' <= ch && ch <= 'z') || ('0' <= ch && ch <= '9') || ch === '-';
}

function acceptable(str) {
  for (var i = 0; i < str.length; i++)
    if (!_acceptable(str[i])) return false;
  return true;
}

$(document).ready(() => {
  $('#login').click(login);
  $('#pw').keyup(e => {
    if (e.which == 13) login();
  });
  $('#update').click(() => {
    let added = all.filter(m => {
      return $(`#check-${m}`).prop('checked') && !aliases.includes(m);
    });
    let removed = aliases.filter(m => {
      return !$(`#check-${m}`).prop('checked');
    });
    axios.post('/update', { un: un, pw: pw, added: added, removed: removed })
    .then(res => {
      if (res.data.result) {
        $('#h-alert').text('Update succeeded :)');
        $('#modal-alert').modal('show');
      } else {
        $('#h-alert').text('Authentication error :(');
        $('#modal-alert').modal('show');
      }
      init();
    })
    .catch(err => {
      $('#h-alert').text('Network error :(');
      $('#modal-alert').modal('show');
    });
  });
  $('#create').click(() => {
    let name = $('#name').val();
    let desc = $('#desc').val();
    if (name && desc) {
      if (acceptable(name)) {
        axios.post('/create', { un: un, pw: pw, name: name, desc: desc })
        .then(res => {
          if (res.data.result) {
            if (res.data.succ) {
              $('#h-alert').text('Creation succeeded :)');
              $('#modal-alert').modal('show');
              init();
            } else {
              $('#h-alert').text('Existing name :(');
              $('#modal-alert').modal('show');
            }
          } else {
            $('#h-alert').text('Authentication error :(');
            $('#modal-alert').modal('show');
            init();
          }
        })
        .catch(err => {
          $('#h-alert').text('Network error :(');
          $('#modal-alert').modal('show');
        });
      } else {
        $('#h-alert').text('Use a-z, 0-9, or -');
        $('#modal-alert').modal('show');
      }
    }
  });
  $('#save').click(() => {
    let mail = $('#mail').val();
    axios.post('/forward', { un: un, pw: pw, mail: mail })
    .then(res => {
      if (res.data.result) {
        if (res.data.succ) {
          $('#h-alert').text('Update succeeded :)');
          $('#modal-alert').modal('show');
          init();
        } else {
          $('#h-alert').text('Update failed :(');
          $('#modal-alert').modal('show');
        }
      } else {
        $('#h-alert').text('Authentication error :(');
        $('#modal-alert').modal('show');
        init();
      }
    })
    .catch(err => {
      $('#h-alert').text('Network error :(');
      $('#modal-alert').modal('show');
    });
  });
  $('#new').click(() => {
    $('#div-login').hide();
    $('#div-create').show();
  });
  $('#fwd').click(() => {
    $('#div-login').hide();
    $('#div-forward').show();
  });
  $('#edit').click(() => {
    $('#div-login').hide();
    $('#div-alias').show();
  });
});
