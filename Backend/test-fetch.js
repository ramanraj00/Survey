async function test() {
  const res = await fetch('http://localhost:3000/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'r02519625@gmail.com', password: 'Nxd491651#' })
  });
  console.log(res.status, await res.text());
}
test();
