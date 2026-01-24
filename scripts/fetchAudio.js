const axios = require('axios');

async function fetchAudio(playUrl) {
    const res = await axios.get(playUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0'
        },
        timeout: 15000
    });

    const match = res.data.match(/https?:\/\/[^"' ]+\.mp3/);
    if (!match) return null;

    return decodeURI(match[0]);
}

module.exports = { fetchAudio };