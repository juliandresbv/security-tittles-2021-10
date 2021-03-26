import http from 'k6/http';
import { sleep, check } from 'k6';
import { group } from 'k6';

const params = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export default function() {

 //has a group_duration metric associated, can filter in grafana WHERE
 //https://k6.io/docs/using-k6/tags-and-groups
  var res = http.get(`http://${__ENV.TARGET_HOST}/`, {tags: {mytag:"mytag"}});

  check(res, {
    "is status 200": r => r.status === 200,
    "form ok": r => r.json().from === 'GET'
  });


  group('mygroup', function() {
    //__VU is uniq for vu, __ITER is uniq for iteration
    var body = JSON.stringify({
      name: `name${__VU}-${__ITER}`
    });


    var res = http.post(`http://${__ENV.TARGET_HOST}/data`, body, params);

    check(res, {
      "is status 200": r => r.status === 200,
    });

    var body = res.json();
    check(body, {
      "id": r => r.id === "123",
      "name": r => r.name === `name${__VU}-${__ITER}`
    });
    let id = body.id;

    let res2 = http.get(`http://${__ENV.TARGET_HOST}/data/${id}`, params);
    let body2 = res2.json();

    check(body2, {
      "id": r => r.id === "123",
      "name": r => r.name === 'random name'
    });
  });

  sleep(1);
}
