const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateCover(meta, novelDir) {
    const width = 1200;
    const height = 1200;
    const gradient = `linear-gradient(135deg, #2f80ed, #9b51e0)`;
    const title = escapeXml(meta.title || '有声小说');
    const author = escapeXml(meta.author || '佚名');

    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2f80ed" />
          <stop offset="100%" stop-color="#9b51e0" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <rect x="80" y="80" width="1040" height="1040" rx="80" fill="rgba(0,0,0,0.12)" />
      <text x="100" y="600" font-size="96" font-family="'Helvetica Neue', 'Noto Sans SC', sans-serif" fill="#fff" font-weight="700">${title}</text>
      <text x="100" y="720" font-size="64" font-family="'Helvetica Neue', 'Noto Sans SC', sans-serif" fill="#f2f2f2" font-weight="400">作者：${author}</text>
      <text x="100" y="820" font-size="52" font-family="'Helvetica Neue', 'Noto Sans SC', sans-serif" fill="#e0e0e0" font-weight="400">播客生成 · 自动更新</text>
    </svg>`;

    const svgBuffer = Buffer.from(svg);
    const outPath = path.join(novelDir, 'cover.png');
    await sharp(svgBuffer).png().toFile(outPath);
    return outPath;
}

function escapeXml(str) {
    return String(str).replace(/[<>]/g, '');
}

module.exports = generateCover;
