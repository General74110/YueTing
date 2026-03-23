const fs = require('fs');
const { create } = require('xmlbuilder2');

function generateRSS(meta, novelDir, options = {}) {
    const { audioBase, coverUrl } = options;

    const feed = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('rss', { version: '2.0', 'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd' })
        .ele('channel')
        .ele('title').txt(meta.title).up()
        .ele('link').txt(meta.link || 'https://example.com').up()
        .ele('description').txt(`主播: ${meta.speaker || '未知'}`).up();

    const cover = coverUrl || meta.coverUrl;
    if (cover) feed.ele('itunes:image', { href: cover }).up();

    meta.chapters.forEach(ch => {
        const audio = audioBase && ch.localAudio ? `${audioBase}/${ch.localAudio}` : ch.audioUrl;
        feed.ele('item')
            .ele('title').txt(ch.title).up()
            .ele('enclosure', { url: audio, type: 'audio/mpeg' }).up()
            .ele('guid').txt(ch.tingId).up()
            .ele('link').txt(ch.link || audio).up()
            .ele('pubDate').txt(ch.pubDate || new Date().toUTCString()).up()
            .up();
    });

    const xml = feed.end({ prettyPrint: true });
    fs.writeFileSync(`${novelDir}/feed.xml`, xml);
}

module.exports = generateRSS;
