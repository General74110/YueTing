const fs = require('fs');
const path = require('path');

const loadConfig = require('./scripts/loadConfig');
const fetchChapterList = require('./scripts/fetchChapterList');
const fetchAudio = require('./scripts/fetchAudio');
const crawlGeneric = require('./scripts/genericCrawler');
const textToSpeech = require('./scripts/textToSpeech');
const generateCover = require('./scripts/generateCover');
const generateRSS = require('./scripts/generateRSS');

(async () => {
    const config = loadConfig();
    const novelDir = path.join(__dirname, 'novels', config.id);
    const ttsDir = path.join(novelDir, 'tts');
    if (!fs.existsSync(novelDir)) fs.mkdirSync(novelDir, { recursive: true });
    if (!fs.existsSync(ttsDir)) fs.mkdirSync(ttsDir, { recursive: true });

    const metaFile = path.join(novelDir, 'meta.json');
    let meta = fs.existsSync(metaFile)
        ? JSON.parse(fs.readFileSync(metaFile))
        : { id: config.id, title: config.title, author: config.author, speaker: config.speaker, chapters: [] };

    meta.chapters ||= [];
    meta.title = config.title;
    meta.author = config.author;
    meta.speaker = config.speaker;
    meta.link = config.startUrl || `http://www.yuetingba.cn/book/detail/${config.bookId || config.id}/0`;

    const existed = new Set(meta.chapters.map(c => c.tingId));

    let list = [];
    if (config.site === 'yuetingba') {
        list = await fetchChapterList(config);
    } else {
        list = await crawlGeneric(config);
    }

    let added = 0;
    for (const item of list) {
        if (existed.has(item.tingId)) continue;

        let audioUrl = null;
        let localAudio = null;

        if (config.site === 'yuetingba') {
            const audio = await fetchAudio({
                bookId: item.bookId,
                tingId: item.tingId,
                title: item.title
            });
            if (!audio) continue;
            audioUrl = audio.url;
        } else {
            const speech = await textToSpeech(item.text, {
                engine: config.ttsEngine,
                voice: config.ttsVoice,
                outDir: ttsDir,
                title: item.title
            });
            localAudio = path.relative(novelDir, speech.path).replace(/\\/g, '/');
            audioUrl = config.audioBase ? `${config.audioBase}/novels/${config.id}/${localAudio}` : localAudio;
        }

        meta.chapters.push({
            tingId: item.tingId,
            title: item.title,
            audioUrl,
            localAudio,
            link: item.link || item.url || config.startUrl,
            pubDate: new Date().toUTCString()
        });
        added++;
        console.log('新增章节:', item.title);
    }

    const coverPath = await generateCover(meta, novelDir);
    if (coverPath) {
        meta.cover = path.relative(novelDir, coverPath).replace(/\\/g, '/');
        if (config.audioBase) meta.coverUrl = `${config.audioBase}/novels/${config.id}/${meta.cover}`;
    }

    fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2));

    if (added > 0) generateRSS(meta, novelDir, { audioBase: config.audioBase ? `${config.audioBase}/novels/${config.id}` : null, coverUrl: meta.coverUrl });

    console.log(`运行完成，本次新增章节: ${added}`);
})();
