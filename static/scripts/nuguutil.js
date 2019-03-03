function draw(obj, i) {
  if (!i) i = '';
  for (field in fields) {
    let type = fields[field].type;
    let desc = fields[field].desc;
    if (type === 'boolean') {
      $('#div-nugu').append(`<div id="div-${field}${i}" class="form-check"></div>`);
      $(`#div-${field}${i}`).append(
        `<input id="input-${field}${i}" type="checkbox" class="form-check-input" disabled>`
      );
      $(`#div-${field}${i}`).append(
        `<label class="form-check-label" for="input-${desc}">${desc}</label>`
      );
      $(`#input-${field}${i}`).prop('checked', obj[field] === 1);
    } else {
      $('#div-nugu').append(`<div id="div-${field}${i}" class="input-group mb-3"></div>`);
      $(`#div-${field}${i}`).append(
        `<div class="input-group-prepend"><span class="input-group-text">${desc}</span></div>`
      );
      $(`#div-${field}${i}`).append(
        `<input id="input-${field}${i}" type="text" class="form-control" aria-label="${field}" aria-describedby="basic-addon1" readonly>`
      );
      $(`#input-${field}${i}`).val(obj[field]);
    }
  }
}

const fields = {
  is_private: { desc: '외부 비공개', type: 'boolean' },
  is_developer: { desc: '개발자', type: 'boolean' },
  is_designer: { desc: '디자이너', type: 'boolean' },
  is_undergraduate: { desc: '학부생', type: 'boolean' },
  name: { desc: '이름', type: 'string' },
  ent_year: { desc: 'KAIST 입학년도', type: 'string' },
  email: { desc: '이메일', type: 'string' },
  phone: { desc: '전화번호', type: 'string' },
  birth: { desc: '생일', type: 'string' },
  org: { desc: '소속 단체', type: 'string' },
  dorm: { desc: '기숙사', type: 'string' },
  lab: { desc: '연구실', type: 'string' },
  home_add: { desc: '주소', type: 'string' },
  github_id: { desc: 'GitHub ID', type: 'string' },
  linkedin_url: { desc: 'LinkedIn URL', type: 'string' },
  behance_url: { desc: 'Behance URL', type: 'string' },
  facebook_id: { desc: 'Facebook ID', type: 'string' },
  twitter_id: { desc: 'Twitter ID', type: 'string' },
  battlenet_id: { desc: 'Battle.net ID', type: 'string' },
  website: { desc: '홈페이지 URL', type: 'string' },
  blog: { desc: '블로그 URL', type: 'string' }
};
