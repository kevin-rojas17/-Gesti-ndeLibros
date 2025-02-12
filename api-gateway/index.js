const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const port = 5000;

app.use('/public', createProxyMiddleware({ target: 'http://localhost:3000', changeOrigin: true }));
app.use('/private', createProxyMiddleware({ target: 'http://localhost:4000', changeOrigin: true }));

app.listen(port, () => {
  console.log(`API Gateway escuchando en http://localhost:${port}`);
});
