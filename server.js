const express = require('express');
const responseTime = require('response-time');
const axios = require('axios');
const redis = require('redis');

const app = express();
const client = redis.createClient(process.env.REDIS_URL);

client.on('error', (err) => {
  console.log(`Redis Error: ${err}`);
});

app.use(responseTime());

app.get('/search', (req, res) => {
  const query = (req.query.query).trim();
  const searchURL = `https://en.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=${query}`;

  return client.get(`wikipedia:${query}`, (err, result) => {
    
    if(result) {
      const resultJSON = JSON.parse(result);
      return res.status(200).json(resultJSON);
    } else {
      return axios.get(searchURL)
        .then( response => {
          const responseJSON = response.data;
          client.setex(`wikipedia:${query}`, 3600, JSON.stringify({ source: 'Redis Cache', ...responseJSON, }));
          return res.status(200).json({ source: 'Wikipedia API', ...responseJSON, });
        })
        .catch( err => {
          return res.json(err);
        });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});