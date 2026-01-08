// ===== Suno 歌詞產生器 =====

// 迭代優化計數器
let iterationCount = 0;
let currentLyrics = '';
let currentStylePrompt = '';

// ===== 版本歷史系統 =====
const VERSION_STORAGE_KEY = 'suno-lyrics-versions';
const MAX_VERSIONS = 50;

// 版本資料結構
let versionHistory = [];

// 載入版本歷史
function loadVersionHistory() {
    try {
        const saved = localStorage.getItem(VERSION_STORAGE_KEY);
        versionHistory = saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('載入版本歷史失敗:', e);
        versionHistory = [];
    }
}

// 儲存版本歷史
function saveVersionHistory() {
    try {
        // 限制最大版本數
        if (versionHistory.length > MAX_VERSIONS) {
            versionHistory = versionHistory.slice(-MAX_VERSIONS);
        }
        localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(versionHistory));
    } catch (e) {
        console.error('儲存版本歷史失敗:', e);
    }
}

// 新增版本
function addVersion(data) {
    const version = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        iteration: iterationCount,
        theme: data.theme || '',
        lyrics: data.lyrics || '',
        stylePrompt: data.stylePrompt || '',
        genre: data.genre || '',
        mood: data.mood || '',
        language: data.language || '',
        structures: data.structures || [],
        aiMode: data.aiMode || 'manual',
        note: data.note || ''
    };
    versionHistory.push(version);
    saveVersionHistory();
    updateVersionHistoryUI();
    return version;
}

// 恢復版本
function restoreVersion(versionId) {
    const version = versionHistory.find(v => v.id === versionId);
    if (!version) {
        showToast('找不到該版本', 'error');
        return;
    }

    // 恢復歌詞
    currentLyrics = version.lyrics;
    displayLyrics(version.lyrics, false);

    // 恢復 Style Prompt
    if (version.stylePrompt && elements.stylePrompt) {
        elements.stylePrompt.value = version.stylePrompt;
        currentStylePrompt = version.stylePrompt;
    }

    // 恢復主題
    if (version.theme && elements.songTheme) {
        elements.songTheme.value = version.theme;
    }

    // 恢復其他設定
    if (version.genre && elements.songGenre) {
        elements.songGenre.value = version.genre;
    }
    if (version.mood && elements.songMood) {
        elements.songMood.value = version.mood;
    }
    if (version.language && elements.songLanguage) {
        elements.songLanguage.value = version.language;
    }

    // 恢復迭代計數
    iterationCount = version.iteration || 0;
    if (elements.iterationNum) {
        elements.iterationNum.textContent = iterationCount + 1;
    }

    showToast(`已恢復至版本 ${formatTimestamp(version.timestamp)}`, 'success');
    closeHistoryPanel();
}

// 刪除版本
function deleteVersion(versionId) {
    versionHistory = versionHistory.filter(v => v.id !== versionId);
    saveVersionHistory();
    updateVersionHistoryUI();
    showToast('版本已刪除', 'success');
}

// 匯出版本為檔案
function exportVersion(versionId) {
    const version = versionHistory.find(v => v.id === versionId);
    if (!version) return;

    const exportData = {
        ...version,
        exportedAt: new Date().toISOString(),
        appVersion: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suno-lyrics-${formatFilename(version.timestamp)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('版本已匯出', 'success');
}

// 匯出所有版本
function exportAllVersions() {
    if (versionHistory.length === 0) {
        showToast('沒有版本可匯出', 'error');
        return;
    }

    const exportData = {
        versions: versionHistory,
        exportedAt: new Date().toISOString(),
        totalVersions: versionHistory.length
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suno-lyrics-all-${formatFilename(new Date().toISOString())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('所有版本已匯出', 'success');
}

// 匯入版本
function importVersions(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            // 判斷是單一版本還是多版本
            if (data.versions && Array.isArray(data.versions)) {
                // 多版本匯入
                data.versions.forEach(v => {
                    v.id = Date.now() + Math.random(); // 重新生成 ID
                    versionHistory.push(v);
                });
                showToast(`已匯入 ${data.versions.length} 個版本`, 'success');
            } else if (data.lyrics) {
                // 單一版本匯入
                data.id = Date.now();
                versionHistory.push(data);
                showToast('版本已匯入', 'success');
            } else {
                throw new Error('無效的版本格式');
            }

            saveVersionHistory();
            updateVersionHistoryUI();
        } catch (err) {
            showToast('匯入失敗: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
}

// 格式化時間戳
function formatTimestamp(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('zh-TW', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 格式化檔名
function formatFilename(isoString) {
    return isoString.replace(/[:.]/g, '-').slice(0, 19);
}

// 更新版本歷史 UI
function updateVersionHistoryUI() {
    const listEl = document.getElementById('version-list');
    const countEl = document.getElementById('version-count');

    if (countEl) {
        countEl.textContent = versionHistory.length;
    }

    if (!listEl) return;

    if (versionHistory.length === 0) {
        listEl.innerHTML = '<div class="version-empty">尚無版本記錄</div>';
        return;
    }

    // 按時間倒序顯示
    const sortedVersions = [...versionHistory].reverse();

    listEl.innerHTML = sortedVersions.map(v => `
        <div class="version-item" data-id="${v.id}">
            <div class="version-info">
                <div class="version-time">${formatTimestamp(v.timestamp)}</div>
                <div class="version-meta">
                    ${v.theme ? `<span class="version-theme">${v.theme.slice(0, 20)}${v.theme.length > 20 ? '...' : ''}</span>` : ''}
                    ${v.iteration > 0 ? `<span class="version-iteration">第 ${v.iteration} 次迭代</span>` : '<span class="version-iteration">初始版本</span>'}
                </div>
                <div class="version-preview">${(v.lyrics || '').slice(0, 50)}...</div>
            </div>
            <div class="version-actions">
                <button class="version-btn restore" title="恢復此版本" onclick="restoreVersion(${v.id})">
                    <span>恢復</span>
                </button>
                <button class="version-btn export" title="匯出" onclick="exportVersion(${v.id})">
                    <span>匯出</span>
                </button>
                <button class="version-btn delete" title="刪除" onclick="deleteVersion(${v.id})">
                    <span>×</span>
                </button>
            </div>
        </div>
    `).join('');
}

// 開啟歷史面板
function openHistoryPanel() {
    const panel = document.getElementById('history-panel');
    const overlay = document.getElementById('history-overlay');
    if (panel) {
        panel.classList.add('active');
        updateVersionHistoryUI();
    }
    if (overlay) {
        overlay.classList.add('active');
    }
}

// 關閉歷史面板
function closeHistoryPanel() {
    const panel = document.getElementById('history-panel');
    const overlay = document.getElementById('history-overlay');
    if (panel) {
        panel.classList.remove('active');
    }
    if (overlay) {
        overlay.classList.remove('active');
    }
}

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

// ===== 歌曲結構管理 =====
const STRUCTURE_TEMPLATES = {
    'pop-standard': ['intro', 'verse', 'pre-chorus', 'chorus', 'verse', 'pre-chorus', 'chorus', 'bridge', 'chorus', 'outro'],
    'verse-chorus': ['verse', 'chorus', 'verse', 'chorus', 'outro'],
    'ballad': ['intro', 'verse', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus', 'chorus', 'outro'],
    'edm': ['intro', 'drop', 'break', 'drop', 'break', 'drop', 'outro'],
    'hip-hop': ['intro', 'verse', 'hook', 'verse', 'hook', 'bridge', 'verse', 'hook', 'outro']
};

const SECTION_LABELS = {
    'intro': 'Intro',
    'verse': 'Verse',
    'pre-chorus': 'Pre-Chorus',
    'chorus': 'Chorus',
    'bridge': 'Bridge',
    'outro': 'Outro',
    'instrumental': 'Instrumental',
    'drop': 'Drop',
    'hook': 'Hook',
    'break': 'Break'
};

// 當前歌曲結構
let currentStructure = ['intro', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus', 'outro'];

// 渲染結構列表
function renderStructureList() {
    const listEl = elements.structureList;
    if (!listEl) return;

    // 計算每個類型的數量用於編號
    const typeCounts = {};

    listEl.innerHTML = currentStructure.map((section, index) => {
        // 計算這個類型第幾次出現
        typeCounts[section] = (typeCounts[section] || 0) + 1;
        const count = typeCounts[section];
        const showNumber = currentStructure.filter(s => s === section).length > 1;

        return `
            <div class="structure-item" draggable="true" data-index="${index}">
                <span class="section-name">${SECTION_LABELS[section] || section}</span>
                ${showNumber ? `<span class="section-number">${count}</span>` : ''}
                <button type="button" class="remove-btn" data-index="${index}">&times;</button>
            </div>
        `;
    }).join('');

    // 綁定拖放事件
    bindStructureDragEvents();

    // 綁定移除按鈕
    listEl.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index, 10);
            removeStructureSection(index);
        });
    });
}

// 綁定拖放事件
function bindStructureDragEvents() {
    const items = document.querySelectorAll('.structure-item');
    let draggedItem = null;

    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            draggedItem = null;
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!draggedItem || draggedItem === item) return;

            const rect = item.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;

            if (e.clientY < midY) {
                item.style.borderLeft = '2px solid var(--primary)';
                item.style.borderRight = '';
            } else {
                item.style.borderRight = '2px solid var(--primary)';
                item.style.borderLeft = '';
            }
        });

        item.addEventListener('dragleave', () => {
            item.style.borderLeft = '';
            item.style.borderRight = '';
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.style.borderLeft = '';
            item.style.borderRight = '';

            if (!draggedItem || draggedItem === item) return;

            const fromIndex = parseInt(draggedItem.dataset.index, 10);
            const toIndex = parseInt(item.dataset.index, 10);

            // 重新排列結構
            const [moved] = currentStructure.splice(fromIndex, 1);
            currentStructure.splice(toIndex, 0, moved);

            renderStructureList();
        });
    });
}

// 新增結構段落
function addStructureSection(sectionType) {
    currentStructure.push(sectionType);
    renderStructureList();
}

// 移除結構段落
function removeStructureSection(index) {
    currentStructure.splice(index, 1);
    renderStructureList();
}

// 載入結構模板
function loadStructureTemplate(templateId) {
    if (STRUCTURE_TEMPLATES[templateId]) {
        currentStructure = [...STRUCTURE_TEMPLATES[templateId]];
        renderStructureList();
    }
}

// 獲取當前結構
function getCurrentStructure() {
    return currentStructure.map(s => SECTION_LABELS[s] || s);
}

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
    aiModeHint: document.getElementById('ai-mode-hint'),
    autoModeCustomPref: document.getElementById('auto-mode-custom-pref'),
    customPreference: document.getElementById('custom-preference'),

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

    // Singer Config
    vocalTone: document.getElementById('vocal-tone'),
    vocalRegister: document.getElementById('vocal-register'),
    vocalTechTags: document.querySelectorAll('.vocal-tech-tag'),

    // Instrument Config
    instrumentTags: document.querySelectorAll('.instrument-tag'),

    // Structure Editor
    structureList: document.getElementById('structure-list'),
    structureTemplates: document.querySelectorAll('.structure-template'),
    addSectionType: document.getElementById('add-section-type'),
    addSectionBtn: document.getElementById('add-section-btn'),

    // Iterate Section
    iterateSection: document.getElementById('iterate-section'),
    iterateInstruction: document.getElementById('iterate-instruction'),
    iterateBtn: document.getElementById('iterate-btn'),
    iterateTags: document.querySelectorAll('.iterate-tag'),
    iterationNum: document.getElementById('iteration-num'),
    iterateTargetOptions: document.querySelectorAll('.iterate-target-option'),
    iterateTargetRadios: document.querySelectorAll('input[name="iterate-target"]'),
    lyricsQuickTags: document.getElementById('lyrics-quick-tags'),
    styleQuickTags: document.getElementById('style-quick-tags'),

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

    // 載入版本歷史
    loadVersionHistory();

    // 綁定事件
    bindEvents();

    // 初始化結構編輯器
    renderStructureList();

    // 更新編輯器計數
    updateEditorCounts();

    // 更新版本歷史 UI
    updateVersionHistoryUI();

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

    // 迭代優化按鈕
    elements.iterateBtn.addEventListener('click', iterateLyrics);

    // 迭代快速標籤
    elements.iterateTags.forEach(tag => {
        tag.addEventListener('click', () => {
            elements.iterateInstruction.value = tag.dataset.instruction;
        });
    });

    // 迭代目標切換
    elements.iterateTargetOptions.forEach(option => {
        option.addEventListener('click', () => {
            // 更新 active 狀態
            elements.iterateTargetOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');

            // 更新 radio 選中狀態
            const radio = option.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;

            // 切換快速標籤顯示
            const target = option.dataset.target;
            updateIterateQuickTags(target);

            // 更新按鈕文字
            updateIterateButtonText(target);

            // 更新 placeholder
            updateIteratePlaceholder(target);
        });
    });

    // 版本歷史面板
    const historyBtn = document.getElementById('history-btn');
    const historyCloseBtn = document.getElementById('history-close');
    const historyExportAllBtn = document.getElementById('history-export-all');
    const historyImportBtn = document.getElementById('history-import');
    const historyFileInput = document.getElementById('history-file-input');

    if (historyBtn) {
        historyBtn.addEventListener('click', openHistoryPanel);
    }
    if (historyCloseBtn) {
        historyCloseBtn.addEventListener('click', closeHistoryPanel);
    }
    if (historyExportAllBtn) {
        historyExportAllBtn.addEventListener('click', exportAllVersions);
    }
    if (historyImportBtn) {
        historyImportBtn.addEventListener('click', () => historyFileInput?.click());
    }
    if (historyFileInput) {
        historyFileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                importVersions(e.target.files[0]);
                e.target.value = ''; // 重置以便再次選擇相同檔案
            }
        });
    }

    // Overlay 點擊關閉
    const historyOverlay = document.getElementById('history-overlay');
    if (historyOverlay) {
        historyOverlay.addEventListener('click', closeHistoryPanel);
    }

    // 標籤按鈕
    elements.tagButtons.forEach(btn => {
        btn.addEventListener('click', () => insertTag(btn.dataset.tag));
    });

    // 風格標籤按鈕（可多選）
    elements.styleTags.forEach(btn => {
        btn.addEventListener('click', () => toggleStyleTag(btn));
    });

    // 人聲技巧標籤（可多選）
    elements.vocalTechTags.forEach(btn => {
        btn.addEventListener('click', () => toggleStyleTag(btn));
    });

    // 樂器標籤（可多選）
    elements.instrumentTags.forEach(btn => {
        btn.addEventListener('click', () => toggleStyleTag(btn));
    });

    // 結構模板按鈕
    elements.structureTemplates.forEach(btn => {
        btn.addEventListener('click', () => {
            loadStructureTemplate(btn.dataset.template);
        });
    });

    // 新增段落按鈕
    if (elements.addSectionBtn) {
        elements.addSectionBtn.addEventListener('click', () => {
            const sectionType = elements.addSectionType?.value;
            if (sectionType) {
                addStructureSection(sectionType);
            }
        });
    }

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
const AI_MODE_HINTS = {
    manual: '手動設定所有參數，完全控制生成結果',
    optimize: 'AI 會自動補充你未設定的參數，並說明選擇理由',
    auto: '只需輸入主題，AI 會決定一切（但會參考你已設定的偏好）'
};

function toggleAiMode(mode) {
    localStorage.setItem('ai-mode', mode);
    if (mode === 'auto') {
        // AI 全自動：隱藏手動設定，顯示自訂偏好欄位
        elements.manualSettings.classList.add('hidden');
        elements.autoModeCustomPref.classList.remove('hidden');
    } else {
        // 手動或 AI 優化：顯示手動設定，隱藏自訂偏好欄位
        elements.manualSettings.classList.remove('hidden');
        elements.autoModeCustomPref.classList.add('hidden');
    }

    // 更新提示文字
    updateAiModeHint(mode);
}

function updateAiModeHint(mode) {
    const hintText = elements.aiModeHint.querySelector('.hint-text');
    if (hintText && AI_MODE_HINTS[mode]) {
        hintText.textContent = AI_MODE_HINTS[mode];
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
    const structures = getCurrentStructure();  // 使用新的結構編輯器
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

    // 收集歌手聲線配置
    const vocalTone = elements.vocalTone?.value || '';
    const vocalRegister = elements.vocalRegister?.value || '';
    const selectedVocalTechs = Array.from(elements.vocalTechTags || [])
        .filter(btn => btn.classList.contains('active'))
        .map(btn => btn.dataset.style);

    // 收集樂器配器配置
    const selectedInstruments = Array.from(elements.instrumentTags || [])
        .filter(btn => btn.classList.contains('active'))
        .map(btn => btn.dataset.style);

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
        masteringStyle: elements.masteringStyle.value,
        // 歌手聲線配置
        vocalTone: vocalTone,
        vocalRegister: vocalRegister,
        vocalTechniques: selectedVocalTechs,
        // 樂器配器配置
        instruments: selectedInstruments
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

        // 儲存版本
        const stylePromptValue = elements.stylePrompt ? elements.stylePrompt.value : '';
        currentStylePrompt = stylePromptValue;
        addVersion({
            theme: theme,
            lyrics: currentLyrics,
            stylePrompt: stylePromptValue,
            genre: genre,
            mood: mood,
            language: language,
            structures: structures,
            aiMode: aiMode
        });

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

    // 音色對應
    const vocalToneMap = {
        'smooth': 'smooth voice',
        'raspy': 'raspy voice',
        'breathy': 'breathy voice',
        'warm': 'warm voice',
        'bright': 'bright voice',
        'deep': 'deep voice',
        'nasal': 'nasal voice'
    };

    // 音域對應
    const vocalRegisterMap = {
        'soprano': 'soprano',
        'alto': 'alto',
        'tenor': 'tenor',
        'bass': 'bass',
        'falsetto': 'falsetto',
        'head-voice': 'head voice'
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

    // 樂器/風格元素（包含風格標籤和樂器配器）
    const allInstruments = [...(styleOptions.selectedStyles || []), ...(styleOptions.instruments || [])];
    if (allInstruments.length > 0) {
        stylePromptParts.push(`instruments: "${allInstruments.join(', ')}"`);
    }

    // 歌手聲線特色
    const vocalDescriptions = [];
    if (styleOptions.vocalTone && vocalToneMap[styleOptions.vocalTone]) {
        vocalDescriptions.push(vocalToneMap[styleOptions.vocalTone]);
    }
    if (styleOptions.vocalRegister && vocalRegisterMap[styleOptions.vocalRegister]) {
        vocalDescriptions.push(vocalRegisterMap[styleOptions.vocalRegister]);
    }
    if (styleOptions.vocalTechniques && styleOptions.vocalTechniques.length > 0) {
        vocalDescriptions.push(...styleOptions.vocalTechniques);
    }
    if (vocalDescriptions.length > 0) {
        stylePromptParts.push(`vocal_style: "${vocalDescriptions.join(', ')}"`);
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
        // AI 全自動模式：提供主題，並收集用戶已設定的偏好讓 AI 參考
        const userPreferences = [];

        // 收集用戶自訂的偏好描述（最優先）
        const customPref = elements.customPreference?.value?.trim();
        if (customPref) {
            userPreferences.push(`用戶自訂描述: ${customPref}`);
        }

        // 收集用戶已設定的偏好（如果有的話）
        if (genre) userPreferences.push(`偏好風格: ${genreMap[genre]}`);
        if (mood) userPreferences.push(`偏好情緒: ${moodMap[mood]}`);
        if (styleOptions.vocalStyle) userPreferences.push(`偏好人聲: ${vocalMap[styleOptions.vocalStyle]}`);
        if (styleOptions.tempo) userPreferences.push(`偏好速度: ${tempoMap[styleOptions.tempo]}`);
        if (styleOptions.stylePrompt) userPreferences.push(`自訂風格描述: ${styleOptions.stylePrompt}`);
        if (styleOptions.selectedStyles.length > 0) userPreferences.push(`偏好風格元素: ${styleOptions.selectedStyles.join(', ')}`);

        // 歌手聲線偏好
        if (styleOptions.vocalTone) userPreferences.push(`偏好音色: ${vocalToneMap[styleOptions.vocalTone] || styleOptions.vocalTone}`);
        if (styleOptions.vocalRegister) userPreferences.push(`偏好音域: ${vocalRegisterMap[styleOptions.vocalRegister] || styleOptions.vocalRegister}`);
        if (styleOptions.vocalTechniques && styleOptions.vocalTechniques.length > 0) {
            userPreferences.push(`偏好演唱技巧: ${styleOptions.vocalTechniques.join(', ')}`);
        }

        // 樂器偏好
        if (styleOptions.instruments && styleOptions.instruments.length > 0) {
            userPreferences.push(`偏好樂器: ${styleOptions.instruments.join(', ')}`);
        }

        // 結構偏好（如果用戶有修改預設結構）
        if (structures && structures.length > 0) {
            userPreferences.push(`偏好結構: ${structures.join(' → ')}`);
        }

        // 進階選項偏好
        if (styleOptions.instrumentalOnly) userPreferences.push(`偏好: 純音樂（無人聲）`);
        if (styleOptions.realismTags && styleOptions.realismTags.length > 0) {
            userPreferences.push(`偏好錄音風格: ${styleOptions.realismTags.join(', ')}`);
        }
        if (styleOptions.masteringStyle) userPreferences.push(`偏好母帶處理: ${styleOptions.masteringStyle}`);

        const preferencesSection = userPreferences.length > 0
            ? `\n## 用戶偏好（請參考但不必完全遵循）\n${userPreferences.join('\n')}\n\n這些是用戶設定的偏好，請在創作時參考。如果你認為有更適合這個主題的選擇，可以調整，但請在「創作理由」中說明。\n`
            : '';

        prompt = `你是一位專業的 Suno AI 歌詞創作者和音樂製作人。請為以下主題創作一首完整的歌曲。

## 歌曲主題
${theme}

## 語言
${languageMap[language] || '繁體中文'}
${preferencesSection}
## 你的任務
作為專業音樂製作人，請根據主題${userPreferences.length > 0 ? '和用戶偏好' : ''}：
1. **決定最適合的音樂風格**（如 Pop, Rock, R&B, Electronic 等）
2. **決定歌曲情緒**（如 happy, melancholic, energetic 等）
3. **設計歌曲結構**（Intro, Verse, Chorus, Bridge, Outro 的安排）
4. **選擇人聲風格**（男聲/女聲、柔和/有力 等）
5. **設計 Style of Music Prompt**（包含所有音樂元素）
6. **創作符合 Suno 格式的完整歌詞**

## 輸出格式
請按以下格式輸出：
${userPreferences.length > 0 ? `
### 創作理由
[簡短說明你的風格選擇，以及如何參考用戶偏好]
` : ''}
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
${styleOptions.instrumentalOnly ? '\n注意：用戶希望純音樂，主要使用 [Instrumental] 標籤' : ''}
${extraInstructions ? `\n## 額外要求\n${extraInstructions}` : ''}

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
        if (styleOptions.selectedStyles.length > 0) userSetParams.push(`風格元素: ${styleOptions.selectedStyles.join(', ')}`);

        // 歌手聲線配置
        if (styleOptions.vocalTone) userSetParams.push(`音色: ${styleOptions.vocalTone}`);
        if (styleOptions.vocalRegister) userSetParams.push(`音域: ${styleOptions.vocalRegister}`);
        if (styleOptions.vocalTechniques && styleOptions.vocalTechniques.length > 0) {
            userSetParams.push(`演唱技巧: ${styleOptions.vocalTechniques.join(', ')}`);
        }

        // 樂器配器配置
        if (styleOptions.instruments && styleOptions.instruments.length > 0) {
            userSetParams.push(`樂器: ${styleOptions.instruments.join(', ')}`);
        }

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
function displayLyrics(lyrics, isIteration = false) {
    // 高亮標籤
    const highlighted = lyrics
        .replace(/\[([^\]]+)\]/g, '<span class="lyrics-tag">[$1]</span>')
        .replace(/\(([^)]+)\)/g, '<span class="lyrics-adlib">($1)</span>');

    elements.outputArea.innerHTML = highlighted;
    elements.outputArea.dataset.rawLyrics = lyrics;
    elements.copyBtn.disabled = false;
    elements.editBtn.disabled = false;

    // 儲存當前歌詞並顯示迭代區塊
    currentLyrics = lyrics;
    elements.iterateSection.classList.remove('hidden');

    // 如果是新生成（非迭代），重置計數器
    if (!isIteration) {
        iterationCount = 0;
        elements.iterationNum.textContent = '1';
    }
}

// ===== 迭代目標輔助函數 =====
function getIterateTarget() {
    const checked = document.querySelector('input[name="iterate-target"]:checked');
    return checked ? checked.value : 'lyrics';
}

function updateIterateQuickTags(target) {
    const lyricsQuickTags = elements.lyricsQuickTags;
    const styleQuickTags = elements.styleQuickTags;

    if (!lyricsQuickTags || !styleQuickTags) return;

    if (target === 'style') {
        lyricsQuickTags.classList.add('hidden');
        styleQuickTags.classList.remove('hidden');
    } else if (target === 'both') {
        lyricsQuickTags.classList.remove('hidden');
        styleQuickTags.classList.remove('hidden');
    } else {
        lyricsQuickTags.classList.remove('hidden');
        styleQuickTags.classList.add('hidden');
    }
}

function updateIterateButtonText(target) {
    const btnText = elements.iterateBtn?.querySelector('.btn-text');
    if (!btnText) return;

    switch (target) {
        case 'style':
            btnText.textContent = '優化 Style';
            break;
        case 'both':
            btnText.textContent = '優化全部';
            break;
        default:
            btnText.textContent = '優化歌詞';
    }
}

function updateIteratePlaceholder(target) {
    if (!elements.iterateInstruction) return;

    switch (target) {
        case 'style':
            elements.iterateInstruction.placeholder = '輸入 Style 優化指示，例如：更有能量、加入弦樂、改成復古風格...';
            break;
        case 'both':
            elements.iterateInstruction.placeholder = '輸入優化指示，同時優化歌詞和 Style Prompt...';
            break;
        default:
            elements.iterateInstruction.placeholder = '輸入優化指示，例如：副歌更有力、加入更多押韻、改成更浪漫的風格...';
    }
}

// ===== 迭代優化歌詞 =====
async function iterateLyrics() {
    const isBackendMode = elements.apiModeBackend.checked;
    const apiKey = elements.apiKey.value.trim();

    // 驗證認證
    if (!isBackendMode && !apiKey) {
        showToast('請輸入 Claude API Key', 'error');
        return;
    }

    const target = getIterateTarget();

    // 驗證內容
    if ((target === 'lyrics' || target === 'both') && !currentLyrics) {
        showToast('請先生成歌詞', 'error');
        return;
    }

    if ((target === 'style' || target === 'both') && !currentStylePrompt) {
        showToast('請先設定 Style Prompt', 'error');
        return;
    }

    const instruction = elements.iterateInstruction.value.trim();
    if (!instruction) {
        showToast('請輸入優化指示', 'error');
        return;
    }

    // 更新 UI
    setIteratingState(true);

    try {
        let updatedLyrics = currentLyrics;
        let updatedStyle = currentStylePrompt;
        let resultMessages = [];

        // 根據目標執行不同的優化
        if (target === 'lyrics' || target === 'both') {
            const lyricsPrompt = buildIterationPrompt(currentLyrics, instruction);
            if (isBackendMode) {
                updatedLyrics = await callBackendAPI(lyricsPrompt);
            } else {
                updatedLyrics = await callClaudeAPI(apiKey, lyricsPrompt);
            }
            resultMessages.push('歌詞');
        }

        if (target === 'style' || target === 'both') {
            const stylePrompt = buildStyleIterationPrompt(currentStylePrompt, instruction);
            if (isBackendMode) {
                updatedStyle = await callBackendAPI(stylePrompt);
            } else {
                updatedStyle = await callClaudeAPI(apiKey, stylePrompt);
            }
            // 更新 Style Prompt 欄位
            if (elements.stylePrompt) {
                elements.stylePrompt.value = updatedStyle;
            }
            currentStylePrompt = updatedStyle;
            resultMessages.push('Style');
        }

        // 更新迭代計數
        iterationCount++;
        elements.iterationNum.textContent = iterationCount + 1;

        // 顯示優化後的歌詞（如果有更新）
        if (target === 'lyrics' || target === 'both') {
            displayLyrics(updatedLyrics, true);
        }

        // 儲存版本（迭代優化）
        addVersion({
            theme: elements.songTheme ? elements.songTheme.value : '',
            lyrics: currentLyrics,
            stylePrompt: currentStylePrompt,
            genre: elements.songGenre ? elements.songGenre.value : '',
            mood: elements.songMood ? elements.songMood.value : '',
            language: elements.songLanguage ? elements.songLanguage.value : '',
            note: `迭代優化 (${resultMessages.join('+')})：${instruction}`
        });

        elements.iterateInstruction.value = '';
        showToast(`第 ${iterationCount} 次優化完成！(${resultMessages.join(' + ')})`, 'success');
    } catch (error) {
        console.error('迭代優化失敗:', error);
        showToast(`優化失敗: ${error.message}`, 'error');
    } finally {
        setIteratingState(false);
    }
}

// ===== 構建迭代優化 Prompt =====
function buildIterationPrompt(lyrics, instruction) {
    return `你是一位專業的 Suno AI 歌詞優化師。請根據以下指示優化這首歌詞。

## 當前歌詞
\`\`\`
${lyrics}
\`\`\`

## 優化指示
${instruction}

## 要求
1. 保持 Suno metatag 格式（[標籤]、(ad-libs) 等）
2. 根據優化指示進行針對性修改
3. 保持歌曲的整體結構和風格連貫性
4. 如果是改進押韻，確保韻腳自然
5. 如果是調整情緒，確保過渡平順

## 輸出格式
直接輸出優化後的完整歌詞，不要加任何解釋或比較。
只輸出優化後的歌詞，保持 Suno 可直接使用的格式。`;
}

// ===== 構建 Style 迭代優化 Prompt =====
function buildStyleIterationPrompt(stylePrompt, instruction) {
    return `你是一位專業的 Suno AI Style Prompt 優化師。請根據以下指示優化這個 Style Prompt。

## 當前 Style Prompt
\`\`\`
${stylePrompt}
\`\`\`

## 優化指示
${instruction}

## Style Prompt 優化要求
1. Style Prompt 用於描述 Suno AI 生成音樂的風格特徵
2. 應包含：音樂風格、樂器、人聲特色、情緒氛圍等
3. 使用英文描述詞，以逗號分隔
4. 保持簡潔有力，總長度建議在 100-200 字元
5. 常見元素：
   - 風格：Pop, Rock, Jazz, Hip-hop, Electronic, R&B, Folk, etc.
   - 人聲：Male/Female vocal, Soft, Powerful, Raspy, Smooth, etc.
   - 樂器：Piano, Guitar, Synth, Drums, Bass, Strings, etc.
   - 氛圍：Energetic, Melancholic, Dreamy, Upbeat, Chill, etc.
   - 年代/風格：80s, 90s, Modern, Retro, Vintage, etc.

## 輸出格式
直接輸出優化後的 Style Prompt，不要加任何解釋。
只輸出 Style Prompt 本身，不要加標題或說明。
格式範例：Melodic Pop, female vocal, soft piano, dreamy synth pads, 80s nostalgia, warm reverb`;
}

// ===== 設定迭代中狀態 =====
function setIteratingState(isIterating) {
    elements.iterateBtn.disabled = isIterating;
    elements.iterateBtn.querySelector('.btn-text').style.display = isIterating ? 'none' : 'inline';
    elements.iterateBtn.querySelector('.btn-loading').style.display = isIterating ? 'inline' : 'none';
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
