require('dotenv').config();

const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PRIVATE_APP_ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_TOKEN;
const HUBSPOT_OBJECT_TYPE = process.env.HUBSPOT_OBJECT_TYPE;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const hubspotApi = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

app.get('/', async (req, res) => {
  try {
    const response = await hubspotApi.get(`/crm/v3/objects/${HUBSPOT_OBJECT_TYPE}`, {
      params: {
        properties: 'car_name,car_model,car_registration_number',
        limit: 100,
      },
    });

    res.render('homepage', {
      title: 'Homepage | Integrating With HubSpot I Practicum',
      records: response.data.results || [],
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Error loading records');
  }
});

app.get('/update-cobj', (req, res) => {
  res.render('updates', {
    title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
  });
});

app.post('/update-cobj', async (req, res) => {
  const { car_name, car_model, car_registration_number } = req.body;

  try {
    await hubspotApi.post(`/crm/v3/objects/${HUBSPOT_OBJECT_TYPE}`, {
      properties: {
        car_name,
        car_model,
        car_registration_number,
      },
    });

    res.redirect('/');
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Error creating record');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});