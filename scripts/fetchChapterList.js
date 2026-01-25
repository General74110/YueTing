const fetch = require('node-fetch');

async function fetchChapterList(config) {
    const url = `http://www.yuetingba.cn/book/detail/${config.bookId}/0`;
    console.log('获取章节列表:', url);

    const html = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'text/html'
        }
    }).then(r => r.text());

    const match = html.match(/var\s+playRecordsJson\s*=\s*(\[[\s\S]*?\]);/);
    if (!match) {
        throw new Error('未找到 playRecordsJson');
    }

    const list = JSON.parse(match[1]);

    return list.map(item => ({
        tingId: item.tingId,
        title: item.tingTitle,
        skip: Number(item.skip),
        bookId: item.bookId
    }));
}

module.exports = fetchChapterList;