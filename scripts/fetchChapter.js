const fetch = require('node-fetch');

async function fetchChapterList(config, retries = 3) {
    const url = `http://www.yuetingba.cn/book/detail/${config.bookId}/0`;
    console.log('获取章节列表:', url);

    let html = '';
    // 尝试抓取最大重试次数
    while (retries > 0) {
        try {
            // 发起请求并获取 HTML
            html = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'text/html'
                }
            }).then(r => r.text());

            // 打印前1000个字符，确保能看到 playRecordsJson
            console.log(html.substring(0, 1000));

            // 查找 playRecordsJson
            const match = html.match(/var\s+playRecordsJson\s*=\s*(\[[\s\S]*?\]);/);
            if (match) break;

            // 如果没有找到 playRecordsJson，重试
            retries--;
            console.log(`未找到 playRecordsJson，重试 ${3 - retries} 次`);
        } catch (err) {
            retries--;
            console.error(`错误: ${err.message}，重试 ${3 - retries} 次`);
        }
    }

    // 如果重试次数用完，还没找到 playRecordsJson，抛出错误
    if (retries === 0) {
        throw new Error('未找到 playRecordsJson');
    }

    // 提取并解析 playRecordsJson
    const list = JSON.parse(html.match(/var\s+playRecordsJson\s*=\s*(\[[\s\S]*?\]);/)[1]);

    // 返回一个包含章节信息的数组
    return list.map(item => ({
        tingId: item.tingId,
        title: item.tingTitle,
        skip: Number(item.skip),
        bookId: item.bookId
    }));
}

module.exports = fetchChapterList;