async function run() {
  try {
    const res = await fetch("http://localhost:3000/api/admin/stats", {
      headers: { "Cookie": "userRole=admin; better-auth.session_token=mock" }
    });
    console.log(res.status);
    const text = await res.text();
    console.log(text);
  } catch (e) { console.log(e); }
}
run();
