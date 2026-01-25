const fetch = require('node-fetch');

/**
 * 从悦听吧章节列表 JSON 接口获取全量章节
 */
async function fetchChapterList(config) {
    // 这里替换为真实抓包得到的章节列表接口
    const url = `http://36.5.86.89:52001/chapters?bookId=${config.bookId}`;
    console.log('获取章节列表:', url);

    const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });

    if (!res.ok) throw new Error(`请求章节列表失败: ${res.status}`);

    const data = await res.json();

    if (!data || !data.data) throw new Error('章节列表 JSON 不正确');

    return data.data.map(item => ({
        tingId: item.tingId,
        title: item.title || item.tingTitle,
        skip: item.skip ?? 0,
        bookId: config.bookId
    }));
}

module.exports = fetchChapterList;