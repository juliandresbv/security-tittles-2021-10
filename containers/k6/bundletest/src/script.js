//https://k6.io/docs/using-k6/modules

import _ from 'underscore';
import http from 'k6/http';
import { sleep, check } from 'k6';


export let options = {
  thresholds: {
    // 90% of requests must finish within 100ms.
    'http_req_duration': ['p(90) < 100'],
  }
}

const params = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export default function() {
  var body = JSON.stringify({
    email: 'aaa',
    password: 'bbb',
  });

  var res = http.post(`http://${__ENV.TARGET_HOST}/data`, body, params);
  check(res, {
    "is status 200": r => r.status === 200,
  });

  var body = JSON.parse(res.body);
  // console.log(JSON.stringify(body));
  check(body, {
    "body": r =>  _.isEqual(r, {id:'123',email: 'aaa',password: 'bbb'})
  });


  sleep(1);
}
