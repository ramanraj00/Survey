import fetch from 'node-fetch';
async function run() {
  const res = await fetch('http://localhost:3000/api/surveys/my-surveys', {
    headers: { 'Authorization': 'Bearer INVALID' }
  });
  console.log(res.status);
}
run();
