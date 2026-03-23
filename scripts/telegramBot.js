const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_BOT_TOKEN;
const repo = process.env.GITHUB_REPO || process.env.GITHUB_REPOSITORY;
const workflow = process.env.GITHUB_WORKFLOW_FILE || '.github/workflows/rss.yml';
const ref = process.env.GITHUB_REF_NAME || 'master';
const ghToken = process.env.GH_ACTION_TOKEN || process.env.GITHUB_TOKEN;
const allow = (process.env.ALLOW_USERS || '').split(',').filter(Boolean);

if (!token || !repo || !ghToken) {
    console.error('缺少 TELEGRAM_BOT_TOKEN / GITHUB_REPO / GH_ACTION_TOKEN');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (allow.length && !allow.includes(String(chatId))) {
        return bot.sendMessage(chatId, '未授权用户');
    }

    const text = msg.text?.trim();
    if (!text) return bot.sendMessage(chatId, '请发送小说名或目录页 URL');

    const hasUrl = /https?:\/\//i.test(text);
    const payload = {
        ref,
        inputs: {
            site: hasUrl ? 'generic' : 'yuetingba',
            title: text,
            start_url: hasUrl ? text : undefined,
            tts_engine: 'edge'
        }
    };

    try {
        await axios.post(
            `https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`,
            payload,
            {
                headers: {
                    Accept: 'application/vnd.github+json',
                    Authorization: `Bearer ${ghToken}`
                }
            }
        );
        bot.sendMessage(chatId, `已触发构建：${payload.inputs.title}`);
    } catch (err) {
        console.error(err.response?.data || err.message);
        bot.sendMessage(chatId, '触发失败，请检查日志');
    }
});

console.log('Telegram Bot 已启动');
