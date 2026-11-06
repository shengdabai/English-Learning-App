/**
 * 语音识别和合成服务
 * 处理口语练习、发音评估和影子跟读功能
 */

// 语音识别配置
const SPEECH_RECOGNITION_CONFIG = {
  lang: 'en-US',
  continuous: false,
  interimResults: true,
  maxAlternatives: 3,
};

// 发音评分标准
const PRONUNCIATION_CRITERIA = {
  excellent: { min: 90, message: 'Excellent transcript match!', emoji: '🎉' },
  good: { min: 75, max: 89, message: 'Good transcript match!', emoji: '😊' },
  fair: { min: 60, max: 74, message: 'Partial transcript match. Keep practicing!', emoji: '📝' },
  needs_improvement: { min: 0, max: 59, message: 'Needs improvement. Listen carefully!', emoji: '🎧' },
};

/**
 * 检查浏览器语音支持
 * @returns {Object} 支持状态
 */
export const checkSpeechSupport = () => {
  return {
    speechRecognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
    speechSynthesis: 'speechSynthesis' in window,
  };
};

/**
 * 开始语音识别
 * @param {Function} onResult - 识别结果回调
 * @param {Function} onError - 错误回调
 * @returns {Object|null} 识别器实例
 */
export const startSpeechRecognition = (onResult, onError) => {
  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('Speech recognition not supported');
    }

    const recognition = new SpeechRecognition();

    recognition.lang = SPEECH_RECOGNITION_CONFIG.lang;
    recognition.continuous = SPEECH_RECOGNITION_CONFIG.continuous;
    recognition.interimResults = SPEECH_RECOGNITION_CONFIG.interimResults;
    recognition.maxAlternatives = SPEECH_RECOGNITION_CONFIG.maxAlternatives;

    recognition.onresult = (event) => {
      const results = Array.from(event.results);
      const transcript = results.map(result => result[0]?.transcript).join(' ');

      onResult({
        transcript: transcript.trim(),
        confidence: results[0]?.[0]?.confidence || 0,
        isFinal: event.results[event.results.length - 1].isFinal,
        alternatives: results[0]?.map(alt => ({
          transcript: alt.transcript,
          confidence: alt.confidence,
        })) || [],
      });
    };

    recognition.onerror = (event) => {
      const errorMessages = {
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'No microphone access. Please check permissions.',
        'not-allowed': 'Microphone access denied. Please allow microphone access.',
        'network': 'Network error. Please check your connection.',
      };

      const message = errorMessages[event.error] || `Speech recognition error: ${event.error}`;
      onError({ type: event.error, message });
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
    };

    recognition.start();
    return recognition;
  } catch (error) {
    onError({ type: 'init_error', message: error.message });
    return null;
  }
};

/**
 * 停止语音识别
 * @param {Object} recognition - 识别器实例
 */
export const stopSpeechRecognition = (recognition) => {
  if (recognition && typeof recognition.stop === 'function') {
    recognition.stop();
  }
};

/**
 * 文本转语音
 * @param {string} text - 要朗读的文本
 * @param {Object} options - 语音选项
 * @returns {Promise} 语音合成Promise
 */
export const textToSpeech = (text, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const synth = window.speechSynthesis;

      // 取消之前的语音
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // 设置语音参数
      utterance.lang = options.lang || 'en-US';
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      // 选择语音
      if (options.voiceId) {
        const voices = synth.getVoices();
        const voice = voices.find(v => v.lang.includes(options.lang || 'en-US'));
        if (voice) {
          utterance.voice = voice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      synth.speak(utterance);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 获取可用语音列表
 * @returns {Array} 语音列表
 */
export const getAvailableVoices = () => {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();

  return voices
    .filter(voice => voice.lang.includes('en'))
    .map(voice => ({
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
      voiceId: voice.voiceId,
      displayName: `${voice.name} (${voice.lang})`,
    }));
};

/**
 * 发音评分
 * @param {string} targetText - 目标文本
 * @param {string} userText - 用户语音识别结果
 * @param {Object} analysis - 详细分析数据
 * @returns {Object} 评分结果
 */
export const calculatePronunciationScore = (targetText, userText, analysis = {}) => {
  targetText = String(targetText ?? "").trim();
  userText = String(userText ?? "").trim();
  // ASR transcript matching is not an acoustic/phoneme pronunciation assessment.
  // 文本相似度评分 (0-100)
  const similarityScore = calculateTextSimilarity(targetText, userText);

  // 基础发音评分
  const confidence = analysis && typeof analysis.confidence === 'number' && Number.isFinite(analysis.confidence)
    ? Math.max(0, Math.min(1, analysis.confidence)) : 1;
  const baseScore = similarityScore * (0.8 + 0.2 * confidence);

  // 考虑其他因素
  let finalScore = baseScore;

  // 完整度调整
  const completenessRatio = targetText.length ? userText.length / targetText.length : 0;
  if (completenessRatio < 0.5) {
    finalScore *= 0.7; // 完整度过低时减分
  } else if (completenessRatio > 1.5) {
    finalScore *= 0.8; // 过多冗余内容时减分
  }

  // 平滑处理
  finalScore = Math.round(Math.min(100, Math.max(0, finalScore)));

  // 确定评级
  const grade = Object.keys(PRONUNCIATION_CRITERIA).find(key => {
    const criteria = PRONUNCIATION_CRITERIA[key];
    return finalScore >= criteria.min && finalScore <= (criteria.max || 100);
  });

  return {
    score: finalScore,
    grade: grade,
    feedback: PRONUNCIATION_CRITERIA[grade],
    similarity: similarityScore,
    completeness: completenessRatio,
    suggestions: generateSuggestions(grade, userText, targetText),
  };
};

/**
 * 计算文本相似度
 * @param {string} text1 - 文本1
 * @param {string} text2 - 文本2
 * @returns {number} 相似度分数 (0-100)
 */
const calculateTextSimilarity = (text1, text2) => {
  const words1 = text1.toLowerCase().split(/\s+/).filter(word => word.length > 0);
  const words2 = text2.toLowerCase().split(/\s+/).filter(word => word.length > 0);

  if (words1.length === 0 && words2.length === 0) return 0;
  if (words1.length === 0 || words2.length === 0) return 0;

  // 计算单词级别的相似度
  const counts = words => words.reduce((map, word) => map.set(word, (map.get(word) || 0) + 1), new Map());
  const left = counts(words1), right = counts(words2);
  const vocabulary = new Set([...left.keys(), ...right.keys()]);
  let intersection = 0, union = 0;
  for (const word of vocabulary) {
    intersection += Math.min(left.get(word) || 0, right.get(word) || 0);
    union += Math.max(left.get(word) || 0, right.get(word) || 0);
  }
  const jaccardSimilarity = intersection / union;

  // 考虑词序相似度（简化版）
  let orderSimilarity = 0;
  let matchedPairs = 0;

  for (let i = 0; i < Math.min(words1.length, words2.length); i++) {
    if (words1[i] === words2[i]) {
      matchedPairs++;
    }
  }

  if (Math.max(words1.length, words2.length) > 0) {
    orderSimilarity = matchedPairs / Math.max(words1.length, words2.length);
  }

  // 综合相似度
  const finalSimilarity = (jaccardSimilarity * 0.7 + orderSimilarity * 0.3);

  return Math.round(finalSimilarity * 100);
};

/**
 * 生成发音改进建议
 * @param {string} grade - 评分等级
 * @param {string} userText - 用户文本
 * @param {string} targetText - 目标文本
 * @returns {Array} 建议列表
 */
const generateSuggestions = (grade, userText, targetText) => {
  const suggestions = [];

  const userWords = userText.toLowerCase().split(/\s+/);
  const targetWords = targetText.toLowerCase().split(/\s+/);

  // 通用建议
  switch (grade) {
    case 'needs_improvement':
      suggestions.push('Listen carefully to the target pronunciation');
      suggestions.push('Break the text into smaller parts');
      suggestions.push('Practice each word separately');
      break;
    case 'fair':
      suggestions.push('Focus on word endings and beginnings');
      suggestions.push('Pay attention to stressed syllables');
      break;
    case 'good':
      suggestions.push('Work on intonation and rhythm');
      suggestions.push('Practice connected speech');
      break;
    case 'excellent':
      suggestions.push('Excellent! Try more challenging texts');
      break;
  }

  // 具体单词建议
  const missedWords = targetWords.filter(word => !userWords.includes(word));
  if (missedWords.length > 0 && missedWords.length <= 5) {
    suggestions.push(`Focus on these words: ${missedWords.join(', ')}`);
  }

  // 语速建议
  const targetLength = targetWords.length;
  const userLength = userWords.length;

  if (userLength > targetLength * 1.5) {
    suggestions.push('Try to speak more clearly and distinctly');
  } else if (userLength < targetLength * 0.5) {
    suggestions.push('Don\'t be afraid to speak more clearly');
  }

  return suggestions;
};

/**
 * 影子跟读分析
 * @param {string} targetText - 目标文本
 * @param {string} userText - 用户跟读结果
 * @param {number} startTime - 开始时间
 * @param {number} endTime - 结束时间
 * @returns {Object} 跟读分析结果
 */
export const analyzeShadowReading = (targetText, userText, startTime, endTime) => {
  const duration = (endTime - startTime) / 1000; // 转换为秒
  const targetWords = targetText.split(/\s+/).length;
  const wordsPerMinute = (userText.split(/\s+/).length / duration) * 60;

  const pronunciationScore = calculatePronunciationScore(targetText, userText);

  // 语速评估
  let speedGrade;
  if (wordsPerMinute < 100) {
    speedGrade = 'slow';
  } else if (wordsPerMinute < 150) {
    speedGrade = 'normal';
  } else if (wordsPerMinute < 200) {
    speedGrade = 'fast';
  } else {
    speedGrade = 'very_fast';
  }

  // 节奏分析（简化版）
  const rhythmScore = calculateRhythmScore(targetText, userText);

  return {
    ...pronunciationScore,
    speed: {
      wpm: Math.round(wordsPerMinute),
      grade: speedGrade,
      targetWpm: 150, // 推荐语速
    },
    rhythm: rhythmScore,
    duration: Math.round(duration * 10) / 10,
    completeness: (userText.split(/\s+/).length / targetWords) * 100,
  };
};

/**
 * 计算节奏评分
 * @param {string} targetText - 目标文本
 * @param {string} userText - 用户文本
 * @returns {Object} 节奏分析
 */
const calculateRhythmScore = (targetText, userText) => {
  const targetWords = targetText.split(/\s+/);
  const userWords = userText.split(/\s+/);

  // 简化的节奏分析：基于单词长度和停顿模式
  const targetPattern = targetWords.map(word => word.length);
  const userPattern = userWords.slice(0, targetWords.length).map(word => word.length);

  // 计算模式相似度
  let patternSimilarity = 0;
  const minLength = Math.min(targetPattern.length, userPattern.length);

  for (let i = 0; i < minLength; i++) {
    const diff = Math.abs(targetPattern[i] - userPattern[i]);
    const maxLen = Math.max(targetPattern[i], userPattern[i]);
    if (maxLen > 0) {
      patternSimilarity += (1 - diff / maxLen);
    }
  }

  const rhythmScore = minLength > 0 ? (patternSimilarity / minLength) * 100 : 0;

  return {
    score: Math.round(rhythmScore),
    pattern: userPattern,
    targetPattern: targetPattern,
  };
};

/**
 * 获取发音练习材料
 * @param {string} level - 难度级别
 * @returns {Array} 练习材料
 */
export const getPronunciationMaterials = (level = 'beginner') => {
  const materials = {
    beginner: [
      {
        id: 'pron_001',
        text: 'Hello, how are you today?',
        category: 'greetings',
        audioUrl: null,
        difficulty: 'easy',
        focusWords: ['hello', 'today'],
      },
      {
        id: 'pron_002',
        text: 'I like to read books.',
        category: 'hobbies',
        audioUrl: null,
        difficulty: 'easy',
        focusWords: ['like', 'books'],
      },
      {
        id: 'pron_003',
        text: 'The weather is nice today.',
        category: 'weather',
        audioUrl: null,
        difficulty: 'easy',
        focusWords: ['weather', 'nice'],
      },
    ],
    intermediate: [
      {
        id: 'pron_004',
        text: 'Communication is essential for success.',
        category: 'business',
        audioUrl: null,
        difficulty: 'medium',
        focusWords: ['communication', 'essential'],
      },
      {
        id: 'pron_005',
        text: 'Technology has transformed our daily lives.',
        category: 'technology',
        audioUrl: null,
        difficulty: 'medium',
        focusWords: ['technology', 'transformed'],
      },
    ],
  };

  return materials[level] || materials.beginner;
};