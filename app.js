// ===== Suno 歌詞產生器 =====

// 歌詞模板
const TEMPLATES = {
    'pop-ballad': `[Intro]
[Instrumental]

[Verse 1]
在這裡寫第一段主歌
描述故事的開始
設定場景和情緒

[Pre-Chorus]
導歌部分
為副歌做鋪墊

[Chorus]
這是副歌
最有記憶點的部分
(oh~)

[Verse 2]
第二段主歌
故事的發展
情緒的深化

[Pre-Chorus]
導歌部分
再次為副歌做鋪墊

[Chorus]
這是副歌
最有記憶點的部分
(oh~)

[Bridge]
橋段
情緒的轉折
新的視角或感悟

[Chorus]
最後一次副歌
可以稍作變化
(yeah~)

[Outro]
[Fade Out]`,

    'rock': `[Intro]
[Guitar Riff]

[Verse 1]
搖滾主歌第一段
強烈的情感表達
有力的歌詞

[Chorus]
爆發的副歌
(hey!)
能量滿滿

[Verse 2]
搖滾主歌第二段
故事推進
情緒累積

[Chorus]
爆發的副歌
(hey!)
能量滿滿

[Guitar Solo]
[Instrumental]

[Bridge]
安靜的橋段
情緒的對比

[Chorus]
最後的爆發
(come on!)
全力以赴

[Outro]
[Big Finish]`,

    'hip-hop': `[Intro]
[Beat Drop]

[Verse 1]
第一段 verse
展現 flow
押韻要到位
(yeah)

[Hook]
Hook 要洗腦
重複記憶點
(uh huh)

[Verse 2]
第二段 verse
故事繼續
技巧展現
(let's go)

[Hook]
Hook 要洗腦
重複記憶點
(uh huh)

[Bridge]
[Rap]
快速的 bridge
展現實力

[Hook]
最後的 Hook
(one more time)

[Outro]
[Fade Out]`,

    'electronic': `[Intro]
[Synth]
[Build Up]

[Drop]
[Bass Drop]
電子節拍
(let's go)

[Break]
[Instrumental]

[Build Up]
能量累積
準備釋放

[Drop]
[Bass Drop]
高潮來臨
(drop it)

[Break]
短暫休息

[Build Up]
最後的堆疊

[Drop]
[Big Finish]
全場爆發

[Outro]
[Fade Out]`,

    'simple': `[Verse 1]
簡單的主歌
說出你的故事

[Chorus]
副歌部分
最重要的訊息
(hmm~)

[Verse 2]
第二段主歌
故事的延續

[Chorus]
副歌部分
再次強調
(oh~)

[Outro]
簡單的結尾
[End]`
};

// DOM 元素
const elements = {
    // Tabs
    tabs: document.querySelectorAll('.tab'),
    tabContents: document.querySelectorAll('.tab-content'),

    // API Mode
    apiModeBackend: document.getElementById('api-mode-backend'),
    apiModeDirect: document.getElementById('api-mode-direct'),
    backendConfig: document.getElementById('backend-config'),
    directApiConfig: document.getElementById('direct-api-config'),
    backendUrl: document.getElementById('backend-url'),
    checkBackend: document.getElementById('check-backend'),
    backendStatus: document.getElementById('backend-status'),

    // AI Creative Mode
    aiModeManual: document.getElementById('ai-mode-manual'),
    aiModeOptimize: document.getElementById('ai-mode-optimize'),
    aiModeAuto: document.getElementById('ai-mode-auto'),
    manualSettings: document.getElementById('manual-settings'),

    // AI Generate
    apiKey: document.getElementById('api-key'),
    toggleApiKey: document.getElementById('toggle-api-key'),
    songTheme: document.getElementById('song-theme'),
    songGenre: document.getElementById('song-genre'),
    songMood: document.getElementById('song-mood'),
    songLanguage: document.getElementById('song-language'),
    structureCheckboxes: document.querySelectorAll('input[name="structure"]'),
    extraInstructions: document.getElementById('extra-instructions'),
    generateBtn: document.getElementById('generate-btn'),
    outputArea: document.getElementById('output-area'),
    copyBtn: document.getElementById('copy-btn'),
    editBtn: document.getElementById('edit-btn'),

    // Style of Music
    stylePrompt: document.getElementById('style-prompt'),
    vocalStyle: document.getElementById('vocal-style'),
    tempo: document.getElementById('tempo'),
    styleTags: document.querySelectorAll('.style-tag'),

    // Advanced Options
    toggleAdvanced: document.getElementById('toggle-advanced'),
    advancedOptions: document.getElementById('advanced-options'),
    weirdnessSlider: document.getElementById('weirdness-slider'),
    weirdnessValue: document.getElementById('weirdness-value'),
    styleInfluenceSlider: document.getElementById('style-influence-slider'),
    styleInfluenceValue: document.getElementById('style-influence-value'),
    instrumentalOnly: document.getElementById('instrumental-only'),
    negativePrompt: document.getElementById('negative-prompt'),

    // MAX Mode
    maxModeEnabled: document.getElementById('max-mode-enabled'),
    maxModeOptions: document.getElementById('max-mode-options'),
    maxParams: document.querySelectorAll('input[name="max-params"]'),

    // Start Control
    skipIntro: document.getElementById('skip-intro'),
    lyricBleedProtection: document.getElementById('lyric-bleed-protection'),

    // Realism
    realismTags: document.querySelectorAll('.realism-tag'),
    masteringStyle: document.getElementById('mastering-style'),

    // Template Editor
    lyricsEditor: document.getElementById('lyrics-editor'),
    tagButtons: document.querySelectorAll('.tag-btn'),
    loadTemplate: document.getElementById('load-template'),
    clearEditor: document.getElementById('clear-editor'),
    copyEditor: document.getElementById('copy-editor'),
    charCount: document.getElementById('char-count'),
    lineCount: document.getElementById('line-count'),

    // Modal
    templateModal: document.getElementById('template-modal'),
    templateCards: document.querySelectorAll('.template-card'),
    modalClose: document.querySelector('.modal-close')
};

// ===== 初始化 =====
function init() {
    // 從 localStorage 載入設定
    const savedApiKey = localStorage.getItem('claude-api-key');
    if (savedApiKey) {
        elements.apiKey.value = savedApiKey;
    }

    const savedBackendUrl = localStorage.getItem('backend-url');
    if (savedBackendUrl) {
        elements.backendUrl.value = savedBackendUrl;
    }

    const savedApiMode = localStorage.getItem('api-mode') || 'backend';
    if (savedApiMode === 'direct') {
        elements.apiModeDirect.checked = true;
        elements.backendConfig.classList.add('hidden');
        elements.directApiConfig.classList.remove('hidden');
    }

    // 載入 AI 創作模式
    const savedAiMode = localStorage.getItem('ai-mode') || 'manual';
    if (savedAiMode === 'optimize') {
        elements.aiModeOptimize.checked = true;
    } else if (savedAiMode === 'auto') {
        elements.aiModeAuto.checked = true;
        elements.manualSettings.classList.add('hidden');
    }

    // 綁定事件
    bindEvents();

    // 更新編輯器計數
    updateEditorCounts();

    // 檢查後端狀態
    if (savedApiMode === 'backend') {
        checkBackendStatus();
    }
}

// ===== 事件綁定 =====
function bindEvents() {
    // Tab 切換
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // API Mode 切換
    elements.apiModeBackend.addEventListener('change', () => {
        toggleApiMode('backend');
    });
    elements.apiModeDirect.addEventListener('change', () => {
        toggleApiMode('direct');
    });

    // 後端 URL 儲存
    elements.backendUrl.addEventListener('change', () => {
        localStorage.setItem('backend-url', elements.backendUrl.value);
    });

    // 檢查後端連線
    elements.checkBackend.addEventListener('click', checkBackendStatus);

    // AI 創作模式切換
    elements.aiModeManual.addEventListener('change', () => toggleAiMode('manual'));
    elements.aiModeOptimize.addEventListener('change', () => toggleAiMode('optimize'));
    elements.aiModeAuto.addEventListener('change', () => toggleAiMode('auto'));

    // API Key 顯示/隱藏
    elements.toggleApiKey.addEventListener('click', toggleApiKeyVisibility);

    // API Key 儲存
    elements.apiKey.addEventListener('change', () => {
        localStorage.setItem('claude-api-key', elements.apiKey.value);
    });

    // 生成按鈕
    elements.generateBtn.addEventListener('click', generateLyrics);

    // 複製按鈕
    elements.copyBtn.addEventListener('click', () => copyToClipboard(elements.outputArea.textContent));

    // 編輯按鈕
    elements.editBtn.addEventListener('click', editGeneratedLyrics);

    // 標籤按鈕
    elements.tagButtons.forEach(btn => {
        btn.addEventListener('click', () => insertTag(btn.dataset.tag));
    });

    // 風格標籤按鈕（可多選）
    elements.styleTags.forEach(btn => {
        btn.addEventListener('click', () => toggleStyleTag(btn));
    });

    // Advanced Options 展開/收合
    elements.toggleAdvanced.addEventListener('click', toggleAdvancedOptions);

    // 滑桿數值更新
    elements.weirdnessSlider.addEventListener('input', () => {
        elements.weirdnessValue.textContent = `${elements.weirdnessSlider.value}%`;
    });
    elements.styleInfluenceSlider.addEventListener('input', () => {
        elements.styleInfluenceValue.textContent = `${elements.styleInfluenceSlider.value}%`;
    });

    // MAX Mode 切換
    elements.maxModeEnabled.addEventListener('change', () => {
        toggleMaxModeOptions();
    });

    // Realism 標籤（可多選）
    elements.realismTags.forEach(btn => {
        btn.addEventListener('click', () => toggleRealismTag(btn));
    });

    // 編輯器工具列
    elements.loadTemplate.addEventListener('click', () => showModal());
    elements.clearEditor.addEventListener('click', () => {
        elements.lyricsEditor.value = '';
        updateEditorCounts();
    });
    elements.copyEditor.addEventListener('click', () => copyToClipboard(elements.lyricsEditor.value));

    // 編輯器計數更新
    elements.lyricsEditor.addEventListener('input', updateEditorCounts);

    // 模板選擇
    elements.templateCards.forEach(card => {
        card.addEventListener('click', () => loadTemplate(card.dataset.template));
    });

    // Modal 關閉
    elements.modalClose.addEventListener('click', hideModal);
    elements.templateModal.addEventListener('click', (e) => {
        if (e.target === elements.templateModal) hideModal();
    });
}

// ===== 風格標籤切換 =====
function toggleStyleTag(btn) {
    btn.classList.toggle('active');
}

// ===== Realism 標籤切換 =====
function toggleRealismTag(btn) {
    btn.classList.toggle('active');
}

// ===== MAX Mode 選項顯示/隱藏 =====
function toggleMaxModeOptions() {
    if (elements.maxModeEnabled.checked) {
        elements.maxModeOptions.classList.remove('hidden');
    } else {
        elements.maxModeOptions.classList.add('hidden');
    }
}

// ===== Advanced Options 展開/收合 =====
function toggleAdvancedOptions() {
    const isCollapsed = elements.advancedOptions.classList.contains('collapsed');
    elements.advancedOptions.classList.toggle('collapsed');
    elements.toggleAdvanced.textContent = isCollapsed ? '收合' : '展開';
}

// ===== Tab 切換 =====
function switchTab(tabId) {
    elements.tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
}

// ===== API Mode 切換 =====
function toggleApiMode(mode) {
    localStorage.setItem('api-mode', mode);
    if (mode === 'backend') {
        elements.backendConfig.classList.remove('hidden');
        elements.directApiConfig.classList.add('hidden');
        checkBackendStatus();
    } else {
        elements.backendConfig.classList.add('hidden');
        elements.directApiConfig.classList.remove('hidden');
    }
}

// ===== AI 創作模式切換 =====
function toggleAiMode(mode) {
    localStorage.setItem('ai-mode', mode);
    if (mode === 'auto') {
        // AI 全自動：隱藏所有設定
        elements.manualSettings.classList.add('hidden');
    } else {
        // 手動或 AI 優化：顯示設定
        elements.manualSettings.classList.remove('hidden');
    }
}

// ===== 獲取當前 AI 模式 =====
function getAiMode() {
    if (elements.aiModeAuto.checked) return 'auto';
    if (elements.aiModeOptimize.checked) return 'optimize';
    return 'manual';
}

// ===== 檢查後端狀態 =====
async function checkBackendStatus() {
    const url = elements.backendUrl.value.trim();
    elements.backendStatus.textContent = '檢查中...';
    elements.backendStatus.className = '';

    try {
        const response = await fetch(`${url}/api/health`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.auth?.auth_available) {
                elements.backendStatus.textContent = `已連線 (${data.auth.auth_method})`;
                elements.backendStatus.className = 'connected';
            } else {
                elements.backendStatus.textContent = '已連線，但未認證。請執行 claude login';
                elements.backendStatus.className = 'error';
            }
        } else {
            elements.backendStatus.textContent = '連線失敗，請確認後端已啟動';
            elements.backendStatus.className = 'error';
        }
    } catch (error) {
        elements.backendStatus.textContent = '無法連線，請啟動後端: cd backend && python main.py';
        elements.backendStatus.className = 'error';
    }
}

// ===== API Key 顯示/隱藏 =====
function toggleApiKeyVisibility() {
    const input = elements.apiKey;
    input.type = input.type === 'password' ? 'text' : 'password';
}

// ===== 生成歌詞 =====
async function generateLyrics() {
    const isBackendMode = elements.apiModeBackend.checked;
    const apiKey = elements.apiKey.value.trim();

    // 驗證認證
    if (!isBackendMode && !apiKey) {
        showToast('請輸入 Claude API Key', 'error');
        return;
    }

    const theme = elements.songTheme.value.trim();
    if (!theme) {
        showToast('請輸入歌曲主題', 'error');
        return;
    }

    // 收集基本選項
    const genre = elements.songGenre.value;
    const mood = elements.songMood.value;
    const language = elements.songLanguage.value;
    const structures = Array.from(elements.structureCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    const extraInstructions = elements.extraInstructions.value.trim();

    // 收集風格選項
    const selectedStyles = Array.from(elements.styleTags)
        .filter(btn => btn.classList.contains('active'))
        .map(btn => btn.dataset.style);

    // 收集 Realism 標籤
    const selectedRealismTags = Array.from(elements.realismTags)
        .filter(btn => btn.classList.contains('active'))
        .map(btn => btn.dataset.style);

    // 收集 MAX Mode 參數
    const maxParams = Array.from(elements.maxParams)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    const styleOptions = {
        stylePrompt: elements.stylePrompt.value.trim(),
        vocalStyle: elements.vocalStyle.value,
        tempo: elements.tempo.value,
        selectedStyles: selectedStyles,
        weirdness: parseInt(elements.weirdnessSlider.value, 10),
        styleInfluence: parseInt(elements.styleInfluenceSlider.value, 10),
        instrumentalOnly: elements.instrumentalOnly.checked,
        negativePrompt: elements.negativePrompt.value.trim(),
        // 新增選項
        maxModeEnabled: elements.maxModeEnabled.checked,
        maxParams: maxParams,
        skipIntro: elements.skipIntro.checked,
        lyricBleedProtection: elements.lyricBleedProtection.checked,
        realismTags: selectedRealismTags,
        masteringStyle: elements.masteringStyle.value
    };

    // 獲取 AI 模式
    const aiMode = getAiMode();

    // 構建 prompt
    const prompt = buildPrompt(theme, genre, mood, language, structures, extraInstructions, styleOptions, aiMode);

    // 更新 UI
    setGeneratingState(true);

    try {
        let lyrics;
        if (isBackendMode) {
            lyrics = await callBackendAPI(prompt);
        } else {
            lyrics = await callClaudeAPI(apiKey, prompt);
        }
        displayLyrics(lyrics);
        showToast('歌詞生成成功！', 'success');
    } catch (error) {
        console.error('生成失敗:', error);
        showToast(`生成失敗: ${error.message}`, 'error');
    } finally {
        setGeneratingState(false);
    }
}

// ===== 構建 Prompt =====
function buildPrompt(theme, genre, mood, language, structures, extraInstructions, styleOptions, aiMode = 'manual') {
    const languageMap = {
        'zh-TW': '繁體中文',
        'zh-CN': '簡體中文',
        'en': 'English',
        'ja': '日本語',
        'ko': '한국어',
        'es': 'Spanish',
        'mixed-en-zh': '中英混合（主要中文，穿插英文）',
        'mixed-en-ja': '日英混合（主要日文，穿插英文）',
        'mixed-en-ko': '韓英混合（主要韓文，穿插英文）'
    };

    const genreMap = {
        'pop': 'pop',
        'rock': 'rock',
        'hip-hop': 'hip hop',
        'r&b': 'r&b',
        'electronic': 'electronic',
        'jazz': 'jazz',
        'country': 'country',
        'folk': 'folk',
        'classical': 'classical',
        'k-pop': 'k-pop',
        'j-pop': 'j-pop',
        'c-pop': 'mandopop',
        'ballad': 'ballad',
        'lo-fi': 'lo-fi',
        'metal': 'metal'
    };

    const moodMap = {
        'happy': 'happy',
        'sad': 'sad',
        'energetic': 'energetic',
        'romantic': 'romantic',
        'melancholic': 'melancholic',
        'peaceful': 'peaceful',
        'angry': 'angry',
        'nostalgic': 'nostalgic',
        'hopeful': 'hopeful',
        'dreamy': 'dreamy'
    };

    const vocalMap = {
        'male': 'male vocals',
        'female': 'female vocals',
        'duet': 'duet',
        'choir': 'choir',
        'rap': 'rap vocals',
        'whisper': 'whisper vocals',
        'powerful': 'powerful vocals',
        'soft': 'soft vocals'
    };

    const tempoMap = {
        'slow': '70 BPM',
        'medium': '100 BPM',
        'fast': '130 BPM',
        'very-fast': '150 BPM'
    };

    // 構建 Suno 風格的 Style Prompt（使用 colon+quotes 格式）
    let stylePromptParts = [];

    // 基本風格
    if (genre) {
        stylePromptParts.push(`genre: "${genreMap[genre]}"`);
    }

    // 情緒
    if (mood) {
        stylePromptParts.push(`mood: "${moodMap[mood]}"`);
    }

    // 人聲風格
    if (styleOptions.vocalStyle) {
        stylePromptParts.push(`vocals: "${vocalMap[styleOptions.vocalStyle]}"`);
    }

    // 速度
    if (styleOptions.tempo) {
        stylePromptParts.push(`tempo: "${tempoMap[styleOptions.tempo]}"`);
    }

    // 自訂風格描述
    if (styleOptions.stylePrompt) {
        stylePromptParts.push(`style: "${styleOptions.stylePrompt}"`);
    }

    // 樂器/風格元素
    if (styleOptions.selectedStyles.length > 0) {
        stylePromptParts.push(`instruments: "${styleOptions.selectedStyles.join(', ')}"`);
    }

    // Realism 描述詞（用於原聲/民謠/古典音樂）
    if (styleOptions.realismTags.length > 0) {
        stylePromptParts.push(`production: "${styleOptions.realismTags.join(', ')}"`);
    }

    // 母帶處理風格
    if (styleOptions.masteringStyle) {
        stylePromptParts.push(`mastering: "${styleOptions.masteringStyle}"`);
    }

    // 純音樂模式
    if (styleOptions.instrumentalOnly) {
        stylePromptParts.push(`type: "instrumental"`);
    }

    // 排除風格
    if (styleOptions.negativePrompt) {
        stylePromptParts.push(`exclude: "${styleOptions.negativePrompt}"`);
    }

    const stylePromptStr = stylePromptParts.join(', ');

    // 構建 MAX Mode 標籤
    let maxModeStr = '';
    if (styleOptions.maxModeEnabled && styleOptions.maxParams.length > 0) {
        maxModeStr = '[Is_MAX_MODE: MAX](MAX) ' +
            styleOptions.maxParams.map(p => `[${p}: MAX](MAX)`).join(' ');
    }

    // 構建歌詞頂部（防止 Lyric Bleed）
    let lyricsPrefix = '';
    if (styleOptions.lyricBleedProtection) {
        lyricsPrefix = '///*****///\n\n';
    }

    // 構建 START_ON 指令
    let startOnNote = '';
    if (styleOptions.skipIntro) {
        startOnNote = `\n- 在歌詞開頭加入 [START_ON: "第一句歌詞"] 來跳過前奏，直接從人聲開始`;
    }

    let prompt;

    if (aiMode === 'auto') {
        // AI 全自動模式：只提供主題，讓 AI 決定一切
        prompt = `你是一位專業的 Suno AI 歌詞創作者和音樂製作人。請為以下主題創作一首完整的歌曲。

## 歌曲主題
${theme}

## 你的任務
作為專業音樂製作人，請根據主題：
1. **決定最適合的音樂風格**（如 Pop, Rock, R&B, Electronic 等）
2. **決定歌曲情緒**（如 happy, melancholic, energetic 等）
3. **設計歌曲結構**（Intro, Verse, Chorus, Bridge, Outro 的安排）
4. **選擇人聲風格**（男聲/女聲、柔和/有力 等）
5. **設計 Style of Music Prompt**（包含所有音樂元素）
6. **創作符合 Suno 格式的完整歌詞**

## 輸出格式
請按以下格式輸出：

### Style of Music Prompt
\`\`\`
[你設計的 style prompt，使用 colon+quotes 格式如 genre: "pop", mood: "romantic"]
\`\`\`

### 歌詞
[完整的 Suno 格式歌詞，包含所有 metatag 標籤]

## Suno Metatag 格式說明
- 結構標籤：[Intro], [Verse], [Chorus], [Bridge], [Outro]
- 進階標籤：[Verse | emotional build-up], [Chorus | anthemic]
- Ad-libs：(oh yeah), (hmm~) - 用小括號
- 效果：[Instrumental], [Build Up], [Drop], [Fade Out]

請發揮你的專業創意，創作出最適合這個主題的歌曲！`;

    } else if (aiMode === 'optimize') {
        // AI 優化模式：使用者設定的參數 + AI 補充未設定的
        const userSetParams = [];
        const unsetParams = [];

        if (genre) userSetParams.push(`風格: ${genre}`);
        else unsetParams.push('音樂風格');

        if (mood) userSetParams.push(`情緒: ${mood}`);
        else unsetParams.push('情緒氛圍');

        if (styleOptions.vocalStyle) userSetParams.push(`人聲: ${styleOptions.vocalStyle}`);
        else unsetParams.push('人聲風格');

        if (styleOptions.tempo) userSetParams.push(`速度: ${styleOptions.tempo}`);
        else unsetParams.push('節奏速度');

        if (styleOptions.stylePrompt) userSetParams.push(`自訂風格: ${styleOptions.stylePrompt}`);
        if (styleOptions.selectedStyles.length > 0) userSetParams.push(`樂器: ${styleOptions.selectedStyles.join(', ')}`);

        prompt = `你是一位專業的 Suno AI 歌詞創作者和音樂製作人。請為以下主題創作一首歌詞。

## 歌曲主題
${theme}

## 語言
${languageMap[language] || '繁體中文'}

## 使用者已設定的參數
${userSetParams.length > 0 ? userSetParams.join('\n') : '（無）'}

## 需要你優化決定的參數
${unsetParams.length > 0 ? unsetParams.join(', ') : '（全部已設定）'}

## AI 優化任務
請根據主題和已設定的參數，為未設定的參數選擇最適合的值，並說明你的選擇理由。

## 歌曲結構
包含：${structures.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}

${stylePromptStr ? `## 已設定的 Style Prompt\n\`\`\`\n${stylePromptStr}\n\`\`\`` : ''}
${maxModeStr ? `\n## MAX Mode 標籤\n\`\`\`\n${maxModeStr}\n\`\`\`` : ''}

## 輸出格式
請按以下格式輸出：

### AI 優化建議
[簡短說明你為未設定參數選擇的值及理由]

### 完整 Style of Music Prompt
\`\`\`
[合併使用者設定和你的優化後的完整 style prompt]
\`\`\`

### 歌詞
[完整的 Suno 格式歌詞]

## Suno Metatag 格式說明
- 結構標籤：[Intro], [Verse], [Chorus], [Bridge], [Outro]
- Ad-libs：(oh yeah), (hmm~)
- 效果：[Instrumental], [Build Up], [Drop], [Fade Out]
${styleOptions.instrumentalOnly ? '\n注意：純音樂模式，主要使用 [Instrumental] 標籤' : ''}
${startOnNote}

${styleOptions.lyricBleedProtection ? `## Lyric Bleed Protection\n在歌詞最開頭加入 \`///*****///\` 分隔符` : ''}

${extraInstructions ? `## 額外要求\n${extraInstructions}` : ''}`;

    } else {
        // 手動模式：完全按照使用者設定
        prompt = `你是一位專業的 Suno AI 歌詞創作者。請為以下主題創作一首歌詞，使用專業的 Suno metatag 格式。

## 歌曲主題
${theme}

## 語言
${languageMap[language] || '繁體中文'}

## Style of Music Prompt（請直接使用此格式）
\`\`\`
${stylePromptStr}
\`\`\`
${maxModeStr ? `\n## MAX Mode 標籤（適合原聲/民謠/古典音樂，提升音質）\n\`\`\`\n${maxModeStr}\n\`\`\`` : ''}

## 歌曲結構
包含：${structures.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}

## Suno 進階 Metatag 格式說明

### 結構標籤（方括號）
- 基本：[Intro], [Verse], [Pre-Chorus], [Chorus], [Bridge], [Outro]
- 進階：[Verse | emotional build-up], [Chorus | anthemic | stacked harmonies]
- 可加描述詞控制段落風格

### Ad-libs（小括號）
- 例如：(oh yeah), (hmm~), (啦啦啦) - 會被唱出但不是主歌詞

### 效果/樂器標籤
- [Instrumental], [Guitar Solo], [Build Up], [Drop], [Fade Out]
- [High Energy], [Low Energy], [Building Energy]
${styleOptions.instrumentalOnly ? '\n### 純音樂模式\n主要使用 [Instrumental] 和樂器標籤，加入段落結構提示' : ''}
${startOnNote}

${styleOptions.lyricBleedProtection ? `## Lyric Bleed Protection
在歌詞最開頭加入 \`///*****///\` 分隔符，防止 Style Prompt 被意外唱出` : ''}

${extraInstructions ? `## 額外要求\n${extraInstructions}` : ''}

## 輸出格式
${styleOptions.lyricBleedProtection ? '1. 最開頭加入 ///*****/// 分隔符\n2. ' : ''}直接輸出歌詞，包含所有 metatag 標籤
不要加任何解釋或前言，直接輸出可用於 Suno 的歌詞格式`;
    }

    return prompt;
}

// ===== 呼叫後端 API =====
async function callBackendAPI(prompt) {
    const url = elements.backendUrl.value.trim();
    const response = await fetch(`${url}/api/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt,
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
        throw new Error(data.error || '生成失敗');
    }
    return data.content;
}

// ===== 呼叫 Claude API (直接) =====
async function callClaudeAPI(apiKey, prompt) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
}

// ===== 顯示歌詞 =====
function displayLyrics(lyrics) {
    // 高亮標籤
    const highlighted = lyrics
        .replace(/\[([^\]]+)\]/g, '<span class="lyrics-tag">[$1]</span>')
        .replace(/\(([^)]+)\)/g, '<span class="lyrics-adlib">($1)</span>');

    elements.outputArea.innerHTML = highlighted;
    elements.outputArea.dataset.rawLyrics = lyrics;
    elements.copyBtn.disabled = false;
    elements.editBtn.disabled = false;
}

// ===== 設定生成中狀態 =====
function setGeneratingState(isGenerating) {
    elements.generateBtn.disabled = isGenerating;
    elements.generateBtn.querySelector('.btn-text').style.display = isGenerating ? 'none' : 'inline';
    elements.generateBtn.querySelector('.btn-loading').style.display = isGenerating ? 'inline' : 'none';
}

// ===== 編輯生成的歌詞 =====
function editGeneratedLyrics() {
    const lyrics = elements.outputArea.dataset.rawLyrics || elements.outputArea.textContent;
    elements.lyricsEditor.value = lyrics;
    updateEditorCounts();
    switchTab('template-edit');
}

// ===== 插入標籤 =====
function insertTag(tag) {
    const editor = elements.lyricsEditor;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;

    // 在游標位置插入標籤和換行
    const newText = text.substring(0, start) + tag + '\n' + text.substring(end);
    editor.value = newText;

    // 設定游標位置
    const newPos = start + tag.length + 1;
    editor.setSelectionRange(newPos, newPos);
    editor.focus();

    updateEditorCounts();
}

// ===== 載入模板 =====
function loadTemplate(templateId) {
    const template = TEMPLATES[templateId];
    if (template) {
        elements.lyricsEditor.value = template;
        updateEditorCounts();
        hideModal();
    }
}

// ===== 更新編輯器計數 =====
function updateEditorCounts() {
    const text = elements.lyricsEditor.value;
    elements.charCount.textContent = `${text.length} 字元`;
    elements.lineCount.textContent = `${text.split('\n').length} 行`;
}

// ===== Modal 控制 =====
function showModal() {
    elements.templateModal.classList.add('active');
}

function hideModal() {
    elements.templateModal.classList.remove('active');
}

// ===== 複製到剪貼簿 =====
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('已複製到剪貼簿！', 'success');
    } catch (err) {
        showToast('複製失敗', 'error');
    }
}

// ===== Toast 通知 =====
function showToast(message, type = 'info') {
    // 移除現有的 toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ===== 啟動應用 =====
init();
