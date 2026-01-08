# Suno AI 歌詞創作助手

> 專為 Suno AI 音樂生成平台設計的歌詞創作工具

## 專案概述

這是一個 Web 應用程式，提供：
- **AI 智慧生成**：使用 Claude AI 根據主題自動創作歌詞和 Style Prompt
- **模板編輯**：手動編輯歌詞並套用 Suno Metatag 格式
- **標籤參考**：完整的 Suno Metatag 參考文檔

## 技術架構

- **前端**：純 HTML/CSS/JavaScript（無框架）
- **後端**：Python FastAPI + Claude Code SDK
- **認證**：OAuth（使用 `claude login` 認證）

## Quick Start

```bash
# 啟動後端
cd backend && pip install -r requirements.txt && python main.py

# 開啟前端
open index.html
```

## 功能特色

- AI 創作模式：手動 / AI 優化 / AI 全自動
- 歌曲結構編輯器（拖放排序）
- 歌手聲線配置（音色、音域、演唱技巧）
- 樂器配器選擇
- 版本歷史管理（匯出/匯入）
- Style Prompt 建構器

## Memory System

All learnings stored in `.claude/memory/` - searchable with:
```
Grep pattern="keyword" path=".claude/memory/"
```

## Available Skills

Run `skillpkg list` to see installed skills.
