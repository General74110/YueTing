const path = require('path');
const minimist = require('minimist');
const base = require('../config/novel');

function loadConfig() {
    const argv = minimist(process.argv.slice(2));
    const env = process.env;

    const pick = (key, fallback) => argv[key] || env[key.toUpperCase()] || fallback;

    const site = pick('site', base.site || 'yuetingba');

    const id = sanitizeId(
        pick('id', env.INPUT_ID) || pick('novel_id') || base.id || 'novel'
    );

    const title = pick('title', base.title || '未命名小说');
    const author = pick('author', base.author || '佚名');
    const speaker = pick('speaker', base.speaker || 'AI 朗读');
    const bookId = pick('bookId', base.bookId);

    const startUrl = pick('start_url', env.START_URL || base.startUrl);
    const listSelector = pick('list_selector', base.listSelector || 'a');
    const contentSelector = pick('content_selector', base.contentSelector || 'article, #content, .content');
    const nextSelector = pick('next_selector', base.nextSelector);
    const coverUrl = pick('cover_url', base.coverUrl);

    const ttsEngine = pick('tts_engine', base.ttsEngine || 'edge');
    const ttsVoice = pick('tts_voice', base.ttsVoice || 'zh-CN-XiaoxiaoNeural');
    const chapterLimit = Number(pick('chapter_limit', base.chapterLimit)) || 0; // 0 = all

    const repo = env.GITHUB_REPOSITORY;
    const ref = env.GITHUB_REF_NAME || env.GITHUB_REF || 'master';
    const audioBase =
        pick('audio_base', base.audioBase) ||
        (repo ? `https://raw.githubusercontent.com/${repo}/${stripRef(ref)}` : null);

    return {
        ...base,
        site,
        id,
        title,
        author,
        speaker,
        bookId,
        startUrl,
        listSelector,
        contentSelector,
        nextSelector,
        coverUrl,
        ttsEngine,
        ttsVoice,
        chapterLimit,
        audioBase,
        cwd: path.join(__dirname, '..')
    };
}

function sanitizeId(str) {
    return String(str || 'novel').trim().toLowerCase().replace(/[^a-z0-9-_]/gi, '-');
}

function stripRef(ref) {
    return ref.replace(/^refs\/heads\//, '');
}

module.exports = loadConfig;
