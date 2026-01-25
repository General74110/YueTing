const fs = require('fs');
const path = require('path');

const config = require('./config/novel');
const fetchChapterList = require('./scripts/fetchChapterList');
const fetchAudio = require('./scripts/fetchAudio');
const generateRSS = require('./scripts/generateRSS');

(async () => {
    const novelDir = path.join(__dirname, 'novels', config.id);
    const metaFile = path.join(novelDir, 'meta.json');

    if (!fs.existsSync(novelDir)) fs.mkdirSync(novelDir, { recursive: true });

    let meta = fs.existsSync(metaFile)
        ? JSON.parse(fs.readFileSync(metaFile))
        : {
            id: config.id,
            title: config.title,
            author: config.author,
            chapters: []
        };

    meta.chapters ||= [];

    const existed = new Set(meta.chapters.map(c => c.tingId));

    const list = await fetchChapterList(config);
    console.log(`共发现章节 ${list.length} 个`);

    let added = 0;

    for (const item of list) {
        if (existed.has(item.tingId)) continue;

        console.log('抓取:', item.title);

        const audio = await fetchAudio({
            bookId: config.bookId,
            tingId: item.tingId,
            title: item.title
        });

        if (!audio) continue;

        meta.chapters.push({
            tingId: item.tingId,
            title: item.title,
            audioUrl: audio.url
        });

        added++;
    }

    fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2));

    if (added > 0) {
        generateRSS(meta, novelDir);
        console.log(`新增章节：${added}`);
    } else {
        console.log('没有新章节');
    }
})();