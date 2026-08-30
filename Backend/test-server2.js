import express from 'express';
const app = express();
const server = app.listen(3000, () => {
  console.log('Listening on 3000');
});
setInterval(() => {}, 1000);
