# Suno 歌詞產生器

AI 驅動的 Suno 歌詞創作工具，支援 Suno metatag 格式、多種音樂風格、進階生成選項。

## 功能特色

- **AI 歌詞生成** - 輸入主題，自動生成符合 Suno 格式的歌詞
- **模板編輯器** - 快速插入標籤、載入預設模板
- **標籤參考** - 完整的 Suno metatag 文檔
- **進階選項** - MAX Mode、Realism、樂器技巧、人聲唱腔等
- **雙認證模式** - 支援 Claude Max/Pro 訂閱或 API Key

## 快速開始（本地使用）

### 前置需求

- Python 3.9+
- Node.js 18+（安裝 Claude Code 用）
- Claude Max/Pro 訂閱 或 Claude API Key

### 步驟 1: 安裝 Claude Code 並登入

```bash
# 安裝 Claude Code CLI
npm install -g @anthropic-ai/claude-code

# 登入（使用你的 Max/Pro 帳號）
claude login
```

### 步驟 2: 安裝後端依賴

```bash
cd backend
pip install -r requirements.txt
```

### 步驟 3: 啟動服務

開兩個終端：

**終端 1 - 後端 API**
```bash
cd backend
python main.py
```

看到以下訊息表示成功：
```
==================================================
🎵 Suno Lyrics Generator Backend
==================================================
✅ 認證方式: OAuth
==================================================
```

**終端 2 - 前端**
```bash
python -m http.server 8080
```

### 步驟 4: 開始使用

打開瀏覽器 http://localhost:8080

1. 確認 API 模式選擇「本地後端」
2. 點擊 🔍 檢查連線狀態
3. 輸入歌曲主題，選擇風格
4. 點擊「生成歌詞」

## 使用方式

### API 模式說明

| 模式 | 認證方式 | 費用 | 適用場景 |
|------|----------|------|----------|
| **本地後端** | `claude login` OAuth | 免費（使用訂閱額度） | 有 Max/Pro 訂閱 |
| **直接 API** | API Key | 按量計費 | 無訂閱、需要分享 |

### Suno Metatag 格式

```
[Intro]
[Verse 1]
在這裡寫歌詞
(oh yeah~)

[Chorus]
副歌部分
```

- `[標籤]` - 結構標籤（Intro, Verse, Chorus 等）
- `(文字)` - Ad-libs，會被唱出但不是主歌詞
- `[Instrumental]` - 純音樂段落

## 專案結構

```
start-kit-demo/
├── index.html          # 主頁面
├── styles.css          # 樣式
├── app.js              # 前端邏輯
├── backend/
│   ├── main.py         # FastAPI 後端
│   └── requirements.txt
└── README.md
```

## 進階功能

### MAX Mode
適合原聲/民謠/古典音樂，提升音質：
- `[Is_MAX_MODE: MAX](MAX)`
- `[QUALITY: MAX](MAX)`
- `[REALISM: MAX](MAX)`

### Lyric Bleed Protection
在歌詞開頭加入 `///*****///` 防止 Style Prompt 被意外唱出。

### START_ON
跳過前奏直接從人聲開始：
- `[START_ON: "第一句歌詞"]`

## 常見問題

### Q: 後端顯示「未認證」？
```bash
# 重新登入
claude login
```

### Q: 連線失敗？
確認後端已啟動，檢查 http://localhost:8000/api/health

### Q: 想用 API Key 而非訂閱？
切換到「直接 API」模式，輸入你的 API Key（從 console.anthropic.com 取得）

## 部署

如需部署到伺服器，請參考 [部署指南](docs/deployment.md)（待建立）

## License

MIT
