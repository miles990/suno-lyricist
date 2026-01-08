---
date: 2026-01-08
tags: [suno, lyrics, ai-generation, claude-api, frontend]
task: 建立 Suno 歌詞產生器網站
status: resolved
---

# Suno 歌詞產生器開發經驗

## 情境
用戶需要一個可以生成符合 Suno AI 格式歌詞的網站，包含 AI 生成和模板編輯功能。

## Suno Metatag 格式重點

### 結構標籤（方括號）
- `[Intro]`, `[Verse]`, `[Chorus]`, `[Bridge]`, `[Outro]` 等
- 可加描述詞如 `[Catchy Chorus]`, `[Emotional Verse]`
- 標籤保持簡短，1-3 個字效果最好

### Ad-libs（小括號）
- `(oh yeah)`, `(hmm~)`, `(啦啦啦)` 等即興語句
- 會被唱出但不是主歌詞

### 效果標籤
- `[Instrumental]`, `[Fade Out]`, `[Build Up]`, `[Drop]` 等

## 技術實作

### Claude API 整合（純前端）
```javascript
const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'  // 必須加這個
    },
    body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
    })
});
```

### 關鍵：`anthropic-dangerous-direct-browser-access`
純前端直接呼叫 Claude API 必須加上這個 header，否則會被 CORS 阻擋。

## 專案結構
```
├── index.html    # 主頁面，三個 tab（AI 生成、模板編輯、標籤參考）
├── styles.css    # 深色主題樣式
└── app.js        # 功能邏輯
```

## 功能清單
1. AI 生成：輸入主題/風格/情緒，Claude 生成歌詞
2. 模板編輯：快速插入標籤、預設模板
3. 標籤參考：完整的 Suno metatag 文檔

## 相關資源
- [Suno Wiki Metatags](https://sunoaiwiki.com/resources/2024-05-13-list-of-metatags/)
- [Meta Tags Guide](https://jackrighteous.com/en-us/pages/suno-ai-meta-tags-guide)
