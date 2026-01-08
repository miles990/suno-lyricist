// ===== Suno 歌詞產生器 =====

// 迭代優化計數器
let iterationCount = 0;
let currentLyrics = '';
let currentStylePrompt = '';

// ===== BPM 智能建議系統 =====
// 基於 Suno AI Secrets 知識庫的 Genre/BPM 映射
const GENRE_BPM_MAP = {
    // 流行 Pop
    'pop': 120, 'synth-pop': 118, 'indie-pop': 110, 'dream-pop': 90,
    'dance-pop': 128, 'bedroom-pop': 95, 'k-pop': 130, 'j-pop': 125,
    'c-pop': 115, 'hyperpop': 160,
    // 電子 Electronic
    'house': 122, 'deep-house': 120, 'tech-house': 126, 'progressive-house': 128,
    'techno': 130, 'trance': 138, 'dubstep': 140, 'drum-and-bass': 174,
    'future-bass': 150, 'hardstyle': 150, 'synthwave': 126, 'lo-fi': 85,
    'chillwave': 100, 'vaporwave': 115, 'electronic': 128,
    // 嘻哈 Hip-Hop
    'hip-hop': 95, 'trap': 140, 'drill': 140, 'boom-bap': 90,
    'cloud-rap': 70, 'phonk': 130, 'g-funk': 95,
    // 搖滾 Rock
    'rock': 120, 'hard-rock': 140, 'indie-rock': 115, 'punk-rock': 180,
    'grunge': 100, 'post-rock': 95, 'alternative': 110,
    // 金屬 Metal
    'metal': 130, 'heavy-metal': 160, 'death-metal': 180, 'black-metal': 200,
    'metalcore': 170, 'doom-metal': 60,
    // R&B / Soul
    'r&b': 90, 'neo-soul': 85, 'soul': 75, 'funk': 115, 'disco': 120,
    // 爵士 Jazz
    'jazz': 120, 'smooth-jazz': 95, 'bebop': 180, 'jazz-fusion': 110, 'swing': 140,
    // 民謠 Folk/Country
    'folk': 95, 'indie-folk': 90, 'country': 100, 'bluegrass': 140, 'americana': 85,
    // 抒情 Ballad
    'ballad': 70, 'power-ballad': 80,
    // 拉丁/世界 Latin/World
    'reggaeton': 95, 'reggae': 80, 'afrobeat': 110, 'bossa-nova': 120,
    'salsa': 180, 'flamenco': 120,
    // 古典 Classical
    'classical': 90, 'orchestral': 80, 'cinematic': 95,
    // 氛圍/實驗 Ambient
    'ambient': 60, 'dark-ambient': 70, 'experimental': 90, 'idm': 130,
    // 其他 Other
    'blues': 75, 'gospel': 70, 'emo': 155
};

// 獲取 BPM 建議
function getSuggestedBPM(genre) {
    return GENRE_BPM_MAP[genre] || null;
}

// 更新 BPM 建議顯示
function updateBPMSuggestion(genre) {
    const bpm = getSuggestedBPM(genre);
    const suggestionEl = document.getElementById('bpm-suggestion');
    const bpmInput = document.getElementById('song-bpm');

    if (suggestionEl && bpm) {
        suggestionEl.textContent = `建議: ${bpm}`;
        suggestionEl.classList.add('active');
    } else if (suggestionEl) {
        suggestionEl.textContent = '';
        suggestionEl.classList.remove('active');
    }
}

// 自動設定 BPM
function autoSetBPM() {
    const genreSelect = document.getElementById('song-genre');
    const bpmInput = document.getElementById('song-bpm');

    if (genreSelect && bpmInput) {
        const bpm = getSuggestedBPM(genreSelect.value);
        if (bpm) {
            bpmInput.value = bpm;
            showToast(`已設定 BPM: ${bpm}`, 'success');
        }
    }
}

// ===== 智能主題分析系統 =====
// 主題關鍵詞與推薦風格映射
const THEME_KEYWORDS = {
    // 愛情/浪漫
    love: { genres: ['ballad', 'r&b', 'pop'], moods: ['romantic'], vocals: ['soft', 'female'], keywords: ['愛', '戀', '心', 'love', 'heart', '愛情', '浪漫', '想你', '喜歡'] },
    heartbreak: { genres: ['ballad', 'r&b'], moods: ['sad', 'melancholic'], vocals: ['soft'], keywords: ['分手', '離開', '眼淚', '傷心', 'broken', 'tears', '失戀', '心碎'] },
    // 季節/自然
    summer: { genres: ['pop', 'dance-pop', 'reggaeton'], moods: ['happy', 'energetic'], keywords: ['夏天', '夏日', '海灘', '陽光', 'summer', 'beach', 'sun'] },
    night: { genres: ['r&b', 'lo-fi', 'jazz'], moods: ['dreamy', 'peaceful'], keywords: ['夜', '晚', '月', 'night', 'moon', 'midnight', '夜晚', '星空'] },
    rain: { genres: ['lo-fi', 'jazz', 'ballad'], moods: ['melancholic', 'peaceful'], keywords: ['雨', 'rain', '下雨', '雨天'] },
    // 情緒
    party: { genres: ['edm', 'dance-pop', 'house'], moods: ['energetic', 'happy'], vocals: ['powerful'], keywords: ['派對', 'party', '跳舞', 'dance', '嗨', 'club'] },
    chill: { genres: ['lo-fi', 'chillwave', 'ambient'], moods: ['peaceful', 'dreamy'], keywords: ['放鬆', 'chill', 'relax', '慵懶', '悠閒'] },
    hype: { genres: ['hip-hop', 'trap', 'edm'], moods: ['energetic', 'angry'], vocals: ['rap', 'powerful'], keywords: ['嘻哈', 'rap', '說唱', 'flow', 'hustle', '錢', 'money'] },
    // 城市/生活
    city: { genres: ['synthwave', 'pop', 'r&b'], moods: ['nostalgic', 'dreamy'], keywords: ['城市', 'city', '都市', '街', '霓虹', 'neon'] },
    journey: { genres: ['folk', 'indie-rock', 'cinematic'], moods: ['hopeful', 'nostalgic'], keywords: ['旅行', 'journey', 'road', '路上', '遠方', '流浪'] },
    // 復古
    retro: { genres: ['synthwave', 'disco', 'funk'], moods: ['nostalgic', 'energetic'], keywords: ['復古', 'retro', '80s', '90s', '懷舊', 'vintage'] },
    // 黑暗/神秘
    dark: { genres: ['dark-ambient', 'metal', 'trap'], moods: ['angry', 'melancholic'], keywords: ['黑暗', 'dark', '惡夢', '恐懼', 'nightmare', '暗'] },
    // 勵志
    inspirational: { genres: ['pop', 'rock', 'gospel'], moods: ['hopeful', 'energetic'], vocals: ['powerful'], keywords: ['夢想', 'dream', '希望', 'hope', '堅強', '勇氣', 'believe', '相信'] }
};

// 分析主題並生成推薦
function analyzeTheme(theme) {
    if (!theme || theme.trim().length === 0) {
        return null;
    }

    const lowerTheme = theme.toLowerCase();
    const recommendations = {
        genres: [],
        moods: [],
        vocals: [],
        instruments: [],
        tempo: null
    };

    // 匹配關鍵詞
    for (const [category, config] of Object.entries(THEME_KEYWORDS)) {
        for (const keyword of config.keywords) {
            if (lowerTheme.includes(keyword.toLowerCase())) {
                if (config.genres) recommendations.genres.push(...config.genres);
                if (config.moods) recommendations.moods.push(...config.moods);
                if (config.vocals) recommendations.vocals.push(...config.vocals);
                break;
            }
        }
    }

    // 去重
    recommendations.genres = [...new Set(recommendations.genres)].slice(0, 3);
    recommendations.moods = [...new Set(recommendations.moods)].slice(0, 2);
    recommendations.vocals = [...new Set(recommendations.vocals)].slice(0, 2);

    // 根據推薦的 genre 添加樂器和 tempo
    if (recommendations.genres.length > 0) {
        const primaryGenre = recommendations.genres[0];
        const genreSuggestion = GENRE_SUGGESTIONS[primaryGenre];
        if (genreSuggestion) {
            recommendations.instruments = genreSuggestion.instruments.slice(0, 3);
            recommendations.tempo = genreSuggestion.tempos[0];
        }
    }

    return recommendations.genres.length > 0 ? recommendations : null;
}

// 顯示主題推薦
function showThemeSuggestions(recommendations) {
    const panel = document.getElementById('theme-suggestions');
    const tagsContainer = document.getElementById('suggestion-tags');

    if (!recommendations || !panel || !tagsContainer) return;

    let tagsHTML = '';

    // 風格標籤
    recommendations.genres.forEach(genre => {
        const genreText = genre.replace(/-/g, ' ');
        tagsHTML += `<span class="suggestion-tag" data-type="genre" data-value="${genre}">
            <span class="tag-category">風格</span> ${genreText}
        </span>`;
    });

    // 情緒標籤
    recommendations.moods.forEach(mood => {
        tagsHTML += `<span class="suggestion-tag" data-type="mood" data-value="${mood}">
            <span class="tag-category">情緒</span> ${mood}
        </span>`;
    });

    // 人聲標籤
    recommendations.vocals.forEach(vocal => {
        tagsHTML += `<span class="suggestion-tag" data-type="vocal" data-value="${vocal}">
            <span class="tag-category">人聲</span> ${vocal}
        </span>`;
    });

    // 樂器標籤
    recommendations.instruments.forEach(inst => {
        tagsHTML += `<span class="suggestion-tag" data-type="instrument" data-value="${inst}">
            <span class="tag-category">樂器</span> ${inst}
        </span>`;
    });

    tagsContainer.innerHTML = tagsHTML;
    panel.classList.remove('hidden');

    // 綁定標籤點擊事件
    tagsContainer.querySelectorAll('.suggestion-tag').forEach(tag => {
        tag.addEventListener('click', () => applySingleSuggestion(tag));
    });
}

// 套用單個推薦
function applySingleSuggestion(tag) {
    const type = tag.dataset.type;
    const value = tag.dataset.value;

    switch (type) {
        case 'genre':
            document.getElementById('song-genre').value = value;
            updateBPMSuggestion(value);
            autoSetBPM();
            break;
        case 'mood':
            document.getElementById('song-mood').value = value;
            break;
        case 'vocal':
            document.getElementById('vocal-style').value = value;
            break;
        case 'instrument':
            const instTag = document.querySelector(`.instrument-tag[data-style="${value}"]`);
            if (instTag && !instTag.classList.contains('active')) {
                instTag.click();
            }
            break;
    }

    tag.style.opacity = '0.5';
    tag.style.pointerEvents = 'none';
    showToast(`已套用: ${value}`, 'success');
}

// 套用全部推薦
function applyAllSuggestions() {
    const tags = document.querySelectorAll('#suggestion-tags .suggestion-tag');
    tags.forEach(tag => {
        if (tag.style.opacity !== '0.5') {
            applySingleSuggestion(tag);
        }
    });
}

// 初始化智能分析功能
function initSmartAnalyze() {
    const analyzeBtn = document.getElementById('smart-analyze-btn');
    const themeInput = document.getElementById('song-theme');
    const applyBtn = document.getElementById('apply-suggestions');

    if (analyzeBtn && themeInput) {
        analyzeBtn.addEventListener('click', () => {
            const theme = themeInput.value;
            if (!theme.trim()) {
                showToast('請先輸入歌曲主題', 'error');
                return;
            }

            const recommendations = analyzeTheme(theme);
            if (recommendations) {
                showThemeSuggestions(recommendations);
                showToast('已分析主題並生成推薦', 'success');
            } else {
                showToast('無法識別主題關鍵詞，請嘗試更具體的描述', 'info');
            }
        });
    }

    if (applyBtn) {
        applyBtn.addEventListener('click', applyAllSuggestions);
    }
}

// ===== 智能 Mix 預設系統 =====
// 基於 Suno AI Secrets 的類型特定 Mix 設定
const GENRE_MIX_PRESETS = {
    // 電子/EDM
    'house': ['bass-forward', 'wide stereo field', 'sidechain pumping'],
    'deep-house': ['bass-forward', 'wide stereo field', 'natural dynamic range'],
    'tech-house': ['bass-forward', 'bright crisp highs', 'sidechain pumping'],
    'techno': ['low-end heavy', 'wide stereo field', 'heavily compressed loud'],
    'trance': ['wide stereo field', 'bright crisp highs', 'sidechain pumping'],
    'dubstep': ['low-end heavy', 'wide stereo field', 'heavily compressed loud'],
    'drum-and-bass': ['bass-forward', 'wide stereo field', 'heavily compressed loud'],
    'future-bass': ['bass-forward', 'wide stereo field', 'sidechain pumping'],
    'lo-fi': ['analog warmth', 'tape saturation', 'vinyl crackle'],
    'synthwave': ['analog warmth', 'wide stereo field', 'bright crisp highs'],
    'electronic': ['wide stereo field', 'bright crisp highs', 'sidechain pumping'],
    // 嘻哈
    'hip-hop': ['bass-forward', 'mid-range focused', 'tape saturation'],
    'trap': ['low-end heavy', 'wide stereo field', 'heavily compressed loud'],
    'drill': ['low-end heavy', 'no reverb dry', 'heavily compressed loud'],
    'boom-bap': ['analog warmth', 'mid-range focused', 'tape saturation'],
    'phonk': ['bass-forward', 'tape saturation', 'heavily compressed loud'],
    // 搖滾
    'rock': ['mid-range focused', 'wide stereo field', 'natural dynamic range'],
    'hard-rock': ['mid-range focused', 'wide stereo field', 'heavily compressed loud'],
    'indie-rock': ['analog warmth', 'natural dynamic range', 'tight room reverb'],
    'punk-rock': ['raw unpolished', 'mid-range focused', 'heavily compressed loud'],
    'grunge': ['raw unpolished', 'mid-range focused', 'big hall reverb'],
    'post-rock': ['wide stereo field', 'big hall reverb', 'natural dynamic range'],
    // 金屬
    'metal': ['mid-range focused', 'heavily compressed loud', 'tight room reverb'],
    'heavy-metal': ['mid-range focused', 'heavily compressed loud', 'wide stereo field'],
    // R&B/Soul
    'r&b': ['analog warmth', 'mid-range focused', 'natural dynamic range'],
    'neo-soul': ['analog warmth', 'natural dynamic range', 'tape saturation'],
    'soul': ['analog warmth', 'mid-range focused', 'natural dynamic range'],
    'funk': ['bass-forward', 'mid-range focused', 'natural dynamic range'],
    // 爵士
    'jazz': ['analog warmth', 'natural dynamic range', 'tight room reverb'],
    'smooth-jazz': ['analog warmth', 'natural dynamic range', 'big hall reverb'],
    // 民謠
    'folk': ['analog warmth', 'natural dynamic range', 'tight room reverb'],
    'country': ['analog warmth', 'mid-range focused', 'natural dynamic range'],
    // 抒情
    'ballad': ['analog warmth', 'big hall reverb', 'natural dynamic range'],
    // 流行
    'pop': ['digital precision', 'full-spectrum', 'heavily compressed loud'],
    'k-pop': ['digital precision', 'bright crisp highs', 'heavily compressed loud'],
    'j-pop': ['digital precision', 'bright crisp highs', 'wide stereo field'],
    // 氛圍
    'ambient': ['wide stereo field', 'big hall reverb', 'natural dynamic range'],
    'dark-ambient': ['low-end heavy', 'big hall reverb', 'natural dynamic range'],
    // 古典
    'classical': ['natural dynamic range', 'big hall reverb', 'full-spectrum'],
    'orchestral': ['natural dynamic range', 'big hall reverb', 'full-spectrum'],
    'cinematic': ['wide stereo field', 'big hall reverb', 'natural dynamic range']
};

// 獲取 Mix 預設
function getSuggestedMix(genre) {
    return GENRE_MIX_PRESETS[genre] || null;
}

// 應用智能 Mix 預設
function applySmartMix(genre) {
    const mixPreset = getSuggestedMix(genre);
    if (!mixPreset) return;

    // 清除所有現有 mix 選擇
    document.querySelectorAll('.mix-tag.active').forEach(tag => {
        tag.classList.remove('active');
    });

    // 應用預設選擇
    mixPreset.forEach(mixStyle => {
        const tag = document.querySelector(`.mix-tag[data-style="${mixStyle}"]`);
        if (tag) {
            tag.classList.add('active');
        }
    });

    showToast(`已套用 ${genre.toUpperCase()} 專業混音設定`, 'success');
}

// ===== Style Prompt 預設模板庫 =====
const STYLE_PRESETS = {
    // 抒情類
    'romantic-ballad': {
        name: '浪漫抒情',
        icon: '💕',
        category: 'ballad',
        description: '溫柔浪漫的情歌風格',
        stylePrompt: 'Romantic Ballad, soft female vocals, piano, strings ensemble, warm reverb, intimate, emotional, 90 BPM',
        suggestedGenre: 'ballad',
        suggestedMood: 'romantic',
        suggestedVocal: 'female',
        suggestedTempo: 'slow',
        instruments: ['piano', 'strings ensemble', 'acoustic guitar'],
        vocalTechniques: ['vibrato', 'breathy vocals']
    },
    'emotional-piano': {
        name: '深情鋼琴',
        icon: '🎹',
        category: 'ballad',
        description: '以鋼琴為主的深情曲風',
        stylePrompt: 'Emotional Piano Ballad, male vocals, grand piano, subtle strings, melancholic, heartfelt, intimate room acoustics, 70 BPM',
        suggestedGenre: 'ballad',
        suggestedMood: 'melancholic',
        suggestedVocal: 'male',
        suggestedTempo: 'slow',
        instruments: ['piano', 'strings ensemble'],
        vocalTechniques: ['vibrato', 'falsetto']
    },
    // 流行類
    'energetic-pop': {
        name: '活力流行',
        icon: '⚡',
        category: 'pop',
        description: '充滿能量的流行舞曲',
        stylePrompt: 'Energetic Pop, catchy hooks, synth, punchy drums, upbeat, bright female vocals, dance-worthy, 120 BPM',
        suggestedGenre: 'pop',
        suggestedMood: 'energetic',
        suggestedVocal: 'female',
        suggestedTempo: 'fast',
        instruments: ['synth', 'drums', 'synth pads'],
        vocalTechniques: ['belting', 'ad-libs']
    },
    'chill-pop': {
        name: '慵懶流行',
        icon: '🌴',
        category: 'pop',
        description: '放鬆慵懶的流行風格',
        stylePrompt: 'Chill Pop, laid-back groove, soft synth pads, mellow bass, dreamy vocals, summer vibes, 95 BPM',
        suggestedGenre: 'pop',
        suggestedMood: 'peaceful',
        suggestedVocal: 'soft',
        suggestedTempo: 'medium',
        instruments: ['synth pads', 'bass guitar', 'acoustic guitar'],
        vocalTechniques: ['breathy vocals']
    },
    'retro-80s': {
        name: '80年代復古',
        icon: '📼',
        category: 'pop',
        description: '經典 80 年代合成器風格',
        stylePrompt: '80s Synthpop, retro synthesizers, gated reverb drums, vintage feel, nostalgic, analog warmth, 110 BPM',
        suggestedGenre: 'electronic',
        suggestedMood: 'nostalgic',
        suggestedVocal: 'powerful',
        suggestedTempo: 'medium',
        instruments: ['synth', 'synth pads', 'drum machine'],
        vocalTechniques: ['belting']
    },
    // 電子類
    'edm-drop': {
        name: '電子舞曲',
        icon: '🎧',
        category: 'electronic',
        description: '強力電音節拍',
        stylePrompt: 'EDM, powerful drops, heavy bass, synth leads, euphoric build-ups, festival energy, 128 BPM',
        suggestedGenre: 'electronic',
        suggestedMood: 'energetic',
        suggestedVocal: 'powerful',
        suggestedTempo: 'fast',
        instruments: ['synth', 'synth lead', '808 drums'],
        vocalTechniques: ['autotuned delivery']
    },
    'lo-fi-chill': {
        name: 'Lo-Fi 放鬆',
        icon: '☕',
        category: 'electronic',
        description: '放鬆學習的 Lo-Fi 風格',
        stylePrompt: 'Lo-Fi Hip Hop, vinyl crackle, mellow piano, soft drums, tape saturation, cozy, study vibes, 85 BPM',
        suggestedGenre: 'lo-fi',
        suggestedMood: 'peaceful',
        suggestedVocal: 'whisper',
        suggestedTempo: 'slow',
        instruments: ['piano', 'drums', 'bass guitar'],
        vocalTechniques: ['breathy vocals']
    },
    // R&B / Soul
    'smooth-rnb': {
        name: '絲滑R&B',
        icon: '🌙',
        category: 'rnb',
        description: '經典 R&B 靈魂風格',
        stylePrompt: 'Smooth R&B, soulful vocals, groovy bass, Rhodes piano, sensual, late night vibes, 90s influence, 95 BPM',
        suggestedGenre: 'r&b',
        suggestedMood: 'romantic',
        suggestedVocal: 'soft',
        suggestedTempo: 'medium',
        instruments: ['electric piano', 'bass guitar', 'drums'],
        vocalTechniques: ['melisma', 'runs', 'ad-libs']
    },
    // 搖滾類
    'indie-rock': {
        name: '獨立搖滾',
        icon: '🎸',
        category: 'rock',
        description: '獨立樂團風格',
        stylePrompt: 'Indie Rock, jangly guitars, driving drums, raw vocals, garage feel, authentic, 115 BPM',
        suggestedGenre: 'rock',
        suggestedMood: 'energetic',
        suggestedVocal: 'male',
        suggestedTempo: 'medium',
        instruments: ['electric guitar', 'bass guitar', 'drums'],
        vocalTechniques: ['raspy lead vocal']
    },
    'acoustic-folk': {
        name: '民謠原聲',
        icon: '🍂',
        category: 'folk',
        description: '溫暖的民謠風格',
        stylePrompt: 'Acoustic Folk, fingerpicking guitar, warm vocals, harmonica, storytelling, intimate, natural dynamics, 100 BPM',
        suggestedGenre: 'folk',
        suggestedMood: 'nostalgic',
        suggestedVocal: 'soft',
        suggestedTempo: 'medium',
        instruments: ['acoustic guitar', 'harmonica'],
        vocalTechniques: ['vibrato', 'breath detail']
    },
    // 嘻哈類
    'trap-beat': {
        name: 'Trap節拍',
        icon: '🔥',
        category: 'hiphop',
        description: '現代 Trap 風格',
        stylePrompt: 'Trap, 808 bass, hi-hat rolls, dark atmosphere, autotuned vocals, hard-hitting, 140 BPM',
        suggestedGenre: 'hip-hop',
        suggestedMood: 'angry',
        suggestedVocal: 'rap',
        suggestedTempo: 'very-fast',
        instruments: ['808 drums', 'hi-hat', 'synth'],
        vocalTechniques: ['autotuned delivery', 'ad-libs']
    },
    'boom-bap': {
        name: '老派嘻哈',
        icon: '📻',
        category: 'hiphop',
        description: '經典老派嘻哈節拍',
        stylePrompt: 'Boom Bap, classic hip hop drums, vinyl samples, jazzy piano, old school flow, 90 BPM',
        suggestedGenre: 'hip-hop',
        suggestedMood: 'nostalgic',
        suggestedVocal: 'rap',
        suggestedTempo: 'medium',
        instruments: ['drums', 'piano', 'bass guitar'],
        vocalTechniques: ['spoken word verse']
    },
    // K-Pop
    'kpop-dance': {
        name: 'K-Pop舞曲',
        icon: '💜',
        category: 'kpop',
        description: '韓流舞曲風格',
        stylePrompt: 'K-Pop, catchy hooks, powerful choreography beat, synth drops, energetic vocals, polished production, 125 BPM',
        suggestedGenre: 'k-pop',
        suggestedMood: 'energetic',
        suggestedVocal: 'powerful',
        suggestedTempo: 'fast',
        instruments: ['synth', 'drums', 'synth lead'],
        vocalTechniques: ['belting', 'runs', 'harmonies']
    },
    // 古典/電影配樂
    'cinematic-epic': {
        name: '電影史詩',
        icon: '🎬',
        category: 'cinematic',
        description: '壯闘的電影配樂風格',
        stylePrompt: 'Cinematic Epic, orchestral swells, powerful drums, strings, brass section, heroic, emotional crescendo',
        suggestedGenre: 'classical',
        suggestedMood: 'hopeful',
        suggestedVocal: 'choir',
        suggestedTempo: 'medium',
        instruments: ['orchestra', 'strings ensemble', 'brass section', 'drums'],
        vocalTechniques: ['operatic', 'stacked harmonies']
    },
    // ===== 新增擴展模板 (基於 Suno AI Secrets) =====
    // 電子擴展
    'deep-house': {
        name: '深浩室',
        icon: '🌊',
        category: 'electronic',
        description: '深沉律動的浩室音樂',
        stylePrompt: 'Deep House, warm bass, atmospheric pads, hypnotic groove, late night club vibes, wide stereo field, 120 BPM, [MIX: BASS-FORWARD; WIDE STEREO SYNTHS]',
        suggestedGenre: 'deep-house',
        suggestedMood: 'peaceful',
        suggestedVocal: 'whisper',
        suggestedTempo: 'medium',
        instruments: ['synth pads', 'synth bass', 'drums', '808 drums'],
        vocalTechniques: ['breathy vocals', 'airy textures']
    },
    'synthwave-retro': {
        name: 'Synthwave復古',
        icon: '🌆',
        category: 'electronic',
        description: '霓虹燈下的復古未來',
        stylePrompt: 'Synthwave, analog synths, neon lights, retro futuristic, driving arpeggios, nostalgic, 80s sci-fi atmosphere, 126 BPM, [MIX: ANALOG WARMTH; BRIGHT CRISP HIGHS]',
        suggestedGenre: 'synthwave',
        suggestedMood: 'nostalgic',
        suggestedVocal: 'powerful',
        suggestedTempo: 'fast',
        instruments: ['analog synth', 'synth lead', 'drums', 'arpeggiator'],
        vocalTechniques: ['belting', 'echo effects']
    },
    'dubstep-heavy': {
        name: 'Dubstep重擊',
        icon: '💥',
        category: 'electronic',
        description: '重低音撕裂節拍',
        stylePrompt: 'Dubstep, massive wobble bass, aggressive drops, half-time drums, dark atmosphere, distorted synths, 140 BPM, [MIX: LOW-END HEAVY; HEAVY SIDECHAIN TO KICK]',
        suggestedGenre: 'dubstep',
        suggestedMood: 'angry',
        suggestedVocal: 'powerful',
        suggestedTempo: 'very-fast',
        instruments: ['synth bass', 'synth lead', '808 drums', 'risers'],
        vocalTechniques: ['growling', 'screaming']
    },
    'trance-euphoric': {
        name: 'Trance激昂',
        icon: '✨',
        category: 'electronic',
        description: '激昂出神的電子音樂',
        stylePrompt: 'Euphoric Trance, soaring leads, emotional build-ups, uplifting melodies, atmospheric pads, festival energy, 138 BPM, [MIX: WIDE STEREO FIELD; BRIGHT CRISP HIGHS]',
        suggestedGenre: 'trance',
        suggestedMood: 'hopeful',
        suggestedVocal: 'female',
        suggestedTempo: 'very-fast',
        instruments: ['synth lead', 'synth pads', 'drums', 'arpeggiator'],
        vocalTechniques: ['belting', 'passionate belting']
    },
    'future-bass-pop': {
        name: 'Future Bass',
        icon: '🌈',
        category: 'electronic',
        description: '繽紛的未來貝斯風格',
        stylePrompt: 'Future Bass, wobbly chords, bright supersaws, emotional drops, pitched vocals, colorful synths, 150 BPM, [MIX: SYNTHS SIDECHAINED TO KICK; STEREO WIDTH ON SYNTHS]',
        suggestedGenre: 'future-bass',
        suggestedMood: 'energetic',
        suggestedVocal: 'female',
        suggestedTempo: 'very-fast',
        instruments: ['synth', 'synth pads', '808 drums', 'synth lead'],
        vocalTechniques: ['ad-libs', 'harmonies']
    },
    // 嘻哈擴展
    'drill-dark': {
        name: 'Drill暗黑',
        icon: '🖤',
        category: 'hiphop',
        description: '陰暗兇猛的鑽頭音樂',
        stylePrompt: 'UK Drill, sliding 808s, menacing melody, dark pads, aggressive flow, street energy, 140 BPM, [MIX: BASS AND KICK DOMINANT; MINIMAL REVERB]',
        suggestedGenre: 'drill',
        suggestedMood: 'angry',
        suggestedVocal: 'rap',
        suggestedTempo: 'very-fast',
        instruments: ['808 drums', 'hi-hat', 'synth'],
        vocalTechniques: ['autotuned delivery', 'ad-libs']
    },
    'phonk-drift': {
        name: 'Phonk漂移',
        icon: '🚗',
        category: 'hiphop',
        description: '地下賽車風格',
        stylePrompt: 'Phonk, Memphis samples, cowbell, distorted bass, drift racing energy, dark aggressive, 130 BPM, [MIX: HEAVILY COMPRESSED LOUD; TAPE SATURATION]',
        suggestedGenre: 'phonk',
        suggestedMood: 'energetic',
        suggestedVocal: 'rap',
        suggestedTempo: 'fast',
        instruments: ['808 drums', 'hi-hat', 'synth', 'percussion'],
        vocalTechniques: ['ad-libs', 'autotuned delivery']
    },
    // R&B 擴展
    'neo-soul': {
        name: 'Neo Soul',
        icon: '💫',
        category: 'rnb',
        description: '現代新靈魂風格',
        stylePrompt: 'Neo Soul, warm Rhodes piano, organic drums, live bass, soulful harmonies, intimate vocal delivery, 85 BPM, [MIX: NATURAL DYNAMIC RANGE; WARM ANALOG TONE]',
        suggestedGenre: 'neo-soul',
        suggestedMood: 'peaceful',
        suggestedVocal: 'soft',
        suggestedTempo: 'slow',
        instruments: ['rhodes', 'bass guitar', 'drums', 'electric piano'],
        vocalTechniques: ['melisma', 'runs', 'soulful cry']
    },
    'funk-groove': {
        name: 'Funk律動',
        icon: '🕺',
        category: 'rnb',
        description: '復古放克律動',
        stylePrompt: 'Funk, tight groovy bass, wah guitar, horn stabs, disco influence, dance floor energy, 115 BPM, [MIX: BASS AND KICK LOCKED TOGETHER; PUNCHY DRUMS]',
        suggestedGenre: 'funk',
        suggestedMood: 'energetic',
        suggestedVocal: 'powerful',
        suggestedTempo: 'medium',
        instruments: ['bass guitar', 'electric guitar', 'brass section', 'drums'],
        vocalTechniques: ['ad-libs', 'belting']
    },
    // 搖滾擴展
    'punk-energy': {
        name: 'Punk能量',
        icon: '⚡',
        category: 'rock',
        description: '狂躁龐克能量',
        stylePrompt: 'Punk Rock, fast power chords, aggressive drums, raw vocals, rebellious energy, DIY aesthetic, 180 BPM, [MIX: RAW UNPOLISHED; GUITARS WIDE AND POWERFUL]',
        suggestedGenre: 'punk-rock',
        suggestedMood: 'angry',
        suggestedVocal: 'powerful',
        suggestedTempo: 'very-fast',
        instruments: ['electric guitar', 'bass guitar', 'drums'],
        vocalTechniques: ['screaming', 'raspy lead vocal']
    },
    'post-rock-ambient': {
        name: 'Post Rock',
        icon: '🌌',
        category: 'rock',
        description: '氛圍後搖滾',
        stylePrompt: 'Post Rock, atmospheric guitars, crescendo build-ups, reverb-drenched, cinematic scope, emotional journey, 95 BPM, [MIX: BIG HALL REVERB; NATURAL DYNAMIC RANGE]',
        suggestedGenre: 'post-rock',
        suggestedMood: 'dreamy',
        suggestedVocal: 'soft',
        suggestedTempo: 'slow',
        instruments: ['electric guitar', 'drums', 'strings ensemble', 'synth pads'],
        vocalTechniques: ['airy textures', 'ghostly echoes']
    },
    'grunge-raw': {
        name: 'Grunge油漬',
        icon: '🎸',
        category: 'rock',
        description: '90年代油漬搖滾',
        stylePrompt: 'Grunge, distorted guitars, angsty vocals, raw production, Seattle sound, emotional intensity, 100 BPM, [MIX: RAW UNPOLISHED; DRUMS AGGRESSIVE WITH ROOM]',
        suggestedGenre: 'grunge',
        suggestedMood: 'melancholic',
        suggestedVocal: 'male',
        suggestedTempo: 'medium',
        instruments: ['electric guitar', 'bass guitar', 'drums'],
        vocalTechniques: ['raspy lead vocal', 'growling']
    },
    // 爵士擴展
    'smooth-jazz': {
        name: '滑順爵士',
        icon: '🎷',
        category: 'jazz',
        description: '輕柔的滑順爵士',
        stylePrompt: 'Smooth Jazz, sultry saxophone, mellow piano, soft brushed drums, warm bass, late night mood, 95 BPM, [MIX: NATURAL ROOM AMBIENCE; WARM VINTAGE TONE]',
        suggestedGenre: 'smooth-jazz',
        suggestedMood: 'romantic',
        suggestedVocal: 'soft',
        suggestedTempo: 'slow',
        instruments: ['saxophone', 'piano', 'bass guitar', 'drums'],
        vocalTechniques: ['vibrato', 'tender croons']
    },
    'bebop-swing': {
        name: 'Bebop搖擺',
        icon: '🎺',
        category: 'jazz',
        description: '經典咆勃爵士',
        stylePrompt: 'Bebop Jazz, complex harmonies, fast improvisation, walking bass, swing drums, virtuosic solos, 180 BPM, [MIX: DYNAMIC RANGE PRESERVED; NATURAL ROOM]',
        suggestedGenre: 'bebop',
        suggestedMood: 'energetic',
        suggestedVocal: 'soft',
        suggestedTempo: 'very-fast',
        instruments: ['trumpet', 'saxophone', 'piano', 'bass guitar', 'drums'],
        vocalTechniques: ['jazz scatting', 'playful ornaments']
    },
    // 世界音樂
    'reggaeton-latin': {
        name: 'Reggaeton',
        icon: '🌴',
        category: 'latin',
        description: '拉丁雷鬼頓節奏',
        stylePrompt: 'Reggaeton, dembow rhythm, Latin percussion, catchy hooks, urban latin vibes, 95 BPM, [MIX: BASS-FORWARD; PUNCHY DRUMS]',
        suggestedGenre: 'reggaeton',
        suggestedMood: 'energetic',
        suggestedVocal: 'male',
        suggestedTempo: 'medium',
        instruments: ['808 drums', 'percussion', 'synth'],
        vocalTechniques: ['ad-libs', 'melodic rap']
    },
    'afrobeat-groove': {
        name: 'Afrobeat',
        icon: '🥁',
        category: 'latin',
        description: '非洲節拍律動',
        stylePrompt: 'Afrobeat, polyrhythmic drums, horn section, call and response, infectious groove, African influence, 110 BPM, [MIX: DRUMS PUNCHY AND UPFRONT; NATURAL DYNAMIC RANGE]',
        suggestedGenre: 'afrobeat',
        suggestedMood: 'energetic',
        suggestedVocal: 'powerful',
        suggestedTempo: 'medium',
        instruments: ['percussion', 'brass section', 'drums', 'bass guitar'],
        vocalTechniques: ['call and response', 'ad-libs']
    },
    // 氛圍/實驗
    'ambient-space': {
        name: '太空氛圍',
        icon: '🌠',
        category: 'ambient',
        description: '漂浮在星際的氛圍',
        stylePrompt: 'Space Ambient, ethereal pads, distant reverb, cosmic textures, floating atmosphere, meditative, 60 BPM, [MIX: AMBIENT REVERB TAILS; AIRY TOP END]',
        suggestedGenre: 'ambient',
        suggestedMood: 'peaceful',
        suggestedVocal: 'whisper',
        suggestedTempo: 'slow',
        instruments: ['synth pads', 'theremin', 'drone'],
        vocalTechniques: ['airy textures', 'ghostly echoes']
    },
    'dark-ambient-horror': {
        name: '暗黑氛圍',
        icon: '👻',
        category: 'ambient',
        description: '恐怖電影般的陰暗',
        stylePrompt: 'Dark Ambient, ominous drones, haunting textures, tension building, cinematic horror, unsettling atmosphere, 70 BPM, [MIX: DARK ATMOSPHERIC; LOW-END HEAVY]',
        suggestedGenre: 'dark-ambient',
        suggestedMood: 'melancholic',
        suggestedVocal: 'whisper',
        suggestedTempo: 'slow',
        instruments: ['synth pads', 'strings ensemble', 'noise'],
        vocalTechniques: ['emotive whispers', 'hushed tones']
    }
};

// Style Preset 分類
const STYLE_PRESET_CATEGORIES = {
    'ballad': { name: '抒情', icon: '💕' },
    'pop': { name: '流行', icon: '🎤' },
    'electronic': { name: '電子', icon: '🎧' },
    'rnb': { name: 'R&B', icon: '🌙' },
    'rock': { name: '搖滾', icon: '🎸' },
    'folk': { name: '民謠', icon: '🍂' },
    'hiphop': { name: '嘻哈', icon: '🔥' },
    'kpop': { name: 'K-Pop', icon: '💜' },
    'jazz': { name: '爵士', icon: '🎷' },
    'latin': { name: '世界', icon: '🌍' },
    'ambient': { name: '氛圍', icon: '🌌' },
    'cinematic': { name: '電影', icon: '🎬' }
};

// 套用 Style Preset
function applyStylePreset(presetId) {
    const preset = STYLE_PRESETS[presetId];
    if (!preset) return;

    // 套用 Style Prompt
    if (elements.stylePrompt) {
        elements.stylePrompt.value = preset.stylePrompt;
        currentStylePrompt = preset.stylePrompt;
    }

    // 套用建議的風格選項
    if (preset.suggestedGenre && elements.songGenre) {
        elements.songGenre.value = preset.suggestedGenre;
    }
    if (preset.suggestedMood && elements.songMood) {
        elements.songMood.value = preset.suggestedMood;
    }
    if (preset.suggestedVocal && elements.vocalStyle) {
        elements.vocalStyle.value = preset.suggestedVocal;
    }
    if (preset.suggestedTempo && elements.tempo) {
        elements.tempo.value = preset.suggestedTempo;
    }

    // 重置所有樂器標籤
    document.querySelectorAll('.instrument-tag').forEach(tag => {
        tag.classList.remove('active');
    });

    // 套用建議的樂器
    if (preset.instruments) {
        preset.instruments.forEach(inst => {
            const tag = document.querySelector(`.instrument-tag[data-style="${inst}"]`);
            if (tag) tag.classList.add('active');
        });
    }

    // 重置所有人聲技巧標籤
    document.querySelectorAll('.vocal-tech-tag').forEach(tag => {
        tag.classList.remove('active');
    });

    // 套用建議的人聲技巧
    if (preset.vocalTechniques) {
        preset.vocalTechniques.forEach(tech => {
            const tag = document.querySelector(`.vocal-tech-tag[data-style="${tech}"]`);
            if (tag) tag.classList.add('active');
        });
    }

    // 顯示成功動畫
    showPresetAppliedAnimation(preset.name);
    showToast(`已套用「${preset.name}」風格模板`, 'success');
}

// 顯示套用成功動畫
function showPresetAppliedAnimation(presetName) {
    // 創建成功動畫元素
    const animation = document.createElement('div');
    animation.className = 'preset-applied-animation';
    animation.innerHTML = `<span class="preset-check">✓</span><span>${presetName}</span>`;
    document.body.appendChild(animation);

    // 2秒後移除
    setTimeout(() => {
        animation.classList.add('fade-out');
        setTimeout(() => animation.remove(), 300);
    }, 1500);
}

// 渲染 Style Preset 選擇器
function renderStylePresets() {
    const container = document.getElementById('style-presets-container');
    if (!container) return;

    // 按分類組織 presets
    const byCategory = {};
    Object.entries(STYLE_PRESETS).forEach(([id, preset]) => {
        if (!byCategory[preset.category]) {
            byCategory[preset.category] = [];
        }
        byCategory[preset.category].push({ id, ...preset });
    });

    // 生成分類標籤
    const categories = Object.entries(STYLE_PRESET_CATEGORIES);
    const categoryTabs = categories.map(([catId, cat]) =>
        `<button type="button" class="preset-category-tab" data-category="${catId}">
            <span class="cat-icon">${cat.icon}</span>
            <span class="cat-name">${cat.name}</span>
        </button>`
    ).join('');

    // 生成所有 preset 卡片
    const allPresets = Object.entries(STYLE_PRESETS).map(([id, preset]) =>
        `<button type="button" class="style-preset-card" data-preset="${id}" data-category="${preset.category}">
            <span class="preset-icon">${preset.icon}</span>
            <span class="preset-name">${preset.name}</span>
            <span class="preset-desc">${preset.description}</span>
        </button>`
    ).join('');

    container.innerHTML = `
        <div class="preset-categories">
            <button type="button" class="preset-category-tab active" data-category="all">
                <span class="cat-icon">✨</span>
                <span class="cat-name">全部</span>
            </button>
            ${categoryTabs}
        </div>
        <div class="preset-grid">
            ${allPresets}
        </div>
    `;

    // 綁定分類標籤事件
    container.querySelectorAll('.preset-category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // 更新 active 狀態
            container.querySelectorAll('.preset-category-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // 過濾顯示的 presets
            const category = tab.dataset.category;
            container.querySelectorAll('.style-preset-card').forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 綁定 preset 卡片事件
    container.querySelectorAll('.style-preset-card').forEach(card => {
        card.addEventListener('click', () => {
            applyStylePreset(card.dataset.preset);
            // 高亮選中的卡片
            container.querySelectorAll('.style-preset-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });
}

// ===== 智能風格建議系統 =====
const GENRE_SUGGESTIONS = {
    'pop': {
        moods: ['happy', 'energetic', 'romantic'],
        vocals: ['female', 'male', 'duet'],
        tempos: ['medium', 'fast'],
        instruments: ['synth', 'drums', 'bass guitar', 'piano']
    },
    'rock': {
        moods: ['energetic', 'angry', 'hopeful'],
        vocals: ['male', 'powerful'],
        tempos: ['medium', 'fast'],
        instruments: ['electric guitar', 'bass guitar', 'drums']
    },
    'ballad': {
        moods: ['sad', 'romantic', 'melancholic', 'nostalgic'],
        vocals: ['soft', 'female', 'male'],
        tempos: ['slow'],
        instruments: ['piano', 'strings ensemble', 'acoustic guitar']
    },
    'hip-hop': {
        moods: ['energetic', 'angry'],
        vocals: ['rap', 'male'],
        tempos: ['medium', 'fast', 'very-fast'],
        instruments: ['808 drums', 'hi-hat', 'synth']
    },
    'electronic': {
        moods: ['energetic', 'dreamy', 'peaceful'],
        vocals: ['female', 'whisper'],
        tempos: ['fast', 'very-fast'],
        instruments: ['synth', 'synth pads', 'synth lead', 'drum machine']
    },
    'r&b': {
        moods: ['romantic', 'melancholic', 'peaceful'],
        vocals: ['soft', 'female', 'male'],
        tempos: ['slow', 'medium'],
        instruments: ['electric piano', 'bass guitar', 'drums']
    },
    'jazz': {
        moods: ['peaceful', 'romantic', 'nostalgic'],
        vocals: ['soft', 'female'],
        tempos: ['slow', 'medium'],
        instruments: ['piano', 'bass guitar', 'drums', 'saxophone']
    },
    'folk': {
        moods: ['peaceful', 'nostalgic', 'hopeful'],
        vocals: ['soft', 'male', 'female'],
        tempos: ['slow', 'medium'],
        instruments: ['acoustic guitar', 'harmonica', 'violin']
    },
    'lo-fi': {
        moods: ['peaceful', 'dreamy', 'melancholic'],
        vocals: ['whisper', 'soft'],
        tempos: ['slow'],
        instruments: ['piano', 'drums']
    },
    'k-pop': {
        moods: ['energetic', 'happy', 'romantic'],
        vocals: ['powerful', 'female', 'male', 'duet'],
        tempos: ['fast', 'medium'],
        instruments: ['synth', 'drums', 'synth lead']
    }
};

// 顯示智能建議
function showSmartSuggestions(genre) {
    const suggestions = GENRE_SUGGESTIONS[genre];
    if (!suggestions) return;

    // 高亮建議的選項
    highlightSuggestedOptions('song-mood', suggestions.moods);
    highlightSuggestedOptions('vocal-style', suggestions.vocals);
    highlightSuggestedOptions('tempo', suggestions.tempos);

    // 高亮建議的樂器
    document.querySelectorAll('.instrument-tag').forEach(tag => {
        if (suggestions.instruments.includes(tag.dataset.style)) {
            tag.classList.add('suggested');
        } else {
            tag.classList.remove('suggested');
        }
    });
}

// 高亮建議的下拉選項
function highlightSuggestedOptions(selectId, suggestedValues) {
    const select = document.getElementById(selectId);
    if (!select) return;

    // 在選項旁邊添加建議標記
    Array.from(select.options).forEach(option => {
        // 移除舊的建議標記
        option.text = option.text.replace(' ⭐', '');
        if (suggestedValues.includes(option.value)) {
            option.text += ' ⭐';
        }
    });
}

// ===== 快速開始引導精靈 =====
function showQuickStartWizard() {
    const modal = document.createElement('div');
    modal.id = 'quick-start-modal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content wizard-content">
            <div class="modal-header">
                <h3>✨ 快速開始</h3>
                <button class="modal-close" onclick="closeQuickStartWizard()">&times;</button>
            </div>
            <div class="modal-body wizard-body">
                <div class="wizard-step active" data-step="1">
                    <h4>1. 你想創作什麼類型的歌？</h4>
                    <div class="wizard-options genre-options">
                        <button class="wizard-option" data-value="ballad" data-field="genre">
                            <span class="option-icon">💕</span>
                            <span class="option-text">抒情歌</span>
                        </button>
                        <button class="wizard-option" data-value="pop" data-field="genre">
                            <span class="option-icon">🎤</span>
                            <span class="option-text">流行曲</span>
                        </button>
                        <button class="wizard-option" data-value="electronic" data-field="genre">
                            <span class="option-icon">🎧</span>
                            <span class="option-text">電子音樂</span>
                        </button>
                        <button class="wizard-option" data-value="hip-hop" data-field="genre">
                            <span class="option-icon">🔥</span>
                            <span class="option-text">嘻哈饒舌</span>
                        </button>
                        <button class="wizard-option" data-value="rock" data-field="genre">
                            <span class="option-icon">🎸</span>
                            <span class="option-text">搖滾</span>
                        </button>
                        <button class="wizard-option" data-value="r&b" data-field="genre">
                            <span class="option-icon">🌙</span>
                            <span class="option-text">R&B</span>
                        </button>
                    </div>
                </div>
                <div class="wizard-step" data-step="2">
                    <h4>2. 歌曲的情緒氛圍？</h4>
                    <div class="wizard-options mood-options">
                        <button class="wizard-option" data-value="happy" data-field="mood">
                            <span class="option-icon">😊</span>
                            <span class="option-text">開心快樂</span>
                        </button>
                        <button class="wizard-option" data-value="sad" data-field="mood">
                            <span class="option-icon">😢</span>
                            <span class="option-text">傷心難過</span>
                        </button>
                        <button class="wizard-option" data-value="romantic" data-field="mood">
                            <span class="option-icon">💕</span>
                            <span class="option-text">浪漫甜蜜</span>
                        </button>
                        <button class="wizard-option" data-value="energetic" data-field="mood">
                            <span class="option-icon">⚡</span>
                            <span class="option-text">充滿活力</span>
                        </button>
                        <button class="wizard-option" data-value="peaceful" data-field="mood">
                            <span class="option-icon">🌿</span>
                            <span class="option-text">平靜放鬆</span>
                        </button>
                        <button class="wizard-option" data-value="nostalgic" data-field="mood">
                            <span class="option-icon">📷</span>
                            <span class="option-text">懷舊感傷</span>
                        </button>
                    </div>
                </div>
                <div class="wizard-step" data-step="3">
                    <h4>3. 輸入歌曲主題</h4>
                    <div class="wizard-input-section">
                        <input type="text" id="wizard-theme" class="wizard-input" placeholder="例如：夏天的海邊約會、失戀後的成長...">
                        <div class="wizard-theme-suggestions">
                            <span class="suggestion-label">靈感提示：</span>
                            <button class="theme-suggestion" data-theme="初戀的回憶">初戀的回憶</button>
                            <button class="theme-suggestion" data-theme="追夢的旅程">追夢的旅程</button>
                            <button class="theme-suggestion" data-theme="深夜的孤獨">深夜的孤獨</button>
                            <button class="theme-suggestion" data-theme="夏日派對">夏日派對</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="wizard-footer">
                <div class="wizard-progress">
                    <span class="progress-dot active" data-step="1"></span>
                    <span class="progress-dot" data-step="2"></span>
                    <span class="progress-dot" data-step="3"></span>
                </div>
                <div class="wizard-buttons">
                    <button class="btn-secondary wizard-prev" style="display:none">上一步</button>
                    <button class="btn-primary wizard-next">下一步</button>
                    <button class="btn-primary wizard-finish" style="display:none">開始創作 ✨</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // 初始化引導精靈
    initQuickStartWizard();
}

// 快速開始引導精靈狀態
let wizardState = {
    step: 1,
    genre: '',
    mood: '',
    theme: ''
};

// 初始化引導精靈
function initQuickStartWizard() {
    const modal = document.getElementById('quick-start-modal');
    if (!modal) return;

    // 選項點擊
    modal.querySelectorAll('.wizard-option').forEach(option => {
        option.addEventListener('click', () => {
            const field = option.dataset.field;
            const value = option.dataset.value;

            // 更新狀態
            wizardState[field] = value;

            // 更新 UI
            option.closest('.wizard-options').querySelectorAll('.wizard-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');

            // 如果不是最後一步，自動進入下一步
            if (wizardState.step < 3) {
                setTimeout(() => nextWizardStep(), 300);
            }
        });
    });

    // 主題建議點擊
    modal.querySelectorAll('.theme-suggestion').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('wizard-theme').value = btn.dataset.theme;
            wizardState.theme = btn.dataset.theme;
        });
    });

    // 主題輸入
    const themeInput = document.getElementById('wizard-theme');
    if (themeInput) {
        themeInput.addEventListener('input', (e) => {
            wizardState.theme = e.target.value;
        });
    }

    // 按鈕事件
    modal.querySelector('.wizard-prev')?.addEventListener('click', prevWizardStep);
    modal.querySelector('.wizard-next')?.addEventListener('click', nextWizardStep);
    modal.querySelector('.wizard-finish')?.addEventListener('click', finishWizard);

    // 關閉按鈕
    modal.querySelector('.modal-close')?.addEventListener('click', closeQuickStartWizard);

    // 點擊背景關閉
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeQuickStartWizard();
    });
}

// 下一步
function nextWizardStep() {
    if (wizardState.step >= 3) return;
    wizardState.step++;
    updateWizardUI();
}

// 上一步
function prevWizardStep() {
    if (wizardState.step <= 1) return;
    wizardState.step--;
    updateWizardUI();
}

// 更新引導精靈 UI
function updateWizardUI() {
    const modal = document.getElementById('quick-start-modal');
    if (!modal) return;

    // 更新步驟顯示
    modal.querySelectorAll('.wizard-step').forEach(step => {
        step.classList.toggle('active', parseInt(step.dataset.step) === wizardState.step);
    });

    // 更新進度點
    modal.querySelectorAll('.progress-dot').forEach(dot => {
        dot.classList.toggle('active', parseInt(dot.dataset.step) <= wizardState.step);
    });

    // 更新按鈕
    const prevBtn = modal.querySelector('.wizard-prev');
    const nextBtn = modal.querySelector('.wizard-next');
    const finishBtn = modal.querySelector('.wizard-finish');

    if (prevBtn) prevBtn.style.display = wizardState.step > 1 ? '' : 'none';
    if (nextBtn) nextBtn.style.display = wizardState.step < 3 ? '' : 'none';
    if (finishBtn) finishBtn.style.display = wizardState.step === 3 ? '' : 'none';
}

// 完成引導精靈
function finishWizard() {
    // 套用設定到主介面
    if (wizardState.genre && elements.songGenre) {
        elements.songGenre.value = wizardState.genre;
        showSmartSuggestions(wizardState.genre);
    }
    if (wizardState.mood && elements.songMood) {
        elements.songMood.value = wizardState.mood;
    }
    if (wizardState.theme && elements.songTheme) {
        elements.songTheme.value = wizardState.theme;
    }

    // 根據選擇推薦一個 Style Preset
    const recommendedPreset = getRecommendedPreset(wizardState.genre, wizardState.mood);
    if (recommendedPreset) {
        applyStylePreset(recommendedPreset);
    }

    // 關閉引導精靈
    closeQuickStartWizard();

    // 顯示成功提示
    showToast('設定完成！可以開始生成歌詞了', 'success');
}

// 根據選擇推薦 Preset
function getRecommendedPreset(genre, mood) {
    const presetMap = {
        'ballad-romantic': 'romantic-ballad',
        'ballad-sad': 'emotional-piano',
        'ballad-melancholic': 'emotional-piano',
        'pop-energetic': 'energetic-pop',
        'pop-happy': 'energetic-pop',
        'pop-peaceful': 'chill-pop',
        'pop-nostalgic': 'retro-80s',
        'electronic-energetic': 'edm-drop',
        'electronic-peaceful': 'lo-fi-chill',
        'r&b-romantic': 'smooth-rnb',
        'r&b-peaceful': 'smooth-rnb',
        'hip-hop-energetic': 'trap-beat',
        'hip-hop-nostalgic': 'boom-bap',
        'rock-energetic': 'indie-rock',
        'folk-nostalgic': 'acoustic-folk',
        'folk-peaceful': 'acoustic-folk'
    };

    const key = `${genre}-${mood}`;
    return presetMap[key] || null;
}

// 關閉引導精靈
function closeQuickStartWizard() {
    const modal = document.getElementById('quick-start-modal');
    if (modal) {
        modal.remove();
    }
    // 重置狀態
    wizardState = { step: 1, genre: '', mood: '', theme: '' };
}

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

// ===== 版本歷史搜尋篩選系統 =====
let historySearchQuery = '';
let historyFilterGenre = '';
let historySortOrder = 'newest';

// 篩選版本歷史
function filterVersionHistory() {
    let filtered = [...versionHistory];

    // 搜尋篩選（主題、歌詞、Style Prompt）
    if (historySearchQuery.trim()) {
        const query = historySearchQuery.toLowerCase().trim();
        filtered = filtered.filter(v => {
            const theme = (v.theme || '').toLowerCase();
            const lyrics = (v.lyrics || '').toLowerCase();
            const style = (v.stylePrompt || '').toLowerCase();
            return theme.includes(query) || lyrics.includes(query) || style.includes(query);
        });
    }

    // 風格篩選
    if (historyFilterGenre) {
        filtered = filtered.filter(v => v.genre === historyFilterGenre);
    }

    // 排序
    switch (historySortOrder) {
        case 'oldest':
            filtered.sort((a, b) => a.id - b.id);
            break;
        case 'iterations':
            filtered.sort((a, b) => (b.iteration || 0) - (a.iteration || 0));
            break;
        case 'newest':
        default:
            filtered.sort((a, b) => b.id - a.id);
            break;
    }

    return filtered;
}

// 更新風格篩選選項
function updateHistoryGenreFilter() {
    const filterEl = document.getElementById('history-filter-genre');
    if (!filterEl) return;

    // 收集所有使用過的風格
    const genres = new Set();
    versionHistory.forEach(v => {
        if (v.genre) genres.add(v.genre);
    });

    // 保留當前選擇
    const currentValue = filterEl.value;

    // 重建選項
    let html = '<option value="">所有風格</option>';
    [...genres].sort().forEach(genre => {
        const selected = genre === currentValue ? 'selected' : '';
        const displayName = genre.replace(/-/g, ' ');
        html += `<option value="${genre}" ${selected}>${displayName}</option>`;
    });

    filterEl.innerHTML = html;
}

// 高亮搜尋匹配文字
function highlightMatch(text, query) {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// 更新版本歷史 UI
function updateVersionHistoryUI() {
    const listEl = document.getElementById('version-list');
    const countEl = document.getElementById('version-count');
    const resultCountEl = document.getElementById('history-result-count');

    if (countEl) {
        countEl.textContent = versionHistory.length;
    }

    // 更新風格篩選選項
    updateHistoryGenreFilter();

    if (!listEl) return;

    if (versionHistory.length === 0) {
        listEl.innerHTML = '<div class="version-empty">尚無版本記錄</div>';
        if (resultCountEl) resultCountEl.textContent = '';
        return;
    }

    // 應用篩選和排序
    const filteredVersions = filterVersionHistory();

    // 更新結果計數
    if (resultCountEl) {
        const isFiltered = historySearchQuery || historyFilterGenre;
        resultCountEl.textContent = isFiltered
            ? `${filteredVersions.length} / ${versionHistory.length} 筆`
            : `共 ${versionHistory.length} 筆`;
    }

    // 無結果提示
    if (filteredVersions.length === 0) {
        listEl.innerHTML = `
            <div class="version-empty">
                <span class="empty-icon">🔍</span>
                <p>找不到符合條件的版本</p>
                <button type="button" class="btn-clear-filter" onclick="clearHistoryFilters()">清除篩選</button>
            </div>`;
        return;
    }

    listEl.innerHTML = filteredVersions.map(v => {
        // 如果有搜尋，高亮顯示匹配內容
        const themeDisplay = v.theme
            ? highlightMatch(v.theme.slice(0, 20) + (v.theme.length > 20 ? '...' : ''), historySearchQuery)
            : '';
        const lyricsPreview = highlightMatch((v.lyrics || '').slice(0, 50) + '...', historySearchQuery);

        return `
        <div class="version-item" data-id="${v.id}">
            <div class="version-info">
                <div class="version-time">${formatTimestamp(v.timestamp)}</div>
                <div class="version-meta">
                    ${themeDisplay ? `<span class="version-theme">${themeDisplay}</span>` : ''}
                    ${v.genre ? `<span class="version-genre">${v.genre.replace(/-/g, ' ')}</span>` : ''}
                    ${v.iteration > 0 ? `<span class="version-iteration">第 ${v.iteration} 次迭代</span>` : '<span class="version-iteration">初始版本</span>'}
                </div>
                <div class="version-preview">${lyricsPreview}</div>
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
    `}).join('');
}

// 清除所有篩選
function clearHistoryFilters() {
    historySearchQuery = '';
    historyFilterGenre = '';
    historySortOrder = 'newest';

    const searchInput = document.getElementById('history-search');
    const genreFilter = document.getElementById('history-filter-genre');
    const sortFilter = document.getElementById('history-filter-sort');
    const clearBtn = document.getElementById('history-search-clear');

    if (searchInput) searchInput.value = '';
    if (genreFilter) genreFilter.value = '';
    if (sortFilter) sortFilter.value = 'newest';
    if (clearBtn) clearBtn.classList.add('hidden');

    updateVersionHistoryUI();
}

// 初始化版本歷史搜尋篩選
function initHistorySearch() {
    const searchInput = document.getElementById('history-search');
    const clearBtn = document.getElementById('history-search-clear');
    const genreFilter = document.getElementById('history-filter-genre');
    const sortFilter = document.getElementById('history-filter-sort');

    // 搜尋輸入（防抖）
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                historySearchQuery = e.target.value;
                updateVersionHistoryUI();

                // 顯示/隱藏清除按鈕
                if (clearBtn) {
                    clearBtn.classList.toggle('hidden', !e.target.value);
                }
            }, 200);
        });
    }

    // 清除按鈕
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            historySearchQuery = '';
            clearBtn.classList.add('hidden');
            updateVersionHistoryUI();
        });
    }

    // 風格篩選
    if (genreFilter) {
        genreFilter.addEventListener('change', (e) => {
            historyFilterGenre = e.target.value;
            updateVersionHistoryUI();
        });
    }

    // 排序篩選
    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            historySortOrder = e.target.value;
            updateVersionHistoryUI();
        });
    }
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
    songBpm: document.getElementById('song-bpm'),
    bpmAutoBtn: document.getElementById('bpm-auto-btn'),
    bpmSuggestion: document.getElementById('bpm-suggestion'),
    songMood: document.getElementById('song-mood'),
    songLanguage: document.getElementById('song-language'),
    structureCheckboxes: document.querySelectorAll('input[name="structure"]'),
    extraInstructions: document.getElementById('extra-instructions'),
    generateBtn: document.getElementById('generate-btn'),
    outputArea: document.getElementById('output-area'),
    copyBtn: document.getElementById('copy-btn'),
    copySunoBtn: document.getElementById('copy-suno-btn'),
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

    // Mix Config
    mixTags: document.querySelectorAll('.mix-tag'),

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
    modalClose: document.querySelector('.modal-close'),

    // Shortcuts
    shortcutsBtn: document.getElementById('shortcuts-btn')
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

    // 初始化 Style Preset 選擇器
    renderStylePresets();

    // 更新編輯器計數
    updateEditorCounts();

    // 更新版本歷史 UI
    updateVersionHistoryUI();

    // 檢查後端狀態
    if (savedApiMode === 'backend') {
        checkBackendStatus();
    }

    // 初始化歌曲實驗室
    initSongLab();

    // 初始化 Ad-Libs 即興口白
    initAdLibs();

    // 初始化歌詞分析
    initLyricsAnalysis();

    // 初始化智能主題分析
    initSmartAnalyze();

    // 檢查是否首次使用，顯示引導精靈
    const hasUsedBefore = localStorage.getItem('suno-has-used');
    if (!hasUsedBefore) {
        // 延遲顯示引導精靈，讓頁面先載入完成
        setTimeout(() => {
            showQuickStartWizard();
            localStorage.setItem('suno-has-used', 'true');
        }, 500);
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

    // 複製到 Suno 按鈕
    if (elements.copySunoBtn) {
        elements.copySunoBtn.addEventListener('click', copyToSunoFormat);
    }

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

    // 快捷鍵按鈕
    if (elements.shortcutsBtn) {
        elements.shortcutsBtn.addEventListener('click', showKeyboardShortcutsHelp);
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

    // 初始化版本歷史搜尋篩選
    initHistorySearch();

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

    // Mix 混音標籤（可多選）
    elements.mixTags.forEach(btn => {
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

    // Vocal Techniques 展開/收合
    const vocalTechExpandBtn = document.getElementById('btn-expand-vocal-tech');
    const vocalTechAdvanced = document.getElementById('vocal-tech-advanced');
    if (vocalTechExpandBtn && vocalTechAdvanced) {
        vocalTechExpandBtn.addEventListener('click', () => {
            const isCollapsed = vocalTechAdvanced.classList.contains('collapsed');
            vocalTechAdvanced.classList.toggle('collapsed');
            vocalTechExpandBtn.classList.toggle('expanded');
            vocalTechExpandBtn.innerHTML = isCollapsed
                ? '<span class="expand-icon">▲</span> 收起進階技巧'
                : '<span class="expand-icon">▼</span> 顯示更多技巧';
        });
    }

    // Instrument 展開/收合
    const instrumentExpandBtn = document.getElementById('btn-expand-instrument');
    const instrumentAdvanced = document.getElementById('instrument-advanced');
    if (instrumentExpandBtn && instrumentAdvanced) {
        instrumentExpandBtn.addEventListener('click', () => {
            const isCollapsed = instrumentAdvanced.classList.contains('collapsed');
            instrumentAdvanced.classList.toggle('collapsed');
            instrumentExpandBtn.classList.toggle('expanded');
            instrumentExpandBtn.innerHTML = isCollapsed
                ? '<span class="expand-icon">▲</span> 收起進階樂器'
                : '<span class="expand-icon">▼</span> 顯示更多樂器';
        });
    }

    // 演奏技巧標籤（可多選）
    const playingTechTags = document.querySelectorAll('.playing-tech-tag');
    playingTechTags.forEach(btn => {
        btn.addEventListener('click', () => toggleStyleTag(btn));
    });

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

    // 風格選擇時顯示智能建議和 BPM 建議
    if (elements.songGenre) {
        elements.songGenre.addEventListener('change', (e) => {
            showSmartSuggestions(e.target.value);
            updateBPMSuggestion(e.target.value);
            // 如果 BPM 為空，自動填入建議值
            if (elements.songBpm && !elements.songBpm.value) {
                const bpm = getSuggestedBPM(e.target.value);
                if (bpm) elements.songBpm.value = bpm;
            }
        });
    }

    // BPM 自動設定按鈕
    if (elements.bpmAutoBtn) {
        elements.bpmAutoBtn.addEventListener('click', autoSetBPM);
    }

    // Smart Mix 智能推薦按鈕
    const smartMixBtn = document.getElementById('smart-mix-btn');
    if (smartMixBtn) {
        smartMixBtn.addEventListener('click', () => {
            const genre = elements.songGenre.value;
            if (genre) {
                applySmartMix(genre);
            } else {
                showToast('請先選擇音樂風格', 'warning');
            }
        });
    }

    // 快速開始按鈕
    const quickStartBtn = document.getElementById('quick-start-btn');
    if (quickStartBtn) {
        quickStartBtn.addEventListener('click', showQuickStartWizard);
    }
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

// ===== Lyrics Analysis (歌詞分析) =====
function initLyricsAnalysis() {
    const analyzeBtn = document.getElementById('analyze-btn');
    const closeBtn = document.getElementById('close-analysis');
    const analysisPanel = document.getElementById('lyrics-analysis');

    analyzeBtn?.addEventListener('click', analyzeLyrics);
    closeBtn?.addEventListener('click', () => {
        analysisPanel?.classList.add('hidden');
    });
}

function analyzeLyrics() {
    const lyrics = elements.outputArea.dataset.rawLyrics || elements.outputArea.textContent;
    if (!lyrics || lyrics.includes('生成的歌詞會顯示在這裡')) {
        showToast('請先生成歌詞', 'warning');
        return;
    }

    // 基本統計
    const lines = lyrics.split('\n').filter(l => l.trim());
    const chars = lyrics.replace(/\s/g, '').length;

    // 段落分析 - 尋找 [標籤]
    const sectionMatches = lyrics.match(/\[([^\]]+)\]/g) || [];
    const sections = sectionMatches.length;

    // 結構分析
    const structureMap = {};
    sectionMatches.forEach(tag => {
        const key = tag.toLowerCase();
        structureMap[key] = (structureMap[key] || 0) + 1;
    });

    const structureStr = Object.entries(structureMap)
        .map(([tag, count]) => `${tag}×${count}`)
        .join(' → ') || '未檢測到標準結構標籤';

    // 押韻密度估算 (簡單版: 檢查行尾相似度)
    let rhymeCount = 0;
    const cleanLines = lines.filter(l => !l.startsWith('[') && l.trim().length > 2);
    for (let i = 0; i < cleanLines.length - 1; i++) {
        const line1 = cleanLines[i].trim();
        const line2 = cleanLines[i + 1].trim();
        if (line1.length > 0 && line2.length > 0) {
            if (checkPinyinRhyme(line1, line2)) {
                rhymeCount++;
            }
        }
    }
    const rhymeDensity = cleanLines.length > 1
        ? Math.round((rhymeCount / (cleanLines.length - 1)) * 100)
        : 0;

    // 建議生成
    const suggestions = [];
    if (sections < 3) suggestions.push('建議增加段落結構標籤');
    if (rhymeDensity < 30) suggestions.push('押韻密度較低，可考慮加強押韻');
    if (chars < 200) suggestions.push('歌詞較短，可擴展內容');
    if (chars > 800) suggestions.push('歌詞較長，注意控制時長');
    if (!structureMap['[chorus]'] && !structureMap['[hook]']) {
        suggestions.push('未檢測到副歌/Hook，建議加入記憶點');
    }

    // 更新 UI
    document.getElementById('analysis-chars').textContent = chars;
    document.getElementById('analysis-lines').textContent = lines.length;
    document.getElementById('analysis-sections').textContent = sections;
    document.getElementById('analysis-rhyme').textContent = rhymeDensity + '%';
    document.getElementById('analysis-structure').textContent = structureStr;
    document.getElementById('analysis-suggestion').textContent =
        suggestions.length > 0 ? suggestions.join('；') : '結構良好！';

    document.getElementById('lyrics-analysis')?.classList.remove('hidden');
}

// 簡化的押韻檢測
function checkPinyinRhyme(line1, line2) {
    const end1 = line1.slice(-3).toLowerCase();
    const end2 = line2.slice(-3).toLowerCase();

    // 英文押韻 - 檢查結尾母音
    const vowelPattern = /[aeiou]+[^aeiou]*$/i;
    const match1 = end1.match(vowelPattern);
    const match2 = end2.match(vowelPattern);

    if (match1 && match2 && match1[0] === match2[0]) {
        return true;
    }

    // 字符相似度
    let similar = 0;
    for (let i = 0; i < Math.min(end1.length, end2.length); i++) {
        if (end1[end1.length - 1 - i] === end2[end2.length - 1 - i]) {
            similar++;
        }
    }

    return similar >= 2;
}

// ===== Ad-Libs (即興口白) =====
const ADLIBS_PRESETS = {
    'pop': ['WHOA-OH!', 'HEY!', 'COME ON!', 'TONIGHT!', 'YEAH!', 'OH-OH!', 'BABY!'],
    'hiphop': ['UH!', 'YEAH!', 'LETS GO!', 'SKRRT!', 'WHAT!', 'AYY!', 'GANG!'],
    'trap': ['YEAH', 'UH', 'WHAT', 'LETS RIDE', 'DRIP', 'ICY', 'BRR'],
    'rnb': ['YEAH', 'OOH', 'BABY', 'COME ON', 'MMM', 'GIRL', 'OH'],
    'rock': ['YEAH!', 'COME ON!', 'ALRIGHT!', 'WHOO!', 'HEY!', 'OH YEAH!'],
    'edm': ['DROP!', 'HANDS UP!', 'JUMP!', 'ONE MORE TIME!', 'LETS GO!', 'EVERYBODY!'],
    'gospel': ['OH LORD!', 'HALLELUJAH!', 'YES!', 'AMEN!', 'PRAISE!', 'GLORY!'],
    'jazz': ['YEAH', 'OOH', 'SCOOBY DOO', 'BA DA', 'SHOO BE DOO'],
    'country': ['YEE-HAW!', 'COME ON!', 'ALRIGHT!', 'HEY Y ALL!'],
    'reggae': ['YEAH MON!', 'ONE LOVE!', 'JAH!', 'IRIE!']
};

function initAdLibs() {
    const adlibsInput = document.getElementById('adlibs-input');
    const adlibsClear = document.getElementById('adlibs-clear');
    const adlibsRandom = document.getElementById('adlibs-random-btn');
    const presetBtns = document.querySelectorAll('.adlibs-preset');

    if (!adlibsInput) return;

    // 預設按鈕點擊
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const adlibs = JSON.parse(btn.dataset.adlibs);
            adlibsInput.value = adlibs.map(a => `"${a}"`).join(', ');

            // 更新 active 狀態
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            showToast('已套用 ' + btn.textContent.trim() + ' 即興口白', 'success');
        });
    });

    // 清空按鈕
    adlibsClear?.addEventListener('click', () => {
        adlibsInput.value = '';
        presetBtns.forEach(b => b.classList.remove('active'));
    });

    // 隨機生成
    adlibsRandom?.addEventListener('click', () => {
        const genre = elements.songGenre?.value || 'pop';
        const genreKey = Object.keys(ADLIBS_PRESETS).find(key =>
            genre.toLowerCase().includes(key)
        ) || 'pop';

        const presets = ADLIBS_PRESETS[genreKey];
        // 隨機選 3-5 個
        const count = Math.floor(Math.random() * 3) + 3;
        const shuffled = [...presets].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, count);

        adlibsInput.value = selected.map(a => `"${a}"`).join(', ');
        showToast('已根據風格隨機生成即興口白', 'success');
    });
}

function getAdLibsValue() {
    const input = document.getElementById('adlibs-input');
    return input?.value || '';
}

// ===== Pro Tips (專業小技巧) =====
const PRO_TIPS = [
    '前 20-30 個詞最重要，關鍵標籤請放在最前面',
    '每個部分使用 1-3 個描述詞，避免過載',
    '最多使用 2-3 種樂器，保持聲音清晰',
    '"西班牙尼龍吉他琶音" 優於 "吉他"，越具體越好',
    '複雜曲目至少需預算 3-10 次生成才能成功',
    '使用 [MIX: ...] 標籤是製作魔法發生的地方',
    'BPM 指導一切，務必在曲風行中包含 BPM',
    '為主歌/副歌/橋段定義不同的氛圍和能量',
    '定義人聲的即興詞 (Ad-libs) 增加真實感',
    '聲音混濁？將效果減少到最多 3-4 個',
    '使用 [TRANSITION] 標籤創造平滑的風格轉換',
    '簡單請求成功率 70-90%，複雜效果 30-60%',
    '標籤可能需要 2-3 次生成才能穩定生效',
    '使用對比描述詞可創造戲劇性的風格變化'
];

let currentTipIndex = 0;

function initProTips() {
    const tipText = document.getElementById('pro-tip-text');
    const nextBtn = document.getElementById('pro-tip-next');

    if (!tipText || !nextBtn) return;

    // 隨機開始
    currentTipIndex = Math.floor(Math.random() * PRO_TIPS.length);
    tipText.textContent = PRO_TIPS[currentTipIndex];

    // 點擊下一則
    nextBtn.addEventListener('click', () => {
        currentTipIndex = (currentTipIndex + 1) % PRO_TIPS.length;
        tipText.style.opacity = '0';
        setTimeout(() => {
            tipText.textContent = PRO_TIPS[currentTipIndex];
            tipText.style.opacity = '1';
        }, 150);
    });

    // 自動輪播（每 8 秒）
    setInterval(() => {
        currentTipIndex = (currentTipIndex + 1) % PRO_TIPS.length;
        tipText.style.opacity = '0';
        setTimeout(() => {
            tipText.textContent = PRO_TIPS[currentTipIndex];
            tipText.style.opacity = '1';
        }, 150);
    }, 8000);
}

// ===== Song Lab (歌曲實驗室) =====
const labElements = {
    genre: null,
    subgenre: null,
    mood: null,
    tempo: null,
    vocal: null,
    instrument: null,
    previewContent: null,
    savedList: null
};

let labSavedCombos = JSON.parse(localStorage.getItem('lab-saved-combos') || '[]');

function initSongLab() {
    labElements.genre = document.getElementById('lab-genre');
    labElements.subgenre = document.getElementById('lab-subgenre');
    labElements.mood = document.getElementById('lab-mood');
    labElements.tempo = document.getElementById('lab-tempo');
    labElements.vocal = document.getElementById('lab-vocal');
    labElements.instrument = document.getElementById('lab-instrument');
    labElements.previewContent = document.getElementById('lab-preview-content');
    labElements.savedList = document.getElementById('lab-saved-list');

    // 綁定下拉選單變更事件
    Object.values(labElements).forEach(el => {
        if (el && el.tagName === 'SELECT') {
            el.addEventListener('change', updateLabPreview);
        }
    });

    // 綁定控制按鈕
    document.getElementById('lab-randomize')?.addEventListener('click', labRandomize);
    document.getElementById('lab-clear')?.addEventListener('click', labClear);
    document.getElementById('lab-apply')?.addEventListener('click', labApplyToAI);
    document.getElementById('lab-copy')?.addEventListener('click', labCopyPrompt);
    document.getElementById('lab-save')?.addEventListener('click', labSaveCombo);

    // 綁定單個隨機按鈕
    document.querySelectorAll('.btn-lab-random').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const select = document.getElementById(targetId);
            if (select) {
                randomizeSelect(select);
                updateLabPreview();
            }
        });
    });

    // 載入已保存的組合
    renderLabSaved();

    // 初始化專業小技巧
    initProTips();
}

function randomizeSelect(select) {
    const options = Array.from(select.options).filter(opt => opt.value !== '');
    if (options.length > 0) {
        const randomOpt = options[Math.floor(Math.random() * options.length)];
        select.value = randomOpt.value;
    }
}

function labRandomize() {
    Object.values(labElements).forEach(el => {
        if (el && el.tagName === 'SELECT') {
            randomizeSelect(el);
        }
    });
    updateLabPreview();
    showToast('已隨機混搭所有元素！', 'success');
}

function labClear() {
    Object.values(labElements).forEach(el => {
        if (el && el.tagName === 'SELECT') {
            el.value = '';
        }
    });
    updateLabPreview();
    showToast('已清空所有選擇', 'info');
}

function getLabStylePrompt() {
    const parts = [];
    const genre = labElements.genre?.value;
    const subgenre = labElements.subgenre?.value;
    const mood = labElements.mood?.value;
    const tempo = labElements.tempo?.value;
    const vocal = labElements.vocal?.value;
    const instrument = labElements.instrument?.value;

    if (genre) parts.push(genre.replace(/-/g, ' '));
    if (subgenre) parts.push(subgenre);
    if (mood) parts.push(mood);

    if (tempo) {
        const tempoMap = {
            'very-slow': '60-70 BPM',
            'slow': '70-90 BPM',
            'moderate': '90-110 BPM',
            'upbeat': '110-130 BPM',
            'fast': '130-150 BPM',
            'very-fast': '150+ BPM'
        };
        parts.push(tempoMap[tempo] || tempo);
    }

    if (vocal) parts.push(vocal + ' vocals');
    if (instrument) parts.push(instrument);

    return parts.join(', ');
}

function updateLabPreview() {
    const prompt = getLabStylePrompt();
    if (prompt) {
        labElements.previewContent.innerHTML = `<span class="lab-prompt-text">${prompt}</span>`;
    } else {
        labElements.previewContent.innerHTML = '<span class="lab-placeholder">選擇元素後，Style Prompt 將在此顯示...</span>';
    }
}

function labCopyPrompt() {
    const prompt = getLabStylePrompt();
    if (prompt) {
        copyToClipboard(prompt);
    } else {
        showToast('請先選擇一些元素', 'warning');
    }
}

function labApplyToAI() {
    const prompt = getLabStylePrompt();
    if (!prompt) {
        showToast('請先選擇一些元素', 'warning');
        return;
    }

    // 切換到 AI 生成頁面
    switchTab('ai-generate');

    // 嘗試設定對應的值
    const genre = labElements.genre?.value;
    const mood = labElements.mood?.value;
    const vocal = labElements.vocal?.value;
    const tempo = labElements.tempo?.value;

    if (genre && elements.songGenre) {
        const option = Array.from(elements.songGenre.options).find(opt =>
            opt.value === genre || opt.value.includes(genre.replace(/-/g, ''))
        );
        if (option) elements.songGenre.value = option.value;
    }

    if (mood && elements.songMood) {
        const option = Array.from(elements.songMood.options).find(opt =>
            opt.value === mood || opt.value.includes(mood)
        );
        if (option) elements.songMood.value = option.value;
    }

    if (vocal && elements.vocalStyle) {
        const option = Array.from(elements.vocalStyle.options).find(opt =>
            opt.value.toLowerCase().includes(vocal.split(' ')[0].toLowerCase())
        );
        if (option) elements.vocalStyle.value = option.value;
    }

    if (tempo && elements.songTempo) {
        const tempoMapping = {
            'very-slow': 'slow',
            'slow': 'slow',
            'moderate': 'moderate',
            'upbeat': 'upbeat',
            'fast': 'fast',
            'very-fast': 'fast'
        };
        elements.songTempo.value = tempoMapping[tempo] || tempo;
    }

    showToast('已套用到 AI 生成設定！', 'success');
}

function labSaveCombo() {
    const prompt = getLabStylePrompt();
    if (!prompt) {
        showToast('請先選擇一些元素', 'warning');
        return;
    }

    const combo = {
        id: Date.now(),
        name: prompt.substring(0, 30) + (prompt.length > 30 ? '...' : ''),
        genre: labElements.genre?.value || '',
        subgenre: labElements.subgenre?.value || '',
        mood: labElements.mood?.value || '',
        tempo: labElements.tempo?.value || '',
        vocal: labElements.vocal?.value || '',
        instrument: labElements.instrument?.value || '',
        prompt: prompt,
        createdAt: new Date().toISOString()
    };

    labSavedCombos.unshift(combo);
    if (labSavedCombos.length > 20) labSavedCombos.pop(); // 最多保存 20 個

    localStorage.setItem('lab-saved-combos', JSON.stringify(labSavedCombos));
    renderLabSaved();
    showToast('已保存到收藏！', 'success');
}

function renderLabSaved() {
    if (!labElements.savedList) return;

    if (labSavedCombos.length === 0) {
        labElements.savedList.innerHTML = '<p class="lab-empty">尚無收藏，點擊「保存」收藏喜歡的組合</p>';
        return;
    }

    labElements.savedList.innerHTML = labSavedCombos.map(combo => `
        <div class="lab-saved-item" data-id="${combo.id}">
            <span class="lab-saved-item-name" onclick="labLoadCombo(${combo.id})">${combo.name}</span>
            <div class="lab-saved-item-actions">
                <button class="lab-saved-item-btn" onclick="labDeleteCombo(${combo.id})" title="刪除">🗑️</button>
            </div>
        </div>
    `).join('');
}

function labLoadCombo(id) {
    const combo = labSavedCombos.find(c => c.id === id);
    if (!combo) return;

    if (labElements.genre) labElements.genre.value = combo.genre;
    if (labElements.subgenre) labElements.subgenre.value = combo.subgenre;
    if (labElements.mood) labElements.mood.value = combo.mood;
    if (labElements.tempo) labElements.tempo.value = combo.tempo;
    if (labElements.vocal) labElements.vocal.value = combo.vocal;
    if (labElements.instrument) labElements.instrument.value = combo.instrument;

    updateLabPreview();
    showToast('已載入收藏的組合', 'success');
}

function labDeleteCombo(id) {
    labSavedCombos = labSavedCombos.filter(c => c.id !== id);
    localStorage.setItem('lab-saved-combos', JSON.stringify(labSavedCombos));
    renderLabSaved();
    showToast('已刪除', 'info');
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

    // 收集 Mix 混音設定
    const selectedMixTags = Array.from(elements.mixTags || [])
        .filter(btn => btn.classList.contains('active'))
        .map(btn => btn.dataset.style);

    // 收集 BPM
    const bpm = elements.songBpm?.value || '';

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
        instruments: selectedInstruments,
        // Mix 混音設定
        mixSettings: selectedMixTags,
        // BPM
        bpm: bpm
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

    // 速度 - 優先使用 BPM，否則用預設範圍
    if (styleOptions.bpm) {
        stylePromptParts.push(`tempo: "${styleOptions.bpm} BPM"`);
    } else if (styleOptions.tempo) {
        stylePromptParts.push(`tempo: "${tempoMap[styleOptions.tempo]}"`);
    }

    // Mix 混音設定
    if (styleOptions.mixSettings && styleOptions.mixSettings.length > 0) {
        stylePromptParts.push(`[MIX: ${styleOptions.mixSettings.join('; ').toUpperCase()}]`);
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

    // Ad-Libs 即興口白
    const adlibsValue = getAdLibsValue();
    if (adlibsValue) {
        stylePromptParts.push(`ad-libs: (${adlibsValue})`);
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
    if (elements.copySunoBtn) elements.copySunoBtn.disabled = false;

    // 啟用分析按鈕
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) analyzeBtn.disabled = false;

    // 啟用評分按鈕
    const qualityScoreBtn = document.getElementById('quality-score-btn');
    if (qualityScoreBtn) qualityScoreBtn.disabled = false;

    // 啟用下載 TXT 按鈕
    const downloadTxtBtn = document.getElementById('download-txt-btn');
    if (downloadTxtBtn) downloadTxtBtn.disabled = false;

    // 添加成功動畫
    elements.outputArea.classList.add('success-animation');
    setTimeout(() => {
        elements.outputArea.classList.remove('success-animation');
    }, 600);

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
    elements.generateBtn.querySelector('.btn-loading').style.display = isGenerating ? 'inline-flex' : 'none';

    // 添加生成中動畫
    if (isGenerating) {
        elements.generateBtn.classList.add('generating');
        // 啟動載入階段動畫
        if (typeof window.startLoadingStageAnimation === 'function') {
            window.startLoadingStageAnimation();
        }
    } else {
        elements.generateBtn.classList.remove('generating');
        // 停止載入階段動畫
        if (typeof window.stopLoadingStageAnimation === 'function') {
            window.stopLoadingStageAnimation();
        }
    }
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

// ===== 自動生成 Style Prompt =====
function generateAutoStylePrompt() {
    const parts = [];

    // 1. 主風格 (Genre)
    const genre = elements.songGenre?.value;
    if (genre) {
        const genreName = genre.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        parts.push(genreName);
    }

    // 2. 情緒 (Mood)
    const mood = elements.songMood?.value;
    if (mood) {
        parts.push(mood);
    }

    // 3. 節奏 (Tempo)
    const tempo = elements.songTempo?.value;
    if (tempo && tempo !== 'medium') {
        const tempoMap = {
            'very-slow': 'very slow tempo',
            'slow': 'slow tempo',
            'fast': 'upbeat',
            'very-fast': 'high energy'
        };
        if (tempoMap[tempo]) parts.push(tempoMap[tempo]);
    }

    // 4. BPM
    const bpm = document.getElementById('song-bpm')?.value;
    if (bpm) {
        parts.push(`${bpm} BPM`);
    }

    // 5. 人聲風格 (Vocal Style)
    const vocalStyle = elements.vocalStyle?.value;
    if (vocalStyle) {
        parts.push(`${vocalStyle} vocals`);
    }

    // 6. 收集已選的人聲技巧標籤
    const vocalTechs = [];
    document.querySelectorAll('.vocal-tech-tag.active').forEach(tag => {
        vocalTechs.push(tag.dataset.style);
    });
    if (vocalTechs.length > 0) {
        parts.push(vocalTechs.slice(0, 3).join(', '));
    }

    // 7. 收集已選的樂器標籤
    const instruments = [];
    document.querySelectorAll('.instrument-tag.active').forEach(tag => {
        instruments.push(tag.dataset.style);
    });
    if (instruments.length > 0) {
        parts.push(instruments.slice(0, 4).join(', '));
    }

    // 8. 收集已選的 Mix 標籤
    const mixTags = [];
    document.querySelectorAll('.mix-tag.active').forEach(tag => {
        mixTags.push(tag.dataset.style);
    });
    if (mixTags.length > 0) {
        parts.push(`[MIX: ${mixTags.join(', ')}]`);
    }

    // 9. 收集已選的母帶處理標籤
    const masteringTags = [];
    document.querySelectorAll('.mastering-tag.active').forEach(tag => {
        masteringTags.push(tag.dataset.style);
    });
    if (masteringTags.length > 0) {
        parts.push(`[MASTERING: ${masteringTags.join(', ')}]`);
    }

    // 10. 收集已選的 Ad-Libs
    const adLibsInput = document.getElementById('adlibs-input');
    if (adLibsInput?.value?.trim()) {
        parts.push(`ad-libs: (${adLibsInput.value.trim()})`);
    }

    // 組合成最終 Style Prompt
    const stylePrompt = parts.join(', ');

    // 填入文字框
    if (elements.stylePrompt) {
        elements.stylePrompt.value = stylePrompt;
        currentStylePrompt = stylePrompt;

        // 高亮動畫
        elements.stylePrompt.classList.add('highlight-flash');
        setTimeout(() => {
            elements.stylePrompt.classList.remove('highlight-flash');
        }, 600);

        showToast('已自動生成 Style Prompt！', 'success');
    }

    return stylePrompt;
}

// 初始化自動生成按鈕
function initAutoStylePrompt() {
    const autoBtn = document.getElementById('auto-style-btn');
    if (autoBtn) {
        autoBtn.addEventListener('click', generateAutoStylePrompt);
    }
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

// ===== 複製到 Suno 格式 =====
async function copyToSunoFormat() {
    const lyrics = elements.outputArea.dataset.rawLyrics || elements.outputArea.textContent;
    const stylePrompt = elements.stylePrompt?.value || '';

    if (!lyrics || lyrics.includes('生成的歌詞會顯示在這裡')) {
        showToast('請先生成歌詞', 'warning');
        return;
    }

    // 收集當前設定
    const genre = elements.songGenre?.value || '';
    const mood = elements.songMood?.value || '';
    const bpm = document.getElementById('song-bpm')?.value || '';

    // 收集已選擇的 Mix 標籤
    const mixTags = [];
    document.querySelectorAll('.mix-tag.active').forEach(tag => {
        mixTags.push(tag.dataset.style);
    });

    // 收集已選擇的母帶處理風格
    const masteringTags = [];
    document.querySelectorAll('.mastering-tag.active').forEach(tag => {
        masteringTags.push(tag.dataset.style);
    });

    // 構建 Suno 格式輸出
    let sunoOutput = '';

    // Style Prompt 區塊
    sunoOutput += '═══════════════════════════════════════\n';
    sunoOutput += '🎵 STYLE OF MUSIC (複製到 Suno 的 Style 欄位)\n';
    sunoOutput += '═══════════════════════════════════════\n\n';

    if (stylePrompt) {
        sunoOutput += stylePrompt;
    } else {
        // 如果沒有 Style Prompt，根據選項生成一個基礎的
        const styleParts = [];
        if (genre) styleParts.push(genre.replace(/-/g, ' '));
        if (mood) styleParts.push(mood);
        if (bpm) styleParts.push(`${bpm} BPM`);
        if (mixTags.length > 0) styleParts.push(`[MIX: ${mixTags.join(', ')}]`);
        if (masteringTags.length > 0) styleParts.push(`[MASTERING: ${masteringTags.join(', ')}]`);
        sunoOutput += styleParts.join(', ') || '(請填寫風格描述)';
    }

    sunoOutput += '\n\n';

    // 歌詞區塊
    sunoOutput += '═══════════════════════════════════════\n';
    sunoOutput += '📝 LYRICS (複製到 Suno 的 Lyrics 欄位)\n';
    sunoOutput += '═══════════════════════════════════════\n\n';
    sunoOutput += lyrics;

    // 附加資訊
    sunoOutput += '\n\n';
    sunoOutput += '───────────────────────────────────────\n';
    sunoOutput += '💡 使用說明：\n';
    sunoOutput += '1. 將「STYLE OF MUSIC」區塊內容複製到 Suno 的 Style 欄位\n';
    sunoOutput += '2. 將「LYRICS」區塊內容複製到 Suno 的 Lyrics 欄位\n';
    sunoOutput += '3. 選擇 Custom 模式開始生成\n';
    sunoOutput += '───────────────────────────────────────\n';
    sunoOutput += `📅 Generated by SunoLyricist | ${new Date().toLocaleString('zh-TW')}\n`;

    try {
        await navigator.clipboard.writeText(sunoOutput);
        showToast('已複製 Suno 格式！包含 Style + Lyrics', 'success');
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

// ===== 鍵盤快捷鍵系統 =====
const KEYBOARD_SHORTCUTS = {
    'g': { action: 'generate', description: '生成歌詞', key: 'G' },
    'c': { action: 'copy', description: '複製歌詞', key: 'C' },
    's': { action: 'copySuno', description: '複製到 Suno', key: 'S' },
    'd': { action: 'download', description: '下載 TXT', key: 'D' },
    'h': { action: 'history', description: '開啟歷史面板', key: 'H' },
    'a': { action: 'analyze', description: '分析歌詞', key: 'A' },
    'r': { action: 'random', description: '隨機風格組合', key: 'R' },
    't': { action: 'theme', description: '切換深/淺色模式', key: 'T' },
    '/': { action: 'help', description: '顯示快捷鍵說明', key: '/' },
    'Escape': { action: 'close', description: '關閉彈窗', key: 'Esc' }
};

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // 如果在輸入框中，不觸發快捷鍵（除了 Escape）
        const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
        if (isInputFocused && e.key !== 'Escape') return;

        // 需要按住 Alt/Option 鍵
        if (!e.altKey && e.key !== 'Escape' && e.key !== '/') return;

        const shortcut = KEYBOARD_SHORTCUTS[e.key.toLowerCase()] || KEYBOARD_SHORTCUTS[e.key];
        if (!shortcut) return;

        e.preventDefault();

        switch (shortcut.action) {
            case 'generate':
                elements.generateBtn?.click();
                break;
            case 'copy':
                if (!elements.copyBtn?.disabled) {
                    elements.copyBtn?.click();
                }
                break;
            case 'copySuno':
                if (!elements.copySunoBtn?.disabled) {
                    elements.copySunoBtn?.click();
                }
                break;
            case 'history':
                openHistoryPanel();
                break;
            case 'analyze':
                const analyzeBtn = document.getElementById('analyze-btn');
                if (analyzeBtn && !analyzeBtn.disabled) {
                    analyzeBtn.click();
                }
                break;
            case 'random':
                // 觸發 Song Lab 的隨機按鈕
                const randomAllBtn = document.getElementById('random-all-btn');
                if (randomAllBtn) {
                    randomAllBtn.click();
                    showToast('已隨機生成風格組合！', 'success');
                }
                break;
            case 'theme':
                // 觸發主題切換
                const themeToggleBtn = document.getElementById('theme-toggle-btn');
                if (themeToggleBtn) {
                    themeToggleBtn.click();
                }
                break;
            case 'download':
                // 觸發下載 TXT
                const downloadTxtBtn = document.getElementById('download-txt-btn');
                if (downloadTxtBtn && !downloadTxtBtn.disabled) {
                    downloadTxtBtn.click();
                }
                break;
            case 'help':
                showKeyboardShortcutsHelp();
                break;
            case 'close':
                closeAllPanels();
                break;
        }
    });
}

function showKeyboardShortcutsHelp() {
    // 檢查是否已有說明面板
    let helpPanel = document.getElementById('keyboard-shortcuts-help');
    if (helpPanel) {
        helpPanel.remove();
        return;
    }

    // 創建說明面板
    helpPanel = document.createElement('div');
    helpPanel.id = 'keyboard-shortcuts-help';
    helpPanel.className = 'keyboard-shortcuts-help';
    helpPanel.innerHTML = `
        <div class="shortcuts-header">
            <h3>⌨️ 鍵盤快捷鍵</h3>
            <button class="shortcuts-close" onclick="document.getElementById('keyboard-shortcuts-help').remove()">&times;</button>
        </div>
        <div class="shortcuts-list">
            ${Object.entries(KEYBOARD_SHORTCUTS).map(([key, info]) => `
                <div class="shortcut-item">
                    <kbd>${key === 'Escape' ? 'Esc' : key === '/' ? '/' : 'Alt + ' + info.key}</kbd>
                    <span>${info.description}</span>
                </div>
            `).join('')}
        </div>
        <div class="shortcuts-footer">
            <small>按 <kbd>/</kbd> 或 <kbd>Esc</kbd> 關閉此面板</small>
        </div>
    `;

    document.body.appendChild(helpPanel);

    // 添加動畫
    requestAnimationFrame(() => {
        helpPanel.classList.add('active');
    });
}

function closeAllPanels() {
    // 關閉歷史面板
    closeHistoryPanel();

    // 關閉快捷鍵說明
    const helpPanel = document.getElementById('keyboard-shortcuts-help');
    if (helpPanel) helpPanel.remove();

    // 關閉模態框
    hideModal();

    // 關閉分析面板
    const analysisPanel = document.getElementById('lyrics-analysis');
    if (analysisPanel) analysisPanel.classList.add('hidden');

    // 關閉主題推薦面板
    const themeSuggestions = document.getElementById('theme-suggestions');
    if (themeSuggestions) themeSuggestions.classList.add('hidden');
}

// ===== 深色/淺色主題切換 =====
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = themeToggleBtn?.querySelector('.theme-icon');

    // 從 localStorage 載入主題設定
    const savedTheme = localStorage.getItem('suno-lyricist-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme === 'light');
    } else {
        // 檢測系統偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (!prefersDark) {
            document.documentElement.setAttribute('data-theme', 'light');
            updateThemeIcon(true);
        }
    }

    function updateThemeIcon(isLight) {
        if (themeIcon) {
            themeIcon.textContent = isLight ? '☀️' : '🌙';
        }
        if (themeToggleBtn) {
            themeToggleBtn.title = isLight ? '切換到深色模式' : '切換到淺色模式';
        }
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        if (newTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }

        localStorage.setItem('suno-lyricist-theme', newTheme);
        updateThemeIcon(newTheme === 'light');

        showToast(`已切換到${newTheme === 'light' ? '淺色' : '深色'}模式`, 'success');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // 監聽系統主題變化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const savedTheme = localStorage.getItem('suno-lyricist-theme');
        // 只在沒有手動設定時跟隨系統
        if (!savedTheme) {
            if (e.matches) {
                document.documentElement.removeAttribute('data-theme');
                updateThemeIcon(false);
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                updateThemeIcon(true);
            }
        }
    });
}

// ===== 即時歌詞統計 =====
function updateLyricsStats(lyrics) {
    const statsBar = document.getElementById('lyrics-stats-bar');
    if (!statsBar) return;

    if (!lyrics || lyrics.trim().length === 0) {
        statsBar.classList.add('hidden');
        return;
    }

    statsBar.classList.remove('hidden');

    // 計算字數（排除結構標籤）
    const cleanLyrics = lyrics.replace(/\[.*?\]/g, '').trim();
    const charCount = cleanLyrics.replace(/\s/g, '').length;

    // 計算行數（排除空行和標籤行）
    const lines = lyrics.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 0 && !trimmed.match(/^\[.*?\]$/);
    });
    const lineCount = lines.length;

    // 計算段落數（通過結構標籤）
    const sectionMatches = lyrics.match(/\[(Verse|Chorus|Bridge|Pre-Chorus|Outro|Intro|Hook|Interlude|Break|Rap|Spoken|Refrain).*?\]/gi);
    const sectionCount = sectionMatches ? sectionMatches.length : 0;

    // 預估歌曲時長
    // 假設：平均每行約 4 秒，加上段落間隙
    const estimatedSeconds = (lineCount * 4) + (sectionCount * 2);
    const minutes = Math.floor(estimatedSeconds / 60);
    const seconds = estimatedSeconds % 60;
    const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // 更新 UI
    const statsChars = document.getElementById('stats-chars');
    const statsLines = document.getElementById('stats-lines');
    const statsSections = document.getElementById('stats-sections');
    const statsDuration = document.getElementById('stats-duration');
    const statsWarning = document.getElementById('stats-warning');

    if (statsChars) statsChars.textContent = charCount;
    if (statsLines) statsLines.textContent = lineCount;
    if (statsSections) statsSections.textContent = sectionCount;
    if (statsDuration) statsDuration.textContent = duration;

    // Suno 字數限制警告 (建議 3000 字以內)
    if (statsWarning) {
        if (charCount > 3000) {
            statsWarning.textContent = '⚠️ 超過 Suno 建議上限 (3000字)';
            statsWarning.className = 'stats-warning danger';
        } else if (charCount > 2500) {
            statsWarning.textContent = '⚡ 接近 Suno 上限，建議精簡';
            statsWarning.className = 'stats-warning warning';
        } else if (charCount < 100 && charCount > 0) {
            statsWarning.textContent = '💡 歌詞較短，可考慮擴充';
            statsWarning.className = 'stats-warning info';
        } else if (charCount >= 200 && charCount <= 800) {
            statsWarning.textContent = '✅ 長度適中，適合 Suno 生成';
            statsWarning.className = 'stats-warning success';
        } else {
            statsWarning.textContent = '';
            statsWarning.className = 'stats-warning';
        }
    }
}

// 監聽歌詞輸出變化
function initLyricsStatsObserver() {
    const outputArea = document.getElementById('output-area');
    if (!outputArea) return;

    // 使用 MutationObserver 監聽輸出區域變化
    const observer = new MutationObserver((mutations) => {
        const lyrics = outputArea.textContent || '';
        // 排除 placeholder 文字
        if (!lyrics.includes('生成的歌詞會顯示在這裡')) {
            updateLyricsStats(lyrics);
        }
    });

    observer.observe(outputArea, {
        childList: true,
        subtree: true,
        characterData: true
    });
}

// ===== 下載歌詞 TXT =====
function downloadLyricsTxt() {
    const outputArea = document.getElementById('output-area');
    const lyrics = outputArea?.dataset?.rawLyrics || outputArea?.textContent || '';

    if (!lyrics || lyrics.includes('生成的歌詞會顯示在這裡')) {
        showToast('沒有可下載的歌詞', 'error');
        return;
    }

    // 取得主題作為檔名
    const theme = elements.songTheme?.value?.trim() || 'lyrics';
    const safeName = theme.replace(/[<>:"/\\|?*]/g, '_').slice(0, 50);
    const timestamp = new Date().toISOString().slice(0, 10);

    // 收集 Style Prompt
    const stylePrompt = currentStylePrompt || elements.stylePrompt?.value || '';

    // 建構 TXT 內容
    let content = `═══════════════════════════════════════\n`;
    content += `🎵 SunoLyricist 歌詞匯出\n`;
    content += `═══════════════════════════════════════\n\n`;
    content += `📅 日期: ${timestamp}\n`;
    content += `📝 主題: ${theme}\n`;
    if (stylePrompt) {
        content += `🎸 Style Prompt: ${stylePrompt}\n`;
    }
    content += `\n═══════════════════════════════════════\n`;
    content += `📜 歌詞內容\n`;
    content += `═══════════════════════════════════════\n\n`;
    content += lyrics;
    content += `\n\n═══════════════════════════════════════\n`;
    content += `✨ Generated by SunoLyricist\n`;
    content += `═══════════════════════════════════════\n`;

    // 建立 Blob 並下載
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}_${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('歌詞已下載為 TXT 檔案！', 'success');
}

function initDownloadTxt() {
    const downloadBtn = document.getElementById('download-txt-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadLyricsTxt);
    }
}

// ===== 啟動應用 =====
// ===== 創作靈感系統 =====
const INSPIRATION_THEMES = {
    emotions: [
        '初戀的心動', '失戀後的成長', '重逢的喜悅', '離別的不捨',
        '暗戀的酸甜', '思念遠方的人', '被愛包圍的幸福', '心碎後的堅強'
    ],
    stories: [
        '午夜城市漫步', '雨天咖啡廳邂逅', '海邊的告白', '畢業季的約定',
        '深夜獨自開車', '老照片裡的回憶', '跨年夜的願望', '凌晨三點的對話'
    ],
    seasons: [
        '夏日海灘派對', '秋天落葉的浪漫', '冬夜的溫暖擁抱', '春天新的開始',
        '聖誕節的期待', '情人節的驚喜', '新年第一道曙光', '颱風夜的陪伴'
    ],
    life: [
        '追夢的勇氣', '青春的遺憾', '成長的代價', '自我療癒之旅',
        '家的溫暖', '友情的珍貴', '獨處的時光', '重新出發的決心'
    ],
    abstract: [
        '時間的流逝', '記憶的碎片', '夢與現實的交界', '星空下的對話',
        '月光下的秘密', '風帶來的訊息', '雲端的漫遊', '光影交錯的瞬間'
    ],
    fun: [
        '週末夜店狂歡', '公路旅行', '演唱會的熱情', 'K歌之王',
        '網路戀情', '遊戲裡的隊友', '深夜食堂', '健身房的蛻變'
    ]
};

function getRandomInspiration() {
    const categories = Object.keys(INSPIRATION_THEMES);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const themes = INSPIRATION_THEMES[randomCategory];
    return themes[Math.floor(Math.random() * themes.length)];
}

function initInspirationBtn() {
    const btn = document.getElementById('inspiration-btn');
    const themeInput = document.getElementById('song-theme');

    if (btn && themeInput) {
        btn.addEventListener('click', () => {
            // 添加骰子動畫
            btn.classList.add('rolling');
            setTimeout(() => btn.classList.remove('rolling'), 500);

            // 獲取隨機靈感
            const inspiration = getRandomInspiration();
            themeInput.value = inspiration;

            // 觸發 input 事件以更新任何相關狀態
            themeInput.dispatchEvent(new Event('input', { bubbles: true }));

            showToast(`靈感：${inspiration}`, 'success');
        });
    }
}

// ===== 標籤清除功能 =====
function clearTagsBySelector(selector, toastMessage) {
    const tags = document.querySelectorAll(selector);
    let clearedCount = 0;
    tags.forEach(tag => {
        if (tag.classList.contains('active')) {
            tag.classList.remove('active');
            clearedCount++;
        }
    });
    if (clearedCount > 0) {
        showToast(`已清除 ${clearedCount} 個${toastMessage}`, 'success');
    } else {
        showToast(`沒有已選的${toastMessage}`, 'info');
    }
}

function initClearTagButtons() {
    // 清除混音標籤
    const clearMixBtn = document.getElementById('clear-mix-btn');
    if (clearMixBtn) {
        clearMixBtn.addEventListener('click', () => {
            clearTagsBySelector('.mix-tag', '混音標籤');
        });
    }

    // 清除人聲標籤
    const clearVocalBtn = document.getElementById('clear-vocal-btn');
    if (clearVocalBtn) {
        clearVocalBtn.addEventListener('click', () => {
            clearTagsBySelector('.vocal-tech-tag', '人聲標籤');
        });
    }

    // 清除樂器標籤
    const clearInstrumentBtn = document.getElementById('clear-instrument-btn');
    if (clearInstrumentBtn) {
        clearInstrumentBtn.addEventListener('click', () => {
            clearTagsBySelector('.instrument-tag', '樂器標籤');
        });
    }
}

// ===== Scroll to Top 功能 =====
function initScrollToTop() {
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    if (!scrollTopBtn) return;

    // 監聽滾動事件
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                // 當滾動超過 300px 時顯示按鈕
                if (window.scrollY > 300) {
                    scrollTopBtn.classList.add('visible');
                } else {
                    scrollTopBtn.classList.remove('visible');
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    // 點擊返回頂部
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== Form Progress Bar 功能 =====
const FORM_PROGRESS_ITEMS = [
    { id: 'song-theme', weight: 25, label: '主題' },
    { id: 'genre', weight: 15, label: '風格' },
    { id: 'mood', weight: 10, label: '情緒' },
    { id: 'vocal-style', weight: 10, label: '人聲' },
    { id: 'style-prompt', weight: 15, label: 'Style Prompt' },
    { selector: '.mix-tag.active', weight: 10, label: 'Mix 設定' },
    { selector: '.vocal-tech-tag.active', weight: 8, label: '人聲技巧' },
    { selector: '.instrument-tag.active', weight: 7, label: '樂器配器' }
];

const PROGRESS_HINTS = [
    { min: 0, max: 10, text: '填寫主題開始創作', class: '' },
    { min: 10, max: 30, text: '選擇音樂風格會更好', class: '' },
    { min: 30, max: 50, text: '不錯！繼續完善設定', class: '' },
    { min: 50, max: 70, text: '很好！可以開始生成了', class: '' },
    { min: 70, max: 90, text: '專業設定！成果會更精準', class: '' },
    { min: 90, max: 101, text: '完美配置！準備創作傑作', class: 'excellent' }
];

function calculateFormProgress() {
    let progress = 0;

    FORM_PROGRESS_ITEMS.forEach(item => {
        if (item.id) {
            const el = document.getElementById(item.id);
            if (el && el.value && el.value.trim()) {
                progress += item.weight;
            }
        } else if (item.selector) {
            const els = document.querySelectorAll(item.selector);
            if (els.length > 0) {
                progress += item.weight;
            }
        }
    });

    return Math.min(progress, 100);
}

function updateFormProgress() {
    const progressFill = document.getElementById('form-progress-fill');
    const progressValue = document.getElementById('form-progress-value');
    const progressHint = document.getElementById('progress-hint');

    if (!progressFill || !progressValue || !progressHint) return;

    const progress = calculateFormProgress();

    progressFill.style.width = `${progress}%`;
    progressValue.textContent = `${progress}%`;

    // 更新提示文字
    const hint = PROGRESS_HINTS.find(h => progress >= h.min && progress < h.max);
    if (hint) {
        progressHint.textContent = hint.text;
        progressHint.className = 'progress-hint ' + hint.class;
    }

    // 100% 時特殊樣式
    if (progress >= 90) {
        progressValue.classList.add('complete');
    } else {
        progressValue.classList.remove('complete');
    }
}

function initFormProgress() {
    // 初始計算
    updateFormProgress();

    // 監聽所有相關輸入變化
    const inputIds = ['song-theme', 'genre', 'mood', 'vocal-style', 'style-prompt', 'tempo', 'bpm'];
    inputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateFormProgress);
            el.addEventListener('change', updateFormProgress);
        }
    });

    // 監聽標籤點擊
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('mix-tag') ||
            e.target.classList.contains('vocal-tech-tag') ||
            e.target.classList.contains('instrument-tag') ||
            e.target.classList.contains('style-tag')) {
            // 延遲計算，等待 active class 變化
            setTimeout(updateFormProgress, 50);
        }
    });

    // 監聽清除按鈕
    ['clear-mix-btn', 'clear-vocal-btn', 'clear-instrument-btn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                setTimeout(updateFormProgress, 50);
            });
        }
    });
}

// ===== Loading Stage Animation 功能 =====
const LOADING_STAGES = [
    '準備中...',
    '分析主題...',
    '構思結構...',
    '撰寫主歌...',
    '創作副歌...',
    '編寫橋段...',
    '潤飾歌詞...',
    '最終調整...'
];

let loadingStageInterval = null;
let loadingStageIndex = 0;

function startLoadingStageAnimation() {
    const stageEl = document.getElementById('loading-stage');
    if (!stageEl) return;

    loadingStageIndex = 0;
    stageEl.textContent = LOADING_STAGES[0];

    // 每 1.5 秒切換一個階段
    loadingStageInterval = setInterval(() => {
        loadingStageIndex = (loadingStageIndex + 1) % LOADING_STAGES.length;
        stageEl.textContent = LOADING_STAGES[loadingStageIndex];
    }, 1500);
}

function stopLoadingStageAnimation() {
    if (loadingStageInterval) {
        clearInterval(loadingStageInterval);
        loadingStageInterval = null;
    }
}

// 導出給 generate 函數使用
window.startLoadingStageAnimation = startLoadingStageAnimation;
window.stopLoadingStageAnimation = stopLoadingStageAnimation;

// ===== Onboarding Tour 功能 =====
const ONBOARDING_STEPS = [
    {
        title: '歡迎使用 SunoLyricist!',
        text: '這是一個 AI 歌詞創作助手，專為 Suno AI 音樂生成平台設計。讓我帶你快速了解主要功能。',
        target: null
    },
    {
        title: '輸入歌曲主題',
        text: '在這裡輸入你的創作主題，例如「夏日海灘的愛情故事」。點擊 🎲 靈感 可獲取隨機創作靈感！',
        target: '#song-theme'
    },
    {
        title: '選擇音樂風格',
        text: '選擇風格、情緒、人聲等設定。可以使用「智能推薦」根據主題自動推薦最適合的風格組合。',
        target: '#genre'
    },
    {
        title: '生成 AI 歌詞',
        text: '完成設定後，點擊「生成歌詞」按鈕，AI 將根據你的設定創作專業歌詞和 Style Prompt。',
        target: '#generate-btn'
    },
    {
        title: '開始創作吧！',
        text: '現在你已經準備好了！按 / 可查看快捷鍵，點擊右上角 ☀️/🌙 切換主題。祝你創作愉快！',
        target: null
    }
];

let onboardingStep = 0;

function showOnboarding() {
    const hasSeenOnboarding = localStorage.getItem('sunolyricist_onboarding_seen');
    if (hasSeenOnboarding) return;

    const overlay = document.getElementById('onboarding-overlay');
    if (!overlay) return;

    overlay.classList.remove('hidden');
    updateOnboardingStep();
}

function updateOnboardingStep() {
    const step = ONBOARDING_STEPS[onboardingStep];
    const stepEl = document.getElementById('onboarding-step');
    const titleEl = document.getElementById('onboarding-title');
    const textEl = document.getElementById('onboarding-text');
    const nextBtn = document.getElementById('onboarding-next');

    if (stepEl) stepEl.textContent = `${onboardingStep + 1}/${ONBOARDING_STEPS.length}`;
    if (titleEl) titleEl.textContent = step.title;
    if (textEl) textEl.textContent = step.text;

    // 更新按鈕文字
    if (nextBtn) {
        nextBtn.textContent = onboardingStep === ONBOARDING_STEPS.length - 1 ? '開始使用' : '下一步';
    }

    // 移除之前的高亮
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
        el.classList.remove('onboarding-highlight');
    });

    // 添加新的高亮
    if (step.target) {
        const targetEl = document.querySelector(step.target);
        if (targetEl) {
            targetEl.classList.add('onboarding-highlight');
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

function nextOnboardingStep() {
    onboardingStep++;
    if (onboardingStep >= ONBOARDING_STEPS.length) {
        closeOnboarding();
    } else {
        updateOnboardingStep();
    }
}

function closeOnboarding() {
    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) overlay.classList.add('hidden');

    // 移除高亮
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
        el.classList.remove('onboarding-highlight');
    });

    // 記錄已看過
    localStorage.setItem('sunolyricist_onboarding_seen', 'true');
}

function initOnboarding() {
    const nextBtn = document.getElementById('onboarding-next');
    const skipBtn = document.getElementById('onboarding-skip');

    if (nextBtn) {
        nextBtn.addEventListener('click', nextOnboardingStep);
    }
    if (skipBtn) {
        skipBtn.addEventListener('click', closeOnboarding);
    }

    // 延遲 500ms 後顯示導覽（讓頁面先載入完成）
    setTimeout(showOnboarding, 500);
}

// ===== Quality Score System 功能 =====
const QUALITY_GRADES = [
    { min: 90, label: 'S 級 - 大師級作品', class: 'excellent' },
    { min: 80, label: 'A 級 - 優秀作品', class: 'excellent' },
    { min: 70, label: 'B 級 - 良好作品', class: 'good' },
    { min: 60, label: 'C 級 - 合格作品', class: 'average' },
    { min: 0, label: 'D 級 - 需要改進', class: 'poor' }
];

const QUALITY_SUGGESTIONS = {
    structure: {
        low: '建議增加更多段落變化，如加入 Bridge 或 Pre-Chorus 讓結構更豐富。',
        medium: '結構基本完整，可考慮加入更多過渡段落增加層次。',
        high: '結構非常完整，段落安排合理！'
    },
    rhyme: {
        low: '押韻較少，建議在句尾增加更多韻腳，讓歌詞更朗朗上口。',
        medium: '有一定押韻，可以嘗試更多內韻和交叉韻。',
        high: '押韻豐富，韻律感很強！'
    },
    length: {
        low: '歌詞偏短，建議擴展內容，增加更多描述和情感表達。',
        medium: '長度適中，可根據需要適當擴展。',
        high: '歌詞長度非常適合歌曲演唱！'
    },
    emotion: {
        low: '情感表達較平淡，建議加入更多情感詞彙和意象。',
        medium: '有一定情感表達，可以更深入挖掘主題情感。',
        high: '情感表達豐富，很有感染力！'
    }
};

function calculateQualityScore(lyrics) {
    if (!lyrics) return null;

    const lines = lyrics.split('\n').filter(l => l.trim() && !l.match(/^\[.*\]$/));
    const sections = lyrics.match(/\[(Verse|Chorus|Bridge|Pre-Chorus|Outro|Intro|Hook|Drop)/gi) || [];
    const chars = lines.join('').replace(/\s/g, '').length;

    // 結構完整性評分 (0-25)
    let structureScore = 0;
    if (sections.length >= 1) structureScore += 5;
    if (sections.length >= 3) structureScore += 5;
    if (sections.length >= 5) structureScore += 5;
    if (lyrics.toLowerCase().includes('chorus')) structureScore += 5;
    if (lyrics.toLowerCase().includes('verse')) structureScore += 5;

    // 押韻豐富度評分 (0-25) - 簡化版：檢測行尾重複音
    let rhymeScore = 0;
    const lineEndings = lines.map(l => l.trim().slice(-2));
    const uniqueEndings = new Set(lineEndings);
    const rhymeRatio = 1 - (uniqueEndings.size / lineEndings.length);
    rhymeScore = Math.round(rhymeRatio * 25);

    // 歌詞長度評分 (0-25)
    let lengthScore = 0;
    if (chars >= 50) lengthScore += 5;
    if (chars >= 100) lengthScore += 5;
    if (chars >= 200) lengthScore += 5;
    if (chars >= 300) lengthScore += 5;
    if (chars >= 400 && chars <= 800) lengthScore += 5;
    else if (chars > 800) lengthScore += 3;

    // 情感表達評分 (0-25) - 檢測情感詞彙
    const emotionWords = ['愛', '心', '淚', '夢', '思念', '感', '痛', '喜', '悲', '望', '念', '憶', '情', '戀', '想', '怕', '恨', '歡', '樂', '哭', '笑'];
    let emotionCount = 0;
    emotionWords.forEach(word => {
        if (lyrics.includes(word)) emotionCount++;
    });
    let emotionScore = Math.min(25, emotionCount * 3);

    const total = structureScore + rhymeScore + lengthScore + emotionScore;

    return {
        total,
        structure: structureScore,
        rhyme: rhymeScore,
        length: lengthScore,
        emotion: emotionScore
    };
}

function getScoreLevel(score, max) {
    const ratio = score / max;
    if (ratio >= 0.8) return 'high';
    if (ratio >= 0.5) return 'medium';
    return 'low';
}

function showQualityScore() {
    const outputArea = document.getElementById('output-area');
    const lyrics = outputArea?.dataset?.rawLyrics || outputArea?.textContent || '';

    if (!lyrics || lyrics.includes('生成的歌詞會顯示在這裡')) {
        showToast('請先生成歌詞', 'error');
        return;
    }

    const scores = calculateQualityScore(lyrics);
    if (!scores) return;

    // 更新 UI
    document.getElementById('total-score-value').textContent = scores.total;

    // 更新等級
    const grade = QUALITY_GRADES.find(g => scores.total >= g.min);
    const gradeEl = document.getElementById('score-grade');
    gradeEl.textContent = `等級: ${grade.label}`;
    gradeEl.className = 'score-grade ' + grade.class;

    // 更新各項分數條
    ['structure', 'rhyme', 'length', 'emotion'].forEach(key => {
        const bar = document.getElementById(`score-${key}`);
        const val = document.getElementById(`score-${key}-val`);
        if (bar) bar.style.width = `${(scores[key] / 25) * 100}%`;
        if (val) val.textContent = scores[key];
    });

    // 生成建議
    const suggestions = [];
    ['structure', 'rhyme', 'length', 'emotion'].forEach(key => {
        const level = getScoreLevel(scores[key], 25);
        if (level !== 'high') {
            suggestions.push(QUALITY_SUGGESTIONS[key][level]);
        }
    });

    const suggestionEl = document.getElementById('quality-suggestion');
    if (suggestions.length > 0) {
        suggestionEl.innerHTML = '<strong>改進建議：</strong><br>' + suggestions.join('<br>');
    } else {
        suggestionEl.innerHTML = '🎉 太棒了！這是一首高質量的歌詞，各方面都表現出色！';
    }

    // 顯示面板
    document.getElementById('quality-score-panel').classList.remove('hidden');
}

function initQualityScore() {
    const scoreBtn = document.getElementById('quality-score-btn');
    const closeBtn = document.getElementById('close-quality-score');

    if (scoreBtn) {
        scoreBtn.addEventListener('click', showQualityScore);
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('quality-score-panel').classList.add('hidden');
        });
    }
}

// ===== Style Combo System 功能 =====
const STYLE_COMBO_STORAGE_KEY = 'sunolyricist_style_combos';
const MAX_COMBOS = 10;

function getStyleCombos() {
    const stored = localStorage.getItem(STYLE_COMBO_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveStyleCombos(combos) {
    localStorage.setItem(STYLE_COMBO_STORAGE_KEY, JSON.stringify(combos));
}

function getCurrentStyleSettings() {
    const genre = document.getElementById('genre')?.value || '';
    const mood = document.getElementById('mood')?.value || '';
    const vocalStyle = document.getElementById('vocal-style')?.value || '';
    const tempo = document.getElementById('tempo')?.value || '';
    const bpm = document.getElementById('bpm')?.value || '';
    const stylePrompt = document.getElementById('style-prompt')?.value || '';

    // 收集 Mix 標籤
    const mixTags = [];
    document.querySelectorAll('.mix-tag.active').forEach(tag => {
        mixTags.push(tag.dataset.style);
    });

    // 收集人聲技巧
    const vocalTechs = [];
    document.querySelectorAll('.vocal-tech-tag.active').forEach(tag => {
        vocalTechs.push(tag.dataset.tech);
    });

    // 收集樂器
    const instruments = [];
    document.querySelectorAll('.instrument-tag.active').forEach(tag => {
        instruments.push(tag.dataset.instrument);
    });

    return {
        genre, mood, vocalStyle, tempo, bpm, stylePrompt,
        mixTags, vocalTechs, instruments
    };
}

function applyStyleCombo(combo) {
    // 套用基本設定
    if (combo.genre) document.getElementById('genre').value = combo.genre;
    if (combo.mood) document.getElementById('mood').value = combo.mood;
    if (combo.vocalStyle) document.getElementById('vocal-style').value = combo.vocalStyle;
    if (combo.tempo) document.getElementById('tempo').value = combo.tempo;
    if (combo.bpm) document.getElementById('bpm').value = combo.bpm;
    if (combo.stylePrompt) document.getElementById('style-prompt').value = combo.stylePrompt;

    // 清除並套用 Mix 標籤
    document.querySelectorAll('.mix-tag').forEach(tag => tag.classList.remove('active'));
    if (combo.mixTags) {
        combo.mixTags.forEach(style => {
            const tag = document.querySelector(`.mix-tag[data-style="${style}"]`);
            if (tag) tag.classList.add('active');
        });
    }

    // 清除並套用人聲技巧
    document.querySelectorAll('.vocal-tech-tag').forEach(tag => tag.classList.remove('active'));
    if (combo.vocalTechs) {
        combo.vocalTechs.forEach(tech => {
            const tag = document.querySelector(`.vocal-tech-tag[data-tech="${tech}"]`);
            if (tag) tag.classList.add('active');
        });
    }

    // 清除並套用樂器
    document.querySelectorAll('.instrument-tag').forEach(tag => tag.classList.remove('active'));
    if (combo.instruments) {
        combo.instruments.forEach(inst => {
            const tag = document.querySelector(`.instrument-tag[data-instrument="${inst}"]`);
            if (tag) tag.classList.add('active');
        });
    }

    // 更新進度條
    if (typeof updateFormProgress === 'function') {
        setTimeout(updateFormProgress, 100);
    }
}

function saveCurrentStyleCombo() {
    const settings = getCurrentStyleSettings();

    // 檢查是否有設定
    if (!settings.genre && !settings.stylePrompt && settings.mixTags.length === 0) {
        showToast('請先選擇一些風格設定', 'error');
        return;
    }

    const name = prompt('為這個風格組合命名：', settings.genre || '我的風格');
    if (!name) return;

    const combos = getStyleCombos();

    // 限制數量
    if (combos.length >= MAX_COMBOS) {
        showToast(`最多只能保存 ${MAX_COMBOS} 個組合`, 'error');
        return;
    }

    const newCombo = {
        id: Date.now(),
        name: name.trim(),
        settings,
        createdAt: new Date().toISOString()
    };

    combos.unshift(newCombo);
    saveStyleCombos(combos);
    renderStyleCombos();
    showToast('風格組合已保存！', 'success');
}

function deleteStyleCombo(id) {
    if (!confirm('確定要刪除這個風格組合嗎？')) return;

    const combos = getStyleCombos().filter(c => c.id !== id);
    saveStyleCombos(combos);
    renderStyleCombos();
    showToast('風格組合已刪除', 'success');
}

function loadStyleCombo(id) {
    const combos = getStyleCombos();
    const combo = combos.find(c => c.id === id);
    if (!combo) return;

    applyStyleCombo(combo.settings);
    document.getElementById('style-combo-panel').classList.add('hidden');
    showToast(`已載入「${combo.name}」`, 'success');
}

function renderStyleCombos() {
    const comboList = document.getElementById('combo-list');
    if (!comboList) return;

    const combos = getStyleCombos();

    if (combos.length === 0) {
        comboList.innerHTML = '<p class="empty-combo">尚無保存的風格組合</p>';
        return;
    }

    comboList.innerHTML = combos.map(combo => {
        const preview = [
            combo.settings.genre,
            combo.settings.mood,
            combo.settings.vocalStyle
        ].filter(Boolean).join(' • ') || '自訂組合';

        return `
            <div class="combo-item">
                <div class="combo-info">
                    <div class="combo-name">${combo.name}</div>
                    <div class="combo-preview">${preview}</div>
                </div>
                <div class="combo-actions">
                    <button class="btn-combo-load" onclick="loadStyleCombo(${combo.id})">載入</button>
                    <button class="btn-combo-delete" onclick="deleteStyleCombo(${combo.id})">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function initStyleCombo() {
    const saveBtn = document.getElementById('save-style-combo-btn');
    const loadBtn = document.getElementById('load-style-combo-btn');
    const closeBtn = document.getElementById('close-combo-panel');
    const panel = document.getElementById('style-combo-panel');

    if (saveBtn) {
        saveBtn.addEventListener('click', saveCurrentStyleCombo);
    }

    if (loadBtn) {
        loadBtn.addEventListener('click', () => {
            renderStyleCombos();
            panel?.classList.toggle('hidden');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            panel?.classList.add('hidden');
        });
    }
}

// 導出給 onclick 使用
window.loadStyleCombo = loadStyleCombo;
window.deleteStyleCombo = deleteStyleCombo;

init();
initKeyboardShortcuts();
initAutoStylePrompt();
initThemeToggle();
initLyricsStatsObserver();
initDownloadTxt();
initInspirationBtn();
initClearTagButtons();
initScrollToTop();
initFormProgress();
initOnboarding();
initQualityScore();
initStyleCombo();
