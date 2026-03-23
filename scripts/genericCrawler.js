const fetch = require('node-fetch');
const { parse } = require('node-html-parser');

async function fetchHtml(url) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; YuetingBot/1.0)'
        }
    });
    if (!res.ok) throw new Error(`请求失败: ${res.status}`);
    return await res.text();
}

async function fetchChapterList(config) {
    if (!config.startUrl) throw new Error('缺少 startUrl，无法通用抓取');

    const html = await fetchHtml(config.startUrl);
    const root = parse(html);
    const anchors = root.querySelectorAll(config.listSelector || 'a');

    const chapters = anchors
        .map(a => ({
            title: a.text.trim(),
            url: new URL(a.getAttribute('href'), config.startUrl).toString()
        }))
        .filter(ch => ch.title && ch.url);

    // 去重并保序
    const seen = new Set();
    const ordered = [];
    for (const ch of chapters) {
        const key = ch.url;
        if (seen.has(key)) continue;
        seen.add(key);
        ordered.push(ch);
    }

    if (config.chapterLimit > 0) return ordered.slice(0, config.chapterLimit);
    return ordered;
}

async function fetchChapterContent(url, selector) {
    const html = await fetchHtml(url);
    const root = parse(html);
    const node = root.querySelector(selector || 'article');
    if (!node) return '';
    return node.text.replace(/\s+/g, ' ').trim();
}

async function crawlGeneric(config) {
    const list = await fetchChapterList(config);
    const results = [];
    let count = 0;
    for (const item of list) {
        count++;
        const text = await fetchChapterContent(item.url, config.contentSelector);
        if (!text) continue;
        results.push({
            tingId: item.url,
            title: item.title || `第${count}章`,
            text,
            link: item.url
        });
    }
    return results;
}

module.exports = crawlGeneric;
