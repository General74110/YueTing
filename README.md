# Yuetingba Podcast RSS 🎧

> 将「悦听吧（yuetingba.cn）」的有声小说  
> **自动抓取并生成可订阅的播客 RSS**  
> 支持 **连载 / 完本自动判断 + GitHub Actions 定时更新**

---

## ✨ 功能特性

- ✅ **1 本小说 = 1 个播客 RSS**
- ✅ 自动抓取播放页中的 **直链 MP3**
- ✅ 首次运行全量生成
- ✅ 后续运行 **仅追加新章节（增量）**
- ✅ 连载 / 完本自动识别
- ✅ 无需登录、无需破解、无需浏览器
- ✅ 适用于 **Apple Podcast / Pocket Casts / 小宇宙**
- ✅ GitHub Actions 定时自动更新

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