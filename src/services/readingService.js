/**
 * 阅读模块服务
 * 提供分级阅读材料、AI辅助理解和词汇学习功能
 */

// 模拟阅读材料数据
const READING_MATERIALS = {
  beginner: [
    {
      id: 'beginner_001',
      title: 'My First Day at School',
      level: 'A1',
      category: 'daily_life',
      content: `It was my first day at school. I was nervous but excited.

My mother walked with me to the school gate. "Have a good day!" she said.

The classroom was big and bright. My teacher, Ms. Smith, smiled at me. "Welcome to our class!"

There were many other children. Some were reading books. Some were playing with blocks.

I sat at a small desk. The desk had a red chair. I liked my desk.

At lunchtime, I ate a sandwich and an apple. It was delicious.

After school, my mother was waiting for me. "How was your day?" she asked.

"It was great!" I said. "I made new friends!"

School is fun. I can't wait to go back tomorrow.`,
      vocabulary: [
        { word: 'nervous', definition: 'feeling worried or slightly afraid', example: 'I was nervous before the test.' },
        { word: 'excited', definition: 'very happy and enthusiastic', example: 'The children were excited about the trip.' },
        { word: 'classroom', definition: 'a room where students have lessons', example: 'Our classroom has many windows.' },
        { word: 'delicious', definition: 'very pleasant to taste', example: 'The cake was delicious.' },
      ],
      questions: [
        { question: 'How did the student feel on the first day?', answer: 'Nervous but excited' },
        { question: 'What was the teacher\'s name?', answer: 'Ms. Smith' },
        { question: 'What did the student eat for lunch?', answer: 'A sandwich and an apple' },
      ],
      audioUrl: null,
      estimatedTime: 5, // 分钟
    },
    {
      id: 'beginner_002',
      title: 'A Trip to the Zoo',
      level: 'A1',
      category: 'animals',
      content: `Last Sunday, my family and I went to the zoo.

The weather was sunny and warm. We took a bus to get there.

First, we saw the monkeys. They were jumping from tree to tree. One monkey was eating a banana.

Next, we visited the lions. The big lion was sleeping in the sun. The small lions were playing with a ball.

Then we went to the elephant area. The elephants were huge! One elephant was taking a shower with its trunk.

We also saw colorful birds. Some birds could talk! They said "Hello" to us.

My favorite animal was the panda. It was black and white and very cute. It was eating bamboo.

We stayed at the zoo for four hours. I took many photos with my phone.

Before leaving, we bought ice cream. Mine was chocolate flavor.

The zoo visit was wonderful. I want to go again soon!`,
      vocabulary: [
        { word: 'weather', definition: 'the condition of the atmosphere', example: 'The weather is nice today.' },
        { word: 'monkey', definition: 'a small to medium-sized primate', example: 'Monkeys like to eat bananas.' },
        { word: 'elephant', definition: 'a very large mammal with a trunk', example: 'Elephants are intelligent animals.' },
        { word: 'favorite', definition: 'preferred above all others', example: 'Blue is my favorite color.' },
      ],
      questions: [
        { question: 'What day did they go to the zoo?', answer: 'Last Sunday' },
        { question: 'What was the writer\'s favorite animal?', answer: 'The panda' },
        { question: 'How long did they stay at the zoo?', answer: 'Four hours' },
      ],
      audioUrl: null,
      estimatedTime: 6,
    },
  ],
  intermediate: [
    {
      id: 'intermediate_001',
      title: 'The Benefits of Reading',
      level: 'B1',
      category: 'education',
      content: `Reading is one of the most valuable skills we can develop. It opens doors to new worlds, ideas, and perspectives. In today's digital age, the importance of reading has not diminished; if anything, it has become even more crucial.

When we read regularly, our vocabulary expands significantly. Research shows that people who read daily learn approximately 4,000 to 12,000 new words each year. This vocabulary growth doesn't just improve our communication skills; it also enhances our ability to think and express complex ideas.

Reading also improves our concentration and focus. In a world filled with distractions, the ability to concentrate on a single task for an extended period is increasingly rare. When we read a book, we train our minds to focus on one thing for hours at a time. This skill transfers to other areas of our lives, making us more productive and effective.

Moreover, reading develops critical thinking skills. When we engage with different viewpoints and arguments, we learn to analyze information, question assumptions, and form our own opinions. This mental exercise strengthens our cognitive abilities and makes us more informed citizens.

The emotional benefits of reading are equally important. Reading fiction, in particular, has been shown to increase empathy. By putting ourselves in characters' shoes, we develop a better understanding of human emotions and motivations. This increased empathy can improve our relationships and make us more compassionate individuals.

Reading also serves as a form of mental exercise. Just like physical exercise keeps our bodies healthy, reading keeps our minds sharp. Studies suggest that regular reading can help prevent cognitive decline as we age, potentially reducing the risk of conditions like Alzheimer's disease.

In conclusion, reading is not just a hobby or a way to pass time; it's a powerful tool for personal growth. Whether you prefer fiction, non-fiction, news, or poetry, making reading a daily habit will enrich your life in countless ways.`,
      vocabulary: [
        { word: 'valuable', definition: 'very useful or important', example: 'Time is a valuable resource.' },
        { word: 'diminished', definition: 'became or made smaller', example: 'The resources diminished over time.' },
        { word: 'concentration', definition: 'the action of focusing one\'s attention', example: 'The task requires great concentration.' },
        { word: 'cognitive', definition: 'relating to mental processes', example: 'Reading improves cognitive abilities.' },
        { word: 'empathy', definition: 'the ability to understand others\' feelings', example: 'Reading fiction can increase empathy.' },
      ],
      questions: [
        { question: 'How many new words can daily readers learn per year?', answer: '4,000 to 12,000' },
        { question: 'What skill does reading help improve besides vocabulary?', answer: 'Concentration and focus' },
        { question: 'What emotional benefit does reading fiction provide?', answer: 'It increases empathy' },
      ],
      audioUrl: null,
      estimatedTime: 8,
    },
  ],
};

/**
 * 根据用户级别获取阅读材料
 * @param {string} level - 用户级别 (beginner, intermediate, advanced)
 * @returns {Array} 阅读材料列表
 */
export const getReadingMaterials = (level = 'beginner') => {
  return READING_MATERIALS[level] || READING_MATERIALS.beginner;
};

/**
 * 获取特定的阅读材料
 * @param {string} materialId - 材料ID
 * @param {string} level - 用户级别
 * @returns {Object|null} 阅读材料
 */
export const getReadingMaterial = (materialId, level = 'beginner') => {
  const materials = getReadingMaterials(level);
  return materials.find(material => material.id === materialId) || null;
};

/**
 * 根据类别获取阅读材料
 * @param {string} category - 类别
 * @param {string} level - 用户级别
 * @returns {Array} 过滤后的阅读材料列表
 */
export const getMaterialsByCategory = (category, level = 'beginner') => {
  const materials = getReadingMaterials(level);
  return materials.filter(material => material.category === category);
};

/**
 * 获取所有类别
 * @param {string} level - 用户级别
 * @returns {Array} 类别列表
 */
export const getCategories = (level = 'beginner') => {
  const materials = getReadingMaterials(level);
  const categories = new Set(materials.map(material => material.category));
  return Array.from(categories);
};

/**
 * 搜索阅读材料
 * @param {string} query - 搜索关键词
 * @param {string} level - 用户级别
 * @returns {Array} 搜索结果
 */
export const searchMaterials = (query, level = 'beginner') => {
  const materials = getReadingMaterials(level);
  const searchQuery = query.toLowerCase();

  return materials.filter(material => {
    return material.title.toLowerCase().includes(searchQuery) ||
           material.content.toLowerCase().includes(searchQuery) ||
           material.vocabulary.some(vocab => vocab.word.toLowerCase().includes(searchQuery));
  });
};

/**
 * 获取用户阅读历史
 * @returns {Array} 阅读历史记录
 */
export const getReadingHistory = () => {
  try {
    const history = localStorage.getItem('reading_history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading reading history:', error);
    return [];
  }
};

/**
 * 保存阅读记录
 * @param {Object} record - 阅读记录
 */
export const saveReadingRecord = (record) => {
  try {
    const history = getReadingHistory();
    const newRecord = {
      ...record,
      timestamp: new Date().toISOString(),
      id: Date.now(),
    };
    history.unshift(newRecord);

    // 只保留最近50条记录
    const trimmedHistory = history.slice(0, 50);
    localStorage.setItem('reading_history', JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error saving reading record:', error);
  }
};

/**
 * 生成阅读理解题
 * @param {string} content - 文章内容
 * @returns {Array} 生成的题目
 */
export const generateComprehensionQuestions = (content) => {
  // Use the supplied questions belonging to this passage, rather than inventing
  // generic questions whose answers cannot be established from the material.
  const material = Object.values(READING_MATERIALS).flat()
    .find(item => item.content === content);
  if (!material) return [];

  const options = material.questions.map(item => item.answer);
  return material.questions.map((item, index) => {
    const choices = [...options];
    // Shuffle a copy so the answer's position does not reveal the question index.
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return {
      id: `${material.id}_${index}`,
      type: 'detail',
      question: item.question,
      options: choices,
      correctAnswer: choices.indexOf(item.answer),
    };
  });
};

/** Score the same question set shown to the learner. Unanswered items are wrong. */
export const scoreComprehensionQuiz = (questions, answers) => {
  const correctAnswers = questions.filter((question, index) =>
    Number.isInteger(answers[index]) && answers[index] === question.correctAnswer
  ).length;
  return {
    score: questions.length ? Math.round(correctAnswers / questions.length * 100) : 0,
    correctAnswers,
    totalQuestions: questions.length,
  };
};
