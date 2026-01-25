const puppeteer = require('puppeteer');

async function fetchChapterList(config) {
    const url = `http://www.yuetingba.cn/book/detail/${config.bookId}/0`;
    console.log('使用浏览器获取章节列表:', url);

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: 'new',
        timeout: 0,                  // launch 本身不超时
        protocolTimeout: 180000,    // 3 分钟，增加 DevTools 通信超时
    });

    const page = await browser.newPage();

    await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

    await page.waitForFunction(
        () => Array.isArray(window.playRecordsJson) && window.playRecordsJson.length > 0,
        { timeout: 180_000 } // 保留 waitForFunction 超时
    );

    const chapters = await page.evaluate(() => {
        return window.playRecordsJson.map(item => ({
            tingId: item.tingId,
            title: item.tingTitle,
            skip: Number(item.skip),
            bookId: item.bookId
        }));
    });

    await browser.close();

    console.log(`获取到章节数: ${chapters.length}`);
    return chapters;
}

module.exports = fetchChapterList;