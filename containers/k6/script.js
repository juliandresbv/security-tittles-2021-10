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
  var res = http.post(`http://${__ENV.TARGET_HOST}/api/auth/signup`, {});

  check(res, {
    "is status 200": r => r.status === 200
  });

  sleep(1);
}
