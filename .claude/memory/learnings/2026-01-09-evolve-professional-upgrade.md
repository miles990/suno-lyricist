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

- [ ] 風格組合智能推薦（根據已選風格推薦互補選項）
- [ ] Mix 預設模板（根據風格自動推薦混音設定）
- [ ] BPM 範圍滑桿（允許設定範圍而非固定值）
- [ ] 風格歷史學習（記錄用戶常用組合）
