const { fetchAudio } = require('./fetchAudio');

async function fetchNewChapters(config, meta) {
    let skip = meta.lastSkip + 1;
    let emptyCount = 0;
    const newChapters = [];

    while (emptyCount < config.maxEmptyRetry) {
        const playUrl = config.playUrl(skip);
        console.log(`抓取 skip=${skip}`);

        const audio = await fetchAudio(playUrl);

        if (!audio) {
            emptyCount++;
            skip++;
            continue;
        }

        emptyCount = 0;

        newChapters.push({
            id: `${config.bookId}-${skip}`,
            title: `第 ${skip + 1} 集`,
            audio,
            pubDate: new Date().toUTCString()
        });

        meta.lastSkip = skip;
        skip++;
    }

    if (newChapters.length === 0) {
        meta.status = 'finished';
    }

    return newChapters;
}

module.exports = { fetchNewChapters };