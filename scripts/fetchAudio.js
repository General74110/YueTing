const fetch = require('node-fetch');

async function fetchAudio({ bookId, tingId, title }) {
    const res = await fetch('http://36.5.86.89:52001/plays/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://www.yuetingba.cn',
            'Referer': 'http://www.yuetingba.cn/',
            'User-Agent': 'Mozilla/5.0'
        },
        body: JSON.stringify({
            bookId,
            tingId,
            tingTitle: title,
            position: 0,
            isNew: false
        })
    });

    const json = await res.json();

    const audioPath = json?.data?.filePath || json?.data?.audio || json?.data?.url;

    if (!audioPath) return null;

    return {
        url: audioPath.startsWith('http') ? audioPath : `http://185.242.234.59:36512${audioPath}`
    };
}

module.exports = fetchAudio;