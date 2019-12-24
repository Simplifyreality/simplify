const express = require('express');
const app = express();
const proxy = require('http-proxy').createProxyServer({
  secure: false, // don't check TLS certificate
});

app.use(express.static(__dirname));

app.all('/tma-middleware/*', (req, res) => {
  console.log(`> Proxy pass '${req.originalUrl}'`);

  proxy.web(req, res, {
    target: 'https://test1-eurostar-aws.isdev.info'
  });
});

app.listen(3000);
