import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Avatar,
  Chip,
  Container,
} from '@mui/material';
import {
  MenuBook as BookOpen,
  Mic,
  ChatBubbleOutline as MessageCircle,
  TrendingUp,
  Settings,
  CalendarToday as Calendar,
  AccessTime as Clock,
  Star,
} from '@mui/icons-material';

import { getLearningStats } from '../services/userService';
import { startLearningSession } from '../services/userService';

const Home = ({ userProfile }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = () => {
      const learningStats = getLearningStats();
      setStats(learningStats);
      setLoading(false);
    };

    loadStats();
  }, []);

  const handleModuleClick = (moduleType) => {
    // 开始学习会话
    startLearningSession(moduleType);

    // 导航到相应模块
    const modulePaths = {
      reading: '/reading',
      speaking: '/speaking',
      conversation: '/conversation',
      progress: '/progress',
    };

    if (modulePaths[moduleType]) {
      window.location.href = modulePaths[moduleType];
    }
  };

  const getDailyProgress = () => {
    if (!userProfile.dailyGoal) return 0;

    // 计算今日学习时间
    const today = new Date().toDateString();
    const todayMinutes = stats?.recentActivity
      ?.filter(session => new Date(session.startTime).toDateString() === today)
      ?.reduce((total, session) => total + (session.duration || 0), 0) || 0;

    return Math.min(100, (todayMinutes / userProfile.dailyGoal) * 100);
  };

  const getMotivationalMessage = () => {
    const streak = userProfile.streak || 0;
    const messages = {
      0: "开始你的英语学习之旅！",
      1: "很好！继续保持学习的动力。",
      3: "连续学习3天，你正在养成好习惯！",
      7: "一周的学习，太棒了！",
      14: "两周坚持不懈，英语正在进步！",
      30: "一个月的坚持，你已经成为了学习者！",
    };

    // 找到最接近的消息
    const keys = Object.keys(messages).map(Number).sort((a, b) => b - a);
    for (const key of keys) {
      if (streak >= key) {
        return messages[key];
      }
    }

    return messages[0];
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography>加载中...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* 欢迎区域 */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          欢迎回来！
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {getMotivationalMessage()}
        </Typography>
      </Box>

      {/* 学习进度概览 */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Calendar color="primary" />
                <Typography variant="h6" ml={1}>
                  连续学习
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {userProfile.streak || 0} 天
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Clock color="primary" />
                <Typography variant="h6" ml={1}>
                  总学习时间
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {Math.floor((userProfile.totalMinutes || 0) / 60)}h {((userProfile.totalMinutes || 0) % 60)}m
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUp color="primary" />
                <Typography variant="h6" ml={1}>
                  平均得分
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {stats?.averageScore || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Star color="primary" />
                <Typography variant="h6" ml={1}>
                  成就数
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {userProfile.achievements?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 今日目标进度 */}
      <Card mb={4}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            今日目标 ({userProfile.dailyGoal} 分钟)
          </Typography>
          <Box display="flex" alignItems="center" mb={1}>
            <Box width="100%" mr={1}>
              <LinearProgress
                variant="determinate"
                value={getDailyProgress()}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Box minWidth={35}>
              <Typography variant="body2" color="text.secondary">
                {`${Math.round(getDailyProgress())}%`}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 学习模块 */}
      <Typography variant="h5" gutterBottom>
        开始学习
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
            onClick={() => handleModuleClick('reading')}
          >
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                <Avatar sx={{ bgcolor: 'primary.main', mb: 2, width: 56, height: 56 }}>
                  <BookOpen />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  阅读理解
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  分级阅读材料，提升理解能力
                </Typography>
                <Button variant="contained" size="small">
                  开始阅读
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
            onClick={() => handleModuleClick('speaking')}
          >
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                <Avatar sx={{ bgcolor: 'secondary.main', mb: 2, width: 56, height: 56 }}>
                  <Mic />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  口语练习
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  AI发音评估，提升口语流利度
                </Typography>
                <Button variant="contained" color="secondary" size="small">
                  开始练习
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
            onClick={() => handleModuleClick('conversation')}
          >
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                <Avatar sx={{ bgcolor: 'success.main', mb: 2, width: 56, height: 56 }}>
                  <MessageCircle />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  对话练习
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  AI对话伙伴，情景化练习
                </Typography>
                <Button variant="contained" color="success" size="small">
                  开始对话
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
            onClick={() => handleModuleClick('progress')}
          >
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                <Avatar sx={{ bgcolor: 'info.main', mb: 2, width: 56, height: 56 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  学习进度
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  查看详细学习数据和分析
                </Typography>
                <Button variant="contained" color="info" size="small">
                  查看详情
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 最近成就 */}
      {userProfile.achievements && userProfile.achievements.length > 0 && (
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            最近成就
          </Typography>
          <Grid container spacing={2}>
            {userProfile.achievements.slice(-4).map((achievement) => (
              <Grid item key={achievement.id}>
                <Chip
                  avatar={<Avatar>{achievement.icon}</Avatar>}
                  label={achievement.name}
                  variant="outlined"
                  color="primary"
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default Home;