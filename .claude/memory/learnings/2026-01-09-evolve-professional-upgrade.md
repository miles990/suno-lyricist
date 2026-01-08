---
date: 2026-01-09
type: learning
confidence: high
related_skills: [frontend-design, ux-design, javascript, suno-ai]
---

# SunoLyricist 專業升級 - 基於 Suno AI Secrets 知識庫

## 演化目標

將專案從基礎歌詞產生器提升為專業級 AI 音樂創作工具，參考 Suno AI Secrets 知識庫進行系統性改進。

## 改進內容

### 1. 擴展音樂風格選項 (70+ Genres)

**位置**: `index.html:138-246`

**新增分類**:
- 流行 Pop (10 子類型): Pop, Synth Pop, Indie Pop, Dream Pop, Dance Pop, Bedroom Pop, K-Pop, J-Pop, C-Pop, Hyperpop
- 電子 Electronic (14 子類型): House, Deep House, Tech House, Progressive House, Techno, Trance, Dubstep, D&B, Future Bass, Hardstyle, Synthwave, Lo-Fi, Chillwave, Vaporwave
- 嘻哈 Hip-Hop (7 子類型): Hip Hop, Trap, Drill, Boom Bap, Cloud Rap, Phonk, G-Funk
- 搖滾 Rock (7 子類型): Rock, Hard Rock, Indie Rock, Punk Rock, Grunge, Post Rock, Alternative
- 金屬 Metal (6 子類型): Metal, Heavy Metal, Death Metal, Black Metal, Metalcore, Doom Metal
- R&B/Soul (5 子類型): R&B, Neo Soul, Soul, Funk, Disco
- 爵士 Jazz (5 子類型): Jazz, Smooth Jazz, Bebop, Jazz Fusion, Swing
- 民謠 Folk/Country (5 子類型): Folk, Indie Folk, Country, Bluegrass, Americana
- 抒情 Ballad (2 子類型): Ballad, Power Ballad
- 拉丁/世界 (6 子類型): Reggaeton, Reggae, Afrobeat, Bossa Nova, Salsa, Flamenco
- 古典 Classical (3 子類型): Classical, Orchestral, Cinematic
- 氛圍/實驗 (4 子類型): Ambient, Dark Ambient, Experimental, IDM
- 其他 (3 子類型): Blues, Gospel, Emo

### 2. 智能 BPM 建議系統

**位置**: `app.js:8-80`

**功能**:
- `GENRE_BPM_MAP`: 完整的 Genre/BPM 映射表 (70+ 條目)
- `getSuggestedBPM(genre)`: 根據風格獲取建議 BPM
- `updateBPMSuggestion(genre)`: 更新 UI 顯示建議
- `autoSetBPM()`: 一鍵自動設定 BPM

**UI 元件**:
- BPM 輸入框 + 自動設定按鈕
- 即時建議顯示（綠色標籤）
- 自動填入功能（風格選擇時）

### 3. 擴展 Style Presets (30+ 模板)

**位置**: `app.js:82-516`

**新增模板**:
- 電子擴展: 深浩室、Synthwave復古、Dubstep重擊、Trance激昂、Future Bass
- 嘻哈擴展: Drill暗黑、Phonk漂移
- R&B 擴展: Neo Soul、Funk律動
- 搖滾擴展: Punk能量、Post Rock、Grunge油漬
- 爵士擴展: 滑順爵士、Bebop搖擺
- 世界音樂: Reggaeton、Afrobeat
- 氛圍/實驗: 太空氛圍、暗黑氛圍

**每個模板包含**:
- `stylePrompt`: 專業 Suno Style Prompt（含 MIX 標籤）
- `suggestedGenre`, `suggestedMood`, `suggestedVocal`, `suggestedTempo`
- `instruments`: 建議樂器配器
- `vocalTechniques`: 建議人聲技巧

### 4. 專業 Mix 混音設定

**位置**: `index.html:355-404`

**四大類別**:
1. **整體音色**: Analog Warmth, Digital Precision, Lo-Fi Gritty, Pristine Polished, Raw Unpolished
2. **頻率平衡**: Bass-Forward, Mid-Range Focused, Bright Crisp Highs, Full-Spectrum, Low-End Heavy
3. **空間感**: Wide Stereo, Mono-Centered, Big Hall Reverb, Tight Room, No Reverb Dry
4. **動態與效果**: Heavily Compressed, Natural Dynamics, Sidechain Pumping, Tape Saturation, Vinyl Crackle

**整合方式**: 生成時自動加入 `[MIX: ...]` 標籤

## 技術實作

### 新增 CSS 樣式

**位置**: `styles.css:190-225, 1309-1337`

- BPM 輸入包裝器樣式
- BPM 自動按鈕漸變效果
- BPM 建議標籤動畫
- Mix 配置區塊樣式
- "Pro" 標籤樣式

### 事件綁定

**位置**: `app.js:1789-1805, 1943-1946`

- Genre 選擇 → 更新 BPM 建議 + 自動填入
- BPM 自動按鈕 → 一鍵設定
- Mix 標籤 → 多選切換

### Prompt 整合

**位置**: `app.js:2420-2430`

- BPM 優先使用精確值，否則用範圍
- Mix 設定轉換為 Suno 標籤格式

## 統計

| 檔案 | 新增行數 | 主要內容 |
|------|---------|----------|
| app.js | ~370 行 | BPM 系統、Style Presets 擴展、Mix 整合 |
| index.html | ~180 行 | Genre 選項、BPM UI、Mix 配置 |
| styles.css | ~70 行 | BPM、Mix 相關樣式 |
| 總計 | ~620 行 | |

## 關鍵學習

### 知識庫驅動開發

1. **結構化知識提取** - 從 PDF 提取並整理成可用的資料結構
2. **漸進式增強** - 在現有功能上擴展，保持向後兼容
3. **專業標籤格式** - 使用 Suno AI 官方建議的 `[MIX: ...]` 格式

### UX 提升模式

1. **智能預設** - 自動建議減少用戶決策負擔
2. **分類組織** - 使用 `<optgroup>` 組織大量選項
3. **即時反饋** - BPM 建議即時顯示
4. **專業標籤** - "Pro" 標籤凸顯進階功能

## 後續改進方向

- [x] Mix 預設模板（根據風格自動推薦混音設定）✅ 已完成
- [x] 風格組合保存系統 ✅ 已完成
- [ ] 風格組合智能推薦（根據已選風格推薦互補選項）
- [ ] BPM 範圍滑桿（允許設定範圍而非固定值）
- [ ] 風格歷史學習（記錄用戶常用組合）

---

## 第二階段改進 (2026-01-09)

### 1. 智能 Mix 推薦系統

**位置**: `app.js:82-163`

**功能**:
- `GENRE_MIX_PRESETS`: 35+ 音樂風格的專業混音預設配置
- `getSuggestedMix(genre)`: 根據風格獲取建議混音設定
- `applySmartMix(genre)`: 一鍵套用專業混音標籤
- 🎛️ 智能推薦按鈕

### 2. 歌曲實驗室 (Song Lab)

**位置**:
- HTML: `index.html:1034-1280`
- JS: `app.js:2236-2485`
- CSS: `styles.css:1400+`

**功能**:
- 6 大音樂元素選擇器：風格、副風格、情緒、節奏、人聲、樂器
- 每個元素獨立隨機按鈕
- 一鍵全部隨機混搭
- 即時 Style Prompt 預覽與複製
- 「套用到 AI 生成」一鍵整合
- 收藏系統（LocalStorage 持久化，最多 20 個）
- 完整響應式 UI

### 3. 專業小技巧系統 (Pro Tips)

**位置**: `app.js:2185-2234`

**功能**:
- 14 條來自 Suno AI Secrets 的專業技巧
- 自動輪播（每 8 秒）
- 手動切換下一則
- 隨機起始位置

### 統計

| 檔案 | 第二階段新增行數 |
|------|-----------------|
| app.js | ~350 行 |
| index.html | ~250 行 |
| styles.css | ~350 行 |
| 總計 | ~950 行 |

---

## 第三階段改進 (2026-01-09)

### 1. Ad-Libs 即興口白系統

**位置**: `app.js:2289-2350`, `index.html:593-627`

**功能**:
- 10 種風格的 Ad-Libs 預設庫（Pop、Hip-Hop、R&B、Rock、EDM、Gospel 等）
- 一鍵套用風格預設
- 🎲 根據選擇的 Genre 隨機生成 3-5 個即興口白
- 自訂輸入欄位
- 整合到 Style Prompt 生成（`ad-libs: (...)` 格式）

### 2. 歌詞分析功能

**位置**: `app.js:2188-2287`, `index.html:1012-1052`

**功能**:
- 📊 分析按鈕（生成歌詞後啟用）
- 基本統計：總字數、總行數、段落數
- 押韻密度估算（英文/中文通用）
- 結構標籤分析（[Verse]×n → [Chorus]×m...）
- 智能建議生成：
  - 結構標籤建議
  - 押韻加強建議
  - 長度控制建議
  - 副歌/Hook 檢測
- 可展開/關閉的分析面板

### 第三階段統計

| 檔案 | 第三階段新增行數 |
|------|-----------------|
| app.js | ~180 行 |
| index.html | ~80 行 |
| styles.css | ~240 行 |
| 總計 | ~500 行 |

---

## 第四階段改進 (2026-01-09)

### 1. 擴展樂器質感描述系統

**位置**: `index.html:761-850`

**新增分類**:
- 吉他質感 (8 選項): Warm Acoustic Strumming、Bright Fingerpicked、Mellow Nylon、Crisp Steel String 等
- 電吉他質感 (8 選項): Crunchy Rhythm、Distorted Power Chords、Fuzzy Leads、Palm-Muted Chugging 等
- 效果吉他 (6 選項): Chorus-Drenched、Reverb-Soaked、Delay-Laden Arpeggios、Phased Swells 等
- 鍵盤質感 (8 選項): Warm Rhodes Keys、Percussive Wurlitzer、Delicate Piano Melody 等
- 合成器質感 (8 選項): Warm Analog Pads、Ethereal Floating Pads、Bright Plucky Leads 等
- 銅管/木管質感 (8 選項): Bright Punchy Brass、Sultry Saxophone、Breathy Flute 等
- 弦樂質感 (8 選項): Lush String Section、Soaring Violins、Staccato String Hits 等

### 2. 擴展人聲技巧選項

**位置**: `index.html:587-642`

**新增分類**:
- 人聲音色 (8 選項): Warm Intimate Voice、Raspy Male Tenor、Breathy Ethereal Soprano 等
- 演繹風格 (8 選項): Fast Rhythmic Rap、Slow Deliberate Flow、Conversational Intimate 等
- 能量/態度 (8 選項): Confident Swagger、Vulnerable Emotional、Playful Energetic 等
- 專業技巧 (8 選項): Long Sustained Vibrato、Melismatic Runs、Falsetto Highs 等

### 3. Pro Badge 樣式

**位置**: `styles.css:1886-1899`

**功能**:
- 漸變橙紅色背景標示專業進階選項
- 與現有 label-badge 區分

### 第四階段統計

| 檔案 | 第四階段新增行數 |
|------|-----------------|
| index.html | ~146 行 |
| styles.css | ~15 行 |
| 總計 | ~161 行 |

---

## 第五階段改進 (2026-01-09)

### 1. 擴展母帶處理風格選項

**位置**: `index.html:1125-1162`

**新增分類** (15+ 選項):
- 基礎風格 (3 選項): Natural Dry、Polished Pro、Punchy Hi-Fi
- 類比溫暖 (4 選項): Tape Saturation、Vintage Console、Tube Saturation、Analog Summing
- 空間感 (3 選項): Wide Stereo、Mono Centered、3D Spatial
- 特殊效果 (4 選項): Lo-Fi Intimacy、Vinyl Crackle、Radio Ready、Streaming Optimized
- 動態處理 (4 選項): Heavily Compressed、Natural Dynamics、Brick-Wall Limiting、Parallel Compression

### 第五階段統計

| 檔案 | 第五階段新增行數 |
|------|-----------------|
| index.html | ~27 行 |
| 總計 | ~27 行 |

---

## 第六階段改進 (2026-01-09)

### 1. 智能主題分析推薦功能

**位置**: `app.js:82-266`, `index.html:89-105`, `styles.css:1339-1448`

**功能**:
- `THEME_KEYWORDS`: 13 種主題關鍵詞映射 (愛情/心碎/夏日/夜晚/雨天/派對/放鬆/嘻哈/城市/旅行/復古/黑暗/勵志)
- `analyzeTheme(theme)`: 分析主題文字並匹配關鍵詞
- `showThemeSuggestions()`: 顯示推薦標籤面板
- `applySingleSuggestion()`: 點擊單獨套用推薦
- `applyAllSuggestions()`: 一鍵套用全部推薦

**UI 元件**:
- 🔮 智能推薦按鈕（紫色漸變）
- 推薦標籤面板（滑入動畫）
- 可點擊的推薦標籤（風格/情緒/人聲/樂器）
- 「套用全部」按鈕

**支援的關鍵詞範例**:
- 愛情: 愛、戀、心、love、heart、愛情、浪漫
- 夏日: 夏天、夏日、海灘、陽光、summer、beach
- 嘻哈: 嘻哈、rap、說唱、flow、hustle
- 等 13 種主題類別

### 第六階段統計

| 檔案 | 第六階段新增行數 |
|------|-----------------|
| app.js | ~189 行 |
| index.html | ~15 行 |
| styles.css | ~111 行 |
| 總計 | ~315 行 |

---

## 第七階段改進 (2026-01-09)

### 1. 版本歷史搜尋篩選系統

**位置**: `app.js:1514-1731`, `index.html:32-50`, `styles.css:1670-1830`

**功能**:
- `filterVersionHistory()`: 篩選版本歷史（搜尋、風格、排序）
- `updateHistoryGenreFilter()`: 動態更新風格篩選選項
- `highlightMatch()`: 搜尋結果高亮顯示
- `clearHistoryFilters()`: 一鍵清除所有篩選
- `initHistorySearch()`: 初始化搜尋事件監聽

**UI 元件**:
- 🔍 即時搜尋輸入框（支援主題、歌詞、Style Prompt）
- 風格下拉篩選器（動態生成已使用的風格選項）
- 排序選擇器（最新/最舊/迭代次數）
- 結果計數標籤（顯示 n / total 筆）
- 搜尋高亮（黃色漸變背景）
- 清除篩選按鈕（無結果時顯示）

**技術特點**:
- 200ms 防抖處理優化搜尋效能
- 正則表達式安全轉義避免注入
- LocalStorage 版本數據完整保留

### 第七階段統計

| 檔案 | 第七階段新增行數 |
|------|-----------------|
| app.js | ~191 行 |
| index.html | ~20 行 |
| styles.css | ~162 行 |
| 總計 | ~373 行 |

---

## 第八階段改進 (2026-01-09)

### 1. Suno 快速複製格式化輸出

**位置**: `app.js:4051-4123`, `index.html:1212`, `styles.css:3121-3164`

**功能**:
- `copyToSunoFormat()`: 格式化複製歌詞 + Style Prompt
- 自動收集 Mix 標籤和 Mastering 標籤
- 生成 Suno 可直接使用的格式化輸出
- 包含清晰的區塊分隔符號和使用說明

**UI 元件**:
- 🎵「複製到 Suno」按鈕（橙紅漸變 + 光暈動畫）
- 複製成功 Toast 提示

**輸出格式**:
```
═══════════════════════════════════════
🎵 STYLE OF MUSIC (複製到 Suno 的 Style 欄位)
═══════════════════════════════════════

[Style Prompt 內容]

═══════════════════════════════════════
📝 LYRICS (複製到 Suno 的 Lyrics 欄位)
═══════════════════════════════════════

[歌詞內容]

💡 使用說明...
```

### 第八階段統計

| 檔案 | 第八階段新增行數 |
|------|-----------------|
| app.js | ~81 行 |
| index.html | ~2 行 |
| styles.css | ~45 行 |
| 總計 | ~128 行 |

---

## 第九階段改進 (2026-01-09)

### 1. 鍵盤快捷鍵支援系統

**位置**: `app.js:4143-4270`, `index.html:23-25`, `styles.css:1606-1632, 3273-3390`

**功能**:
- `KEYBOARD_SHORTCUTS`: 8 個常用快捷鍵定義
- `initKeyboardShortcuts()`: 初始化鍵盤監聽
- `showKeyboardShortcutsHelp()`: 顯示快捷鍵說明面板
- `closeAllPanels()`: 一鍵關閉所有彈窗

**支援的快捷鍵**:
| 快捷鍵 | 功能 |
|--------|------|
| `Alt + G` | 生成歌詞 |
| `Alt + C` | 複製歌詞 |
| `Alt + S` | 複製到 Suno |
| `Alt + H` | 開啟歷史面板 |
| `Alt + A` | 分析歌詞 |
| `Alt + R` | 隨機風格組合 |
| `/` | 顯示快捷鍵說明 |
| `Esc` | 關閉所有彈窗 |

**技術特點**:
- 輸入框聚焦時不觸發（除 Esc）
- 彈跳動畫效果（cubic-bezier）
- 響應式 kbd 樣式

### 第九階段統計

| 檔案 | 第九階段新增行數 |
|------|-----------------|
| app.js | ~136 行 |
| index.html | ~3 行 |
| styles.css | ~147 行 |
| 總計 | ~286 行 |

---

## 第十階段改進 (2026-01-09)

### 1. Style Prompt 自動生成功能

**位置**: `app.js:4049-4158`, `index.html:386-392`, `styles.css:3420-3465`

**功能**:
- `generateAutoStylePrompt()`: 一鍵生成專業 Style Prompt
- `initAutoStylePrompt()`: 初始化按鈕事件監聽
- 智能整合所有表單選項

**收集的元素**:
1. Genre (風格) - 自動格式化為 Title Case
2. Mood (情緒)
3. Tempo (節奏) - 映射為描述性詞彙 (slow tempo, upbeat, high energy)
4. BPM (精確節拍)
5. Vocal Style (人聲風格) - 加入 "vocals" 後綴
6. Vocal Techniques (人聲技巧) - 最多 3 個
7. Instruments (樂器配器) - 最多 4 個
8. Mix 標籤 - 格式化為 `[MIX: ...]`
9. Mastering 標籤 - 格式化為 `[MASTERING: ...]`
10. Ad-Libs - 格式化為 `ad-libs: (...)`

**UI 元件**:
- ✨「自動生成」按鈕（紫色漸變）
- 位於 Style Prompt 標籤旁
- 高亮閃爍動畫回饋

**CSS 樣式**:
- `.btn-auto-style`: 紫色漸變背景 + hover 縮放效果
- `.highlight-flash`: 閃爍動畫 (紫色光暈)
- `@keyframes highlightFlash`: 0.6s 漸變動畫

### 第十階段統計

| 檔案 | 第十階段新增行數 |
|------|-----------------|
| app.js | ~112 行 |
| index.html | ~5 行 |
| styles.css | ~47 行 |
| 總計 | ~164 行 |

---

## 第十一階段改進 (2026-01-09)

### 1. 深色/淺色主題切換系統

**位置**: `app.js:4387-4449`, `index.html:26-28`, `styles.css:3467-3627`

**功能**:
- `initThemeToggle()`: 初始化主題切換功能
- `updateThemeIcon()`: 更新切換按鈕圖示
- `toggleTheme()`: 執行主題切換邏輯

**特性**:
1. LocalStorage 持久化用戶主題偏好
2. 自動偵測系統主題偏好 (`prefers-color-scheme`)
3. 平滑過渡動畫 (0.3s ease)
4. 快捷鍵支援 (`Alt + T`)

**CSS 變數覆蓋** (淺色模式):
- `--bg-dark`: #f8fafc (白灰底色)
- `--bg-card`: #ffffff (純白卡片)
- `--bg-input`: #f1f5f9 (淺灰輸入框)
- `--text-primary`: #0f172a (深色文字)
- `--text-secondary`: #475569 (次要文字)
- `--border`: #e2e8f0 (淺色邊框)

**UI 元件**:
- 🌙/☀️ 切換按鈕（圓形，hover 放大效果）
- 圖示旋轉動畫 (360deg)
- Toast 通知回饋

**覆蓋的元件樣式**:
- form-section, result-section
- input, select, textarea
- tabs, style-tag, structure-tag
- history-panel, version-card
- toast, modal-content
- keyboard-shortcuts-panel, kbd

### 第十一階段統計

| 檔案 | 第十一階段新增行數 |
|------|-----------------|
| app.js | ~73 行 |
| index.html | ~3 行 |
| styles.css | ~162 行 |
| 總計 | ~238 行 |

---

## 第十二階段改進 (2026-01-09)

### 1. 即時歌詞統計條

**位置**: `app.js:4459-4531`, `index.html:1225-1246`, `styles.css:3629-3720`

**功能**:
- `updateLyricsStats(lyrics)`: 計算並更新統計數據
- `initLyricsStatsObserver()`: 初始化 MutationObserver 監聽

**統計項目**:
1. 字數 - 排除結構標籤，只計算純歌詞文字
2. 行數 - 排除空行和標籤行
3. 段落數 - 統計結構標籤數量（Verse、Chorus 等）
4. 預估時長 - 基於行數 × 4 秒 + 段落間隙計算

**技術特點**:
- MutationObserver 即時監聽 DOM 變化
- 正則表達式精確匹配結構標籤
- 排除 placeholder 文字避免誤判

**UI 設計**:
- 漸變背景（紫藍漸層）
- 圓角標籤式統計項
- 滑入動畫效果
- 響應式佈局

### 第十二階段統計

| 檔案 | 第十二階段新增行數 |
|------|-----------------|
| app.js | ~68 行 |
| index.html | ~22 行 |
| styles.css | ~93 行 |
| 總計 | ~183 行 |

---

## 第十三階段改進 (2026-01-09)

### 1. 歌詞下載 TXT 功能

**位置**: `app.js:4530-4600`, `index.html:1222`, `styles.css:3722-3757`

**功能**:
- `downloadLyricsTxt()`: 下載歌詞為格式化 TXT 檔案
- `initDownloadTxt()`: 初始化下載按鈕事件

**匯出內容**:
1. 標題欄位 (SunoLyricist 歌詞匯出)
2. 日期
3. 主題
4. Style Prompt
5. 完整歌詞內容
6. 頁尾標識

**技術特點**:
- Blob API 生成檔案
- 智能檔名：主題 + 日期
- 檔名安全處理（移除特殊字元）
- UTF-8 編碼確保中文正確

**快捷鍵**: `Alt + D`

**UI 設計**:
- 綠色漸變按鈕 (#10b981 → #059669)
- hover 上浮 + 陰影效果
- disabled 狀態樣式

### 第十三階段統計

| 檔案 | 第十三階段新增行數 |
|------|-----------------|
| app.js | ~69 行 |
| index.html | ~1 行 |
| styles.css | ~37 行 |
| 總計 | ~107 行 |

---

## 第十四階段改進 (2026-01-09)

### 1. 創作靈感系統

**位置**: `app.js:4595-4658`, `index.html:118`, `styles.css:3759-3801`

**功能**:
- `INSPIRATION_THEMES`: 48 個靈感主題（6 大類別）
- `getRandomInspiration()`: 隨機獲取靈感
- `initInspirationBtn()`: 初始化靈感按鈕

**靈感類別**:
1. 情感 (emotions): 初戀、失戀、重逢、離別等
2. 故事 (stories): 午夜漫步、咖啡廳邂逅、海邊告白等
3. 季節 (seasons): 夏日派對、秋天浪漫、聖誕期待等
4. 人生 (life): 追夢勇氣、青春遺憾、成長代價等
5. 抽象 (abstract): 時間流逝、記憶碎片、夢與現實等
6. 有趣 (fun): 夜店狂歡、公路旅行、K歌之王等

**UI 設計**:
- 🎲 橙色漸變按鈕
- 骰子旋轉動畫 (360deg)
- hover 放大效果

### 第十四階段統計

| 檔案 | 第十四階段新增行數 |
|------|-----------------|
| app.js | ~58 行 |
| index.html | ~1 行 |
| styles.css | ~44 行 |
| 總計 | ~103 行 |

---

## 第十五階段改進 (2026-01-09)

### 1. 標籤快速清除功能

**位置**: `app.js:4652-4702`, `index.html:405,511,733`, `styles.css:3803-3840`

**功能**:
- `clearTagsBySelector(selector, message)`: 通用標籤清除函數
- `initClearTagButtons()`: 初始化所有清除按鈕

**清除按鈕位置**:
1. 混音風格區域 - 清除 `.mix-tag`
2. 人聲技巧區域 - 清除 `.vocal-tech-tag`
3. 樂器配器區域 - 清除 `.instrument-tag`

**技術特點**:
- 通用化設計，一個函數處理所有類型
- Toast 顯示清除數量回饋
- 無已選標籤時提示「沒有已選的」

**UI 設計**:
- 🗑️ 小型清除按鈕
- hover 紅色高亮警示效果
- active 縮放回饋
- 淺色主題下預設淺紅色背景

### 第十五階段統計

| 檔案 | 第十五階段新增行數 |
|------|-----------------|
| app.js | ~44 行 |
| index.html | ~3 行 |
| styles.css | ~39 行 |
| 總計 | ~86 行 |

---

## 總改進統計

| 階段 | 新增功能 | 程式碼行數 |
|------|---------|-----------|
| 第一階段 | 70+ Genre/BPM、30+ Presets、Pro Mix | ~620 行 |
| 第二階段 | Song Lab、Smart Mix、Pro Tips | ~950 行 |
| 第三階段 | Ad-Libs、歌詞分析 | ~500 行 |
| 第四階段 | 樂器質感、人聲技巧擴展 | ~161 行 |
| 第五階段 | 母帶處理風格擴展 | ~27 行 |
| 第六階段 | 智能主題分析推薦 | ~315 行 |
| 第七階段 | 版本歷史搜尋篩選 | ~373 行 |
| 第八階段 | Suno 快速複製格式化 | ~128 行 |
| 第九階段 | 鍵盤快捷鍵系統 | ~286 行 |
| 第十階段 | Style Prompt 自動生成 | ~164 行 |
| 第十一階段 | 深色/淺色主題切換 | ~238 行 |
| 第十二階段 | 即時歌詞統計條 | ~183 行 |
| 第十三階段 | 歌詞下載 TXT | ~107 行 |
| 第十四階段 | 創作靈感系統 | ~103 行 |
| 第十五階段 | 標籤快速清除 | ~86 行 |
| 第十六階段 | 返回頂部按鈕 | ~113 行 |
| 第十七階段 | 表單完成度進度條 | ~196 行 |
| 第十八階段 | AI 生成載入動畫 | ~75 行 |
| 第十九階段 | 首次使用導覽系統 | ~230 行 |
| 第二十階段 | 歌詞質量評分系統 | ~350 行 |
| 第二十一階段 | 風格組合收藏夾系統 | ~212 行 |
| 第二十二階段 | 智能歌詞字數警告 | ~48 行 |
| **總計** | **29+ 核心功能** | **~5,465 行** |

---

## 第二十一階段改進 (2026-01-09)

### 1. 風格組合收藏夾系統

**位置**: `app.js:5144-5356`, `index.html:409-424`, `styles.css:4322-4476`

**功能**:
- `STYLE_COMBO_STORAGE_KEY`: LocalStorage 鍵名
- `MAX_COMBOS`: 最多保存 10 個組合
- `getStyleCombos()`: 獲取已保存的組合列表
- `saveStyleCombos()`: 保存組合到 LocalStorage
- `getCurrentStyleSettings()`: 收集當前所有風格設定
- `applyStyleCombo()`: 套用保存的組合
- `saveCurrentStyleCombo()`: 保存當前配置為新組合
- `deleteStyleCombo()`: 刪除指定組合
- `loadStyleCombo()`: 載入組合並套用
- `renderStyleCombos()`: 渲染組合列表 UI
- `initStyleCombo()`: 初始化事件監聽

**收集的設定項目**:
1. Genre (音樂風格)
2. Mood (情緒)
3. Vocal Style (人聲風格)
4. Tempo (節奏)
5. BPM (節拍)
6. Style Prompt (風格提示)
7. Mix Tags (混音標籤)
8. Vocal Techniques (人聲技巧)
9. Instruments (樂器配器)

**UI 設計**:
- 💾「保存組合」按鈕
- 📂「我的組合」按鈕
- 滑入式組合面板
- 組合項目卡片（顯示風格 + 情緒標籤）
- 載入/刪除操作按鈕
- 空狀態提示

**技術特點**:
- LocalStorage 持久化存儲
- 最多保存 10 個組合（FIFO）
- prompt() 收集組合名稱
- confirm() 確認刪除操作
- Toast 操作回饋

### 第二十一階段統計

| 檔案 | 第二十一階段新增行數 |
|------|-----------------|
| app.js | ~135 行 |
| index.html | ~20 行 |
| styles.css | ~155 行 |
| 總計 | ~212 行 |

---

## 第二十二階段改進 (2026-01-09)

### 1. 智能歌詞字數警告系統

**位置**: `app.js:4529-4547`, `index.html:1300`, `styles.css:4478-4506`

**功能**:
- 整合到 `updateLyricsStats()` 函數
- 基於 Suno AI 建議上限 (3000 字) 進行分級警告
- 即時更新警告狀態

**警告等級**:
| 字數範圍 | 等級 | 提示訊息 | 顏色 |
|---------|------|---------|------|
| < 100 | info | 💡 歌詞較短，可考慮擴充 | 藍色 |
| 200-800 | success | ✅ 長度適中，適合 Suno 生成 | 綠色 |
| 2500-3000 | warning | ⚡ 接近 Suno 上限，建議精簡 | 黃色 |
| > 3000 | danger | ⚠️ 超過 Suno 建議上限 (3000字) | 紅色 |

**UI 設計**:
- 小型標籤式警告 (0.75rem)
- 圓角膠囊形狀
- 狀態顏色區分（info 藍、success 綠、warning 黃、danger 紅）
- danger 狀態 pulse 動畫效果

**技術特點**:
- 純 CSS 狀態管理（className 切換）
- 實時計算字數（排除結構標籤）
- MutationObserver 自動觸發更新

### 第二十二階段統計

| 檔案 | 第二十二階段新增行數 |
|------|-----------------|
| app.js | ~18 行 |
| index.html | ~1 行 |
| styles.css | ~29 行 |
| 總計 | ~48 行 |

---

## 第十六階段改進 (2026-01-09)

### 1. 返回頂部按鈕

**位置**: `app.js:4695-4724`, `index.html:10-13`, `styles.css:3842-3926`

**功能**:
- `initScrollToTop()`: 初始化滾動監聽和按鈕事件
- 滾動超過 300px 自動顯示按鈕
- 點擊平滑滾動至頂部

**技術特點**:
1. `requestAnimationFrame` 優化滾動性能（避免滾動卡頓）
2. `ticking` 標誌防止重複計算
3. `smooth` 行為實現平滑滾動動畫
4. CSS `visibility` + `opacity` 組合確保動畫平滑

**UI 設計**:
- 固定定位圓形按鈕（右下角）
- 漸變紫色背景 (primary → secondary)
- 上下彈跳動畫 (`bounceUp`) 吸引注意
- hover 上浮 + 增強陰影效果
- 響應式尺寸適配（桌面 50px / 平板 45px / 手機 40px）

**CSS 動畫**:
```css
@keyframes bounceUp {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
}
```

### 第十六階段統計

| 檔案 | 第十六階段新增行數 |
|------|-----------------|
| app.js | ~30 行 |
| index.html | ~4 行 |
| styles.css | ~86 行 |
| 總計 | ~113 行 |

---

## 第十七階段改進 (2026-01-09)

### 1. 表單完成度進度條

**位置**: `app.js:4726-4839`, `index.html:85-95`, `styles.css:3928-4017`

**功能**:
- `FORM_PROGRESS_ITEMS`: 8 個權重項目定義
- `PROGRESS_HINTS`: 6 段鼓勵提示配置
- `calculateFormProgress()`: 計算當前填寫百分比
- `updateFormProgress()`: 更新 UI 顯示
- `initFormProgress()`: 初始化事件監聽

**權重配置**:
| 項目 | 權重 |
|------|------|
| 歌曲主題 | 25% |
| 音樂風格 | 15% |
| Style Prompt | 15% |
| 情緒 | 10% |
| 人聲風格 | 10% |
| Mix 設定 | 10% |
| 人聲技巧 | 8% |
| 樂器配器 | 7% |

**提示文字**:
| 進度範圍 | 提示 |
|---------|------|
| 0-10% | 填寫主題開始創作 |
| 10-30% | 選擇音樂風格會更好 |
| 30-50% | 不錯！繼續完善設定 |
| 50-70% | 很好！可以開始生成了 |
| 70-90% | 專業設定！成果會更精準 |
| 90-100% | 完美配置！準備創作傑作 |

**UI 設計**:
- 漸變進度條 (primary → secondary → green)
- shimmer 光暈動畫效果
- 完成時綠色特殊樣式
- 圓角卡片容器

**事件監聽**:
- 輸入框 input/change 事件
- 標籤點擊（延遲 50ms 等待 class 變化）
- 清除按鈕點擊

### 第十七階段統計

| 檔案 | 第十七階段新增行數 |
|------|-----------------|
| app.js | ~105 行 |
| index.html | ~12 行 |
| styles.css | ~91 行 |
| 總計 | ~196 行 |

---

## 第十八階段改進 (2026-01-09)

### 1. AI 生成載入階段動畫

**位置**: `app.js:4830-4868, 3986-4006`, `index.html:1230-1233`, `styles.css:1537-1563`

**功能**:
- `LOADING_STAGES`: 8 個創作階段提示
- `startLoadingStageAnimation()`: 啟動動畫循環
- `stopLoadingStageAnimation()`: 停止動畫
- 整合到 `setGeneratingState()` 函數

**載入階段提示**:
1. 準備中...
2. 分析主題...
3. 構思結構...
4. 撰寫主歌...
5. 創作副歌...
6. 編寫橋段...
7. 潤飾歌詞...
8. 最終調整...

**技術特點**:
- `setInterval` 每 1.5 秒切換階段
- `spin` 動畫旋轉 spinner
- `fadeInOut` 動畫讓文字過渡自然
- `window` 掛載函數供跨作用域調用

**UI 設計**:
- 白色旋轉圓圈 spinner (16px)
- 動態文字配合 fade 動畫
- inline-flex 對齊 spinner 和文字

### 第十八階段統計

| 檔案 | 第十八階段新增行數 |
|------|-----------------|
| app.js | ~48 行 |
| index.html | ~4 行 |
| styles.css | ~28 行 |
| 總計 | ~75 行 |

---

## 第十九階段改進 (2026-01-09)

### 1. 首次使用導覽系統 (Onboarding Tour)

**位置**: `app.js:4878-4998`, `index.html:15-28`, `styles.css:4043-4161`

**功能**:
- `ONBOARDING_STEPS`: 5 步驟導覽配置
- `showOnboarding()`: 首次訪問時顯示導覽
- `updateOnboardingStep()`: 更新當前步驟內容
- `nextOnboardingStep()`: 前進到下一步
- `closeOnboarding()`: 關閉並記錄已看過
- `initOnboarding()`: 初始化事件綁定

**導覽步驟**:
1. 歡迎頁面 - 介紹 SunoLyricist
2. 歌曲主題 - 輸入創作主題 + 靈感功能
3. 音樂風格 - 風格選擇 + 智能推薦
4. 生成歌詞 - 生成按鈕說明
5. 開始創作 - 快捷鍵和主題切換提示

**技術特點**:
- LocalStorage 記錄已看過狀態
- 目標元素高亮（紫色光暈 box-shadow）
- 自動滾動到目標元素 (`scrollIntoView`)
- 延遲 500ms 顯示（等待頁面載入）

**UI 設計**:
- 暗色遮罩 (70% 透明度)
- 漸層步驟標籤
- slideUp 動畫進場
- 圓角卡片 (16px)
- 跳過/下一步按鈕

### 第十九階段統計

| 檔案 | 第十九階段新增行數 |
|------|-----------------|
| app.js | ~110 行 |
| index.html | ~14 行 |
| styles.css | ~120 行 |
| 總計 | ~230 行 |

---

## 第二十階段改進 (2026-01-09)

### 1. 歌詞質量評分系統

**位置**: `app.js:4988-5151`, `index.html:1256,1331-1379`, `styles.css:4163-4320`

**功能**:
- `QUALITY_GRADES`: 5 級等級配置 (S/A/B/C/D)
- `QUALITY_SUGGESTIONS`: 各維度改進建議庫
- `calculateQualityScore()`: 計算四維度評分
- `getScoreLevel()`: 獲取分數等級
- `showQualityScore()`: 顯示評分面板
- `initQualityScore()`: 初始化事件綁定

**評分維度** (各 0-25 分，總分 100):
| 維度 | 評估標準 |
|------|---------|
| 結構完整性 | 段落數量、Verse/Chorus 存在 |
| 押韻豐富度 | 行尾重複比例 |
| 歌詞長度 | 字數階梯評分 (50-800 字) |
| 情感表達 | 情感詞彙出現數量 |

**等級標準**:
| 分數 | 等級 | 描述 |
|------|------|------|
| 90+ | S 級 | 大師級作品 |
| 80-89 | A 級 | 優秀作品 |
| 70-79 | B 級 | 良好作品 |
| 60-69 | C 級 | 合格作品 |
| <60 | D 級 | 需要改進 |

**情感詞彙庫**:
愛、心、淚、夢、思念、感、痛、喜、悲、望、念、憶、情、戀、想、怕、恨、歡、樂、哭、笑（共 21 個）

**UI 設計**:
- 漸變紫色圓形總分展示
- 動態進度條 (漸變色：紅→黃→綠)
- 等級顏色標識（綠/藍/黃/紅）
- 智能建議卡片

### 第二十階段統計

| 檔案 | 第二十階段新增行數 |
|------|-----------------|
| app.js | ~165 行 |
| index.html | ~50 行 |
| styles.css | ~160 行 |
| 總計 | ~350 行 |
