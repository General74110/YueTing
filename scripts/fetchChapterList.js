const puppeteer = require('puppeteer');
const fetch = require('node-fetch');

async function extractFromHtml(html, bookId) {
    const match = html.match(/playRecordsJson\\s*=\\s*(\\[[\\s\\S]*?\\])/);
    if (!match) return null;
    try {
        const arr = JSON.parse(match[1]);
        return arr.map(item => ({
            tingId: item.tingId,
            title: item.tingTitle,
            skip: Number(item.skip),
            bookId: item.bookId || bookId
        }));
    } catch {
        return null;
    }
}

async function fetchViaHttp(config) {
    const url = `http://www.yuetingba.cn/book/detail/${config.bookId}/0`;
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; YuetingBot/1.0)'
        }
    });
    const html = await res.text();
    const list = await extractFromHtml(html, config.bookId);
    if (!list) throw new Error('HTTP 解析章节失败');
    console.log(`HTTP 直接解析章节数: ${list.length}`);
    return list;
}

async function fetchChapterList(config) {
    const url = `http://www.yuetingba.cn/book/detail/${config.bookId}/0`;
    console.log('使用浏览器获取章节列表:', url);

    // 若指定跳过浏览器，直接 HTTP 解析
    if (process.env.NO_BROWSER === '1') {
        return fetchViaHttp(config);
    }

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

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    let chapters;
    try {
        await page.waitForFunction(
            () => Array.isArray(window.playRecordsJson) && window.playRecordsJson.length > 0,
            { timeout: 30_000 }
        );
        chapters = await page.evaluate(() => {
            return window.playRecordsJson.map(item => ({
                tingId: item.tingId,
                title: item.tingTitle,
                skip: Number(item.skip),
                bookId: item.bookId
            }));
        });
    } catch (err) {
        console.warn('浏览器等待超时，尝试源码解析...', err.message);
        const html = await page.content();
        chapters = await extractFromHtml(html, config.bookId);
    }

    await browser.close();

    if (!chapters || chapters.length === 0) {
        console.warn('浏览器模式失败，切换 HTTP 直抓...');
        return fetchViaHttp(config);
    }

    console.log(`获取到章节数: ${chapters.length}`);
    return chapters;
}

module.exports = fetchChapterList;
