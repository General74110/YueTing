const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const edgeTTS = require('edge-tts');
const gTTS = require('gtts');

/**
 * 将文本转 MP3，返回 { path, filename }
 * @param {string} text 文本
 * @param {object} options { voice, engine, outDir, title }
 */
async function textToSpeech(text, options = {}) {
    const voice = options.voice || 'zh-CN-XiaoxiaoNeural';
    const engine = options.engine || 'edge'; // edge | gtts
    const outDir = options.outDir || path.join(process.cwd(), 'output');
    const title = options.title || uuidv4();

    fs.mkdirSync(outDir, { recursive: true });

    const filename = `${sanitize(title)}.mp3`;
    const outPath = path.join(outDir, filename);

    if (engine === 'gtts') {
        await synthesizeWithGtts(text, outPath);
    } else {
        await synthesizeWithEdge(text, voice, outPath);
    }

    return { path: outPath, filename };
}

async function synthesizeWithEdge(text, voice, outPath) {
    const readable = await edgeTTS.tts(text, voice, { format: 'audio-48khz-192kbitrate-mono-mp3' });
    await streamToFile(readable, outPath);
}

function streamToFile(readable, outPath) {
    return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(outPath);
        readable.pipe(stream);
        readable.on('error', reject);
        stream.on('finish', resolve);
        stream.on('error', reject);
    });
}

function synthesizeWithGtts(text, outPath) {
    return new Promise((resolve, reject) => {
        const tts = new gTTS(text, 'zh');
        tts.save(outPath, (err) => (err ? reject(err) : resolve()));
    });
}

function sanitize(name) {
    return String(name).replace(/[^a-zA-Z0-9-_]/g, '_');
}

module.exports = textToSpeech;
