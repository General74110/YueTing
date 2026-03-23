# Yuetingba Podcast RSS 🎧

> 将「悦听吧（yuetingba.cn）」的有声小说  
> **自动抓取并生成可订阅的播客 RSS**  
> 支持 **连载 / 完本自动判断 + GitHub Actions 定时更新**

---

## ✨ 功能特性

- ✅ **1 本小说 = 1 个播客 RSS**
- ✅ 自动抓取悦听吧播放页直链 MP3（默认）
- ✅ 新增：通用站点模式（传入目录页 + CSS 选择器，抓正文 → 多 TTS 合成音频）
- ✅ 新增：自动封面 (PNG) + RSS `itunes:image`，Apple Podcasts 可直接订阅
- ✅ 新增：Telegram Bot 触发 GitHub Actions，输入小说名/URL 即可生成
- ✅ 首次全量生成，后续仅追加新章节（增量）
- ✅ 支持定时（schedule）和手动 workflow_dispatch

---

## 📂 项目结构

```text
.
├── config/
│   └── novel.js              # 小说配置（只改这里即可换书）
├── novels/
│   └── yuetingba_xian_ni/
│       ├── meta.json         # 抓取状态（增量核心）
│       └── feed.xml          # 生成的播客 RSS
├── scripts/
│   ├── fetchAudio.js         # 从播放页抓取 mp3
│   ├── fetchChapter.js       # 顺序抓取 + 完本判断
│   └── generateRSS.js        # 生成 RSS
├── index.js                  # 主入口
├── package.json
└── .github/workflows/
    └── rss.yml               # GitHub Actions 定时任务
