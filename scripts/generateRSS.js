const fs = require('fs');

function generateRSS(meta, config, output) {
    const items = meta.chapters.map(c => `
  <item>
    <title>${c.title}</title>
    <enclosure url="${c.audio}" type="audio/mpeg"/>
    <guid>${c.id}</guid>
    <pubDate>${c.pubDate}</pubDate>
  </item>
  `).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${config.title}</title>
  <description>${config.author} - ${config.speaker}</description>
  <link>http://www.yuetingba.cn</link>
  ${items}
</channel>
</rss>`;

    fs.writeFileSync(output, rss);
}

module.exports = { generateRSS };