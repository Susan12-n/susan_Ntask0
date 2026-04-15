const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/classify', async (req, res) => {
    const name = req.query.name;

    if (!name) {
        return res.status(400).json({
            status: "error",
            message: "Missing or empty name parameter"
        });
    }

    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
            status: "error",
            message: "Name must be a string"
        });
    }

    try {
        const response = await axios.get(`https://api.genderize.io?name=${name}`);
        const data = response.data;

        if (!data.gender || data.count === 0) {
            return res.status(404).json({
                status: "error",
                message: "No prediction available for the provided name"
            });
        }

        const is_confident =
            data.probability >= 0.7 && data.count >= 100;

        res.json({
            status: "success",
            data: {
                name: data.name,
                gender: data.gender,
                probability: data.probability,
                sample_size: data.count,
                is_confident
            },
            processed_at: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Server error"
        });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));