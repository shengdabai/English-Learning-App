/**
 * 用户配置管理服务
 * 处理用户数据存储、学习进度跟踪和成就系统
 */

const USER_PROFILE_KEY = 'english_learning_user_profile';
const LEARNING_SESSION_KEY = 'english_learning_session';

/**
 * 加载用户配置
 * @returns {Object|null} 用户配置对象
 */
export const loadUserProfile = () => {
  try {
    const profile = localStorage.getItem(USER_PROFILE_KEY);
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
};

/**
 * 保存用户配置
 * @param {Object} profile - 用户配置对象
 */
export const saveUserProfile = (profile) => {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
};

/**
 * 开始学习会话
 * @param {string} type - 学习类型 (reading, speaking, conversation)
 * @returns {Object} 会话信息
 */
export const startLearningSession = (type) => {
  const session = {
    id: Date.now(),
    type: type,
    startTime: new Date().toISOString(),
    duration: 0,
    completed: false,
    score: null,
  };

  localStorage.setItem(LEARNING_SESSION_KEY, JSON.stringify(session));
  return session;
};

/**
 * 结束学习会话
 * @param {number} score - 会话得分 (0-100)
 * @returns {Object} 更新的用户配置
 */
export const endLearningSession = (score) => {
  try {
    const sessionData = localStorage.getItem(LEARNING_SESSION_KEY);
    const userProfile = loadUserProfile();

    if (!sessionData || !userProfile) {
      return null;
    }

    const session = JSON.parse(sessionData);
    const endTime = new Date();
    const duration = Math.floor((new Date(endTime) - new Date(session.startTime)) / 1000 / 60); // 分钟

    // 更新会话信息
    session.endTime = endTime.toISOString();
    session.duration = duration;
    session.score = score;
    session.completed = true;

    // 更新用户配置
    const updatedProfile = {
      ...userProfile,
      totalMinutes: userProfile.totalMinutes + duration,
      sessions: [...(userProfile.sessions || []), session],
    };

    // 检查连续学习天数
    const today = new Date().toDateString();
    const lastActive = userProfile.lastActiveDate ? new Date(userProfile.lastActiveDate).toDateString() : null;

    if (lastActive === today) {
      // 今天已经活跃，不增加连续天数
      updatedProfile.streak = userProfile.streak;
    } else if (isYesterday(userProfile.lastActiveDate)) {
      // 昨天活跃，连续天数+1
      updatedProfile.streak = userProfile.streak + 1;
    } else {
      // 超过一天没学习，重置连续天数
      updatedProfile.streak = 1;
    }

    updatedProfile.lastActiveDate = endTime.toISOString();

    // 检查成就
    updatedProfile.achievements = checkAchievements(updatedProfile);

    // 保存更新后的配置
    saveUserProfile(updatedProfile);
    localStorage.removeItem(LEARNING_SESSION_KEY);

    return updatedProfile;
  } catch (error) {
    console.error('Error ending learning session:', error);
    return null;
  }
};

/**
 * 检查是否是昨天
 * @param {string} dateString - 日期字符串
 * @returns {boolean} 是否是昨天
 */
const isYesterday = (dateString) => {
  if (!dateString) return false;

  const date = new Date(dateString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return date.toDateString() === yesterday.toDateString();
};

/**
 * 检查成就
 * @param {Object} profile - 用户配置
 * @returns {Array} 成就列表
 */
const checkAchievements = (profile) => {
  const achievements = [...(profile.achievements || [])];
  const achievementIds = new Set(achievements.map(a => a.id));

  // 首次学习
  if (profile.totalMinutes >= 1 && !achievementIds.has('first_step')) {
    achievements.push({
      id: 'first_step',
      name: '初学者',
      description: '完成首次学习',
      unlockedAt: new Date().toISOString(),
      icon: '🎯'
    });
  }

  // 学习30分钟
  if (profile.totalMinutes >= 30 && !achievementIds.has('thirty_minutes')) {
    achievements.push({
      id: 'thirty_minutes',
      name: '坚持者',
      description: '累计学习30分钟',
      unlockedAt: new Date().toISOString(),
      icon: '⏰'
    });
  }

  // 连续学习7天
  if (profile.streak >= 7 && !achievementIds.has('week_streak')) {
    achievements.push({
      id: 'week_streak',
      name: '一周勇士',
      description: '连续学习7天',
      unlockedAt: new Date().toISOString(),
      icon: '🔥'
    });
  }

  // 学习10小时
  if (profile.totalMinutes >= 600 && !achievementIds.has('ten_hours')) {
    achievements.push({
      id: 'ten_hours',
      name: '英语达人',
      description: '累计学习10小时',
      unlockedAt: new Date().toISOString(),
      icon: '⭐'
    });
  }

  return achievements;
};

/**
 * 获取学习统计
 * @returns {Object} 学习统计数据
 */
export const getLearningStats = () => {
  const profile = loadUserProfile();
  if (!profile || !profile.sessions) {
    return {
      totalMinutes: 0,
      totalSessions: 0,
      averageScore: 0,
      sessionsByType: {},
      recentActivity: [],
    };
  }

  const sessions = profile.sessions;
  const totalMinutes = profile.totalMinutes;
  const totalSessions = sessions.length;
  const averageScore = sessions.length > 0
    ? sessions.reduce((sum, session) => sum + (session.score || 0), 0) / sessions.length
    : 0;

  // 按类型统计
  const sessionsByType = sessions.reduce((acc, session) => {
    acc[session.type] = (acc[session.type] || 0) + 1;
    return acc;
  }, {});

  // 最近活动（最近7天）
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentActivity = sessions
    .filter(session => new Date(session.startTime) >= sevenDaysAgo)
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  return {
    totalMinutes,
    totalSessions,
    averageScore: Math.round(averageScore),
    sessionsByType,
    recentActivity,
    streak: profile.streak,
  };
};