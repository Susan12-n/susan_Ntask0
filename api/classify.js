const axios = require('axios');

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method !== 'GET') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  const { name } = req.query;

  if (name === undefined || name === '') {
    return res.status(400).json({
      status: 'error',
      message: 'Missing or empty name parameter'
    });
  }

  if (typeof name !== 'string') {
    return res.status(422).json({
      status: 'error',
      message: 'name is not a string'
    });
  }

  try {
    const response = await axios.get('https://api.genderize.io', {
      params: { name }
    });

    const { gender, probability, count } = response.data;

    if (!gender || count === 0) {
      return res.status(200).json({
        status: 'error',
        message: 'No prediction available for the provided name'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        name: name.toLowerCase(),
        gender,
        probability,
        sample_size: count,
        is_confident: probability >= 0.7 && count >= 100,
        processed_at: new Date().toISOString()
      }
    });

  } catch (err) {
    const status = err.response ? 502 : 500;
    return res.status(status).json({
      status: 'error',
      message: 'Upstream or server failure'
    });
  }
};