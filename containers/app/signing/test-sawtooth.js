require('dotenv').config()
const axios = require('axios');

const batchListBytes = Uint8Array.from(Buffer.from('CsEHCscBCkIwMjY4ZDRhMzIxMzQwMWQ5YWY1MjFkM2JmMDQ3MjJjYWVmYjZiYjZhYTQ0MmZmODIwYWYzNzcwYzM3MjhjOWRkOTYSgAE3OWE4MTQ1YTVkZDJjOThjMGU5OThkZWIxOTRlYjVlOWRlNWZkNGUzODMxMDE5ODY4YjcxODllYjg1NzdiZmVlNmZmZmU3ZmVmMTJmZTM2YWRiNjU3MzE2MGVhOGRjMjU3MzM5NTJjMDI2MWQ3NDFkOGVlYmVkYTM5NDQ3NTA2MxKAAWI4N2I1YzQ2MGY1ZGI5ZWJhYzIwY2FmN2UzOWU3MWNiNzUyZmQ1ZmY2NWNiYmM3ZGY5NzBmMzNiNWEyMzA0ZWY0YzAzNmE3OWQ0N2FlNTliMTEwM2Y4MGY2MjI0ZDJmNTUzNzI3YWMzY2NlYTRkYjBiYjc4Njk2NTQyNmU3ZmRlGvEECq4DCkIwMjY4ZDRhMzIxMzQwMWQ5YWY1MjFkM2JmMDQ3MjJjYWVmYjZiYjZhYTQ0MmZmODIwYWYzNzcwYzM3MjhjOWRkOTYaBmludGtleSIDMS4wKkYxY2YxMjYxM2U1OTk3MDg4YjcyMTg1NGU4MDYyZjQ5OWJkNzQ3MzJiOWUxODlhZTliNzhhMTg3ZWM4ODM2YTEzNTRmZGVhMgRoZXk0OkYxY2YxMjYxM2U1OTk3MDg4YjcyMTg1NGU4MDYyZjQ5OWJkNzQ3MzJiOWUxODlhZTliNzhhMTg3ZWM4ODM2YTEzNTRmZGVhSoABZTVkYWRkZDlhOTkwNWVlMzBiNzg3ZTliMDM4OWVhOWZhZWVlNTUxZjdkMmM1YWNjZjg3NWE4YmI4ZThhYzQ1YjBkNDM4MTkwNzJkNDMwMmE5MzQ2YWNjYWU2NjI4YzkzMWQ0MjBhNzg2MjBiNjFjMDQzODlhZDhlNGY0NDYxOWFSQjAyNjhkNGEzMjEzNDAxZDlhZjUyMWQzYmYwNDcyMmNhZWZiNmJiNmFhNDQyZmY4MjBhZjM3NzBjMzcyOGM5ZGQ5NhKAATc5YTgxNDVhNWRkMmM5OGMwZTk5OGRlYjE5NGViNWU5ZGU1ZmQ0ZTM4MzEwMTk4NjhiNzE4OWViODU3N2JmZWU2ZmZmZTdmZWYxMmZlMzZhZGI2NTczMTYwZWE4ZGMyNTczMzk1MmMwMjYxZDc0MWQ4ZWViZWRhMzk0NDc1MDYzGjt7ImZ1bmMiOiJwdXQiLCJwYXJhbXMiOnsiaWQiOiI5Mjg4IiwidmFsdWUiOiJkbyB0aGUgYmVzdCJ9fQ==',
  'base64'));

let params = {
  headers: {'Content-Type': 'application/octet-stream'}
};

(async () => {
  let r = await axios.post(`${process.env.SAWTOOTH_REST}/batches`, batchListBytes, params)

  let batchStatusLink = r.data.link;

  await new Promise((resolve) =>{
    setTimeout(()=>{
      resolve();
    }, 2000);
  });

  r = await axios.get(batchStatusLink);
  console.log(r.data);

  // r = await axios.get(`${process.env.SAWTOOTH_REST}/state/${address}`);
  // console.log(JSON.parse(Buffer.from(r.data.data, 'base64')));
})();
