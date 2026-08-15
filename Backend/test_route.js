async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/surveys/my-surveys', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch(e) {
    console.error(e);
  }
}
run();
