const fs = require('fs');
const { create } = require('xmlbuilder2');

function generateRSS(meta, novelDir) {
    const feed = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('rss', { version: '2.0' })
        .ele('channel')
        .ele('title').txt(meta.title).up()
        .ele('link').txt(`http://www.yuetingba.cn/book/detail/${meta.id}/0`).up()
        .ele('description').txt(`主播: ${meta.speaker || '未知'}`).up();

    meta.chapters.forEach(ch => {
        feed.ele('item')
            .ele('title').txt(ch.title).up()
            .ele('enclosure', { url: ch.audioUrl, type: 'audio/mpeg' }).up()
            .ele('guid').txt(ch.tingId).up()
            .ele('pubDate').txt(new Date().toUTCString()).up()
            .up();
    });

    const xml = feed.end({ prettyPrint: true });
    fs.writeFileSync(`${novelDir}/feed.xml`, xml);
}

module.exports = generateRSS;