const fs = require('fs');
const path = require('path');

const config = require('./config/novel');
const { fetchNewChapters } = require('./scripts/fetchChapter');
const { generateRSS } = require('./scripts/generateRSS');

const baseDir = path.join(__dirname, 'novels', config.id);
const metaFile = path.join(baseDir, 'meta.json');
const feedFile = path.join(baseDir, 'feed.xml');

if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
}

const meta = fs.existsSync(metaFile)
    ? JSON.parse(fs.readFileSync(metaFile))
    : {
        id: config.id,
        title: config.title,
        status: 'serial',
        lastSkip: -1,
        chapters: []
    };

(async () => {
    if (meta.status === 'finished') {
        console.log('小说已完本，跳过');
        return;
    }

    const newChapters = await fetchNewChapters(config, meta);
    meta.chapters.push(...newChapters);

    fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2));
    generateRSS(meta, config, feedFile);

    console.log(`新增章节：${newChapters.length}`);
})();