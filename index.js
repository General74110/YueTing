const fs = require('fs');
const path = require('path');

const config = require('./config/novel');
const fetchChapterList = require('./scripts/fetchChapterList');
const fetchAudio = require('./scripts/fetchAudio');
const generateRSS = require('./scripts/generateRSS');

(async () => {
    const novelDir = path.join(__dirname, 'novels', config.id);
    if (!fs.existsSync(novelDir)) fs.mkdirSync(novelDir, { recursive: true });

    const metaFile = path.join(novelDir, 'meta.json');
    let meta = fs.existsSync(metaFile)
        ? JSON.parse(fs.readFileSync(metaFile))
        : { id: config.id, title: config.title, author: config.author, speaker: config.speaker, chapters: [] };

    meta.chapters ||= [];
    const existed = new Set(meta.chapters.map(c => c.tingId));

    const list = await fetchChapterList(config);

    let added = 0;
    for (const item of list) {
        if (existed.has(item.tingId)) continue;

        const audio = await fetchAudio({
            bookId: item.bookId,
            tingId: item.tingId,
            title: item.title
        });

        if (!audio) continue;

        meta.chapters.push({ tingId: item.tingId, title: item.title, audioUrl: audio.url });
        added++;
        console.log('新增章节:', item.title);
    }

    fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2));

    if (added > 0) generateRSS(meta, novelDir);

    console.log(`运行完成，本次新增章节: ${added}`);
})();