const axios = require('axios');

module.exports = async (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({
            status: "error",
            message: "Missing or empty name parameter"
        });
    }
    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
            status: "error",
            message: "Name  must be a string"
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

        return res.status(200).json({
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
        return res.status(500).json({
            status: "error",
            message: "Server error"
        });
    }
};