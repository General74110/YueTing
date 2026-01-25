const puppeteer = require('puppeteer');

/**
 * 使用浏览器环境获取 playRecordsJson
 * @param {Object} config
 * @returns {Array<{tingId,title,skip,bookId}>}
 */
async function fetchChapterList(config) {
    const url = `http://www.yuetingba.cn/book/detail/${config.bookId}/0`;
    console.log('使用浏览器获取章节列表:', url);

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: 'new'
    });

    const page = await browser.newPage();

    await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36'
    );

    await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 0
    });

    // 等待 playRecordsJson 出现
    await page.waitForFunction(
        () => Array.isArray(window.playRecordsJson) && window.playRecordsJson.length > 0,
        { timeout: 60_000 }
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