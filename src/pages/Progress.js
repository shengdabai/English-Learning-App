import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  Button,
  IconButton,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  Schedule,
  MenuBook as BookOpen,
  Mic,
  ChatBubbleOutline as MessageCircle,
  EmojiEvents,
  CalendarToday,
  GpsFixed as Target,
  Assessment,
  Refresh,
  Download,
} from '@mui/icons-material';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { getLearningStats } from '../services/userService';
import { getReadingHistory } from '../services/readingService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

const Progress = ({ userProfile }) => {
  const [stats, setStats] = useState(null);
  const [readingHistory, setReadingHistory] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const learningStats = getLearningStats();
    const history = getReadingHistory();

    setStats(learningStats);
    setReadingHistory(history);
    setLoading(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // 准备图表数据
  const prepareWeeklyData = () => {
    if (!stats?.recentActivity) return { labels: [], data: [] };

    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push(date);
    }

    const dailyMinutes = last7Days.map(date => {
      const dateStr = date.toDateString();
      const daySessions = stats.recentActivity.filter(
        session => new Date(session.startTime).toDateString() === dateStr
      );
      return daySessions.reduce((total, session) => total + (session.duration || 0), 0);
    });

    return {
      labels: last7Days.map(date => formatDate(date)),
      data: dailyMinutes,
    };
  };

  const prepareModuleData = () => {
    if (!stats?.sessionsByType) return {};

    const colors = {
      reading: '#1976d2',
      speaking: '#dc004e',
      conversation: '#2e7d32',
    };

    const labels = {
      reading: '阅读理解',
      speaking: '口语练习',
      conversation: '对话练习',
    };

    const data = Object.entries(stats.sessionsByType).map(([type, count]) => ({
      label: labels[type] || type,
      value: count,
      color: colors[type] || '#666',
    }));

    return data;
  };

  const weeklyData = prepareWeeklyData();
  const moduleData = prepareModuleData();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '最近7天学习时间',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '学习时间 (分钟)',
        },
      },
    },
  };

  const weeklyChartData = {
    labels: weeklyData.labels,
    datasets: [
      {
        label: '学习时间',
        data: weeklyData.data,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const moduleChartData = {
    labels: moduleData.map(item => item.label),
    datasets: [
      {
        data: moduleData.map(item => item.value),
        backgroundColor: moduleData.map(item => item.color),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>加载中...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          学习进度
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadData}
        >
          刷新数据
        </Button>
      </Box>

      {/* 综合统计卡片 */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Schedule color="primary" />
                <Typography variant="h6" ml={1}>
                  总学习时间
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatTime(stats?.totalMinutes || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                相当于 {Math.floor((stats?.totalMinutes || 0) / 60)} 小时专注学习
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <BookOpen color="success" />
                <Typography variant="h6" ml={1}>
                  学习会话
                </Typography>
              </Box>
              <Typography variant="h4" color="success">
                {stats?.totalSessions || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                完成学习会话次数
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Assessment color="warning" />
                <Typography variant="h6" ml={1}>
                  平均得分
                </Typography>
              </Box>
              <Typography variant="h4" color="warning">
                {stats?.averageScore || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                所有练习平均成绩
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Target color="info" />
                <Typography variant="h6" ml={1}>
                  连续天数
                </Typography>
              </Box>
              <Typography variant="h4" color="info">
                {stats?.streak || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                连续学习天数
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 标签页 */}
      <Box mb={3}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="学习趋势" />
          <Tab label="模块分布" />
          <Tab label="详细记录" />
          <Tab label="成就系统" />
        </Tabs>
      </Box>

      {/* 学习趋势 */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  最近7天学习时间
                </Typography>
                <Box sx={{ height: 300, position: 'relative' }}>
                  <Line data={weeklyChartData} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  本周总结
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="学习天数"
                      secondary={`${weeklyData.data.filter(d => d > 0).length} / 7 天`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Schedule color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="总时间"
                      secondary={formatTime(weeklyData.data.reduce((a, b) => a + b, 0))}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="日均学习"
                      secondary={formatTime(Math.round(weeklyData.data.reduce((a, b) => a + b, 0) / 7))}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Target color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="目标完成"
                      secondary={`${Math.round((weeklyData.data.reduce((a, b) => a + b, 0) / (userProfile.dailyGoal * 7)) * 100)}%`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 模块分布 */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  学习模块分布
                </Typography>
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                  <Doughnut
                    data={moduleChartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  模块详细统计
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>模块</TableCell>
                        <TableCell align="right">完成次数</TableCell>
                        <TableCell align="right">占比</TableCell>
                        <TableCell align="right">平均得分</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {moduleData.map((module, index) => (
                        <TableRow key={index}>
                          <TableCell component="th" scope="row">
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar sx={{ width: 24, height: 24, bgcolor: module.color }}>
                                {module.label[0]}
                              </Avatar>
                              {module.label}
                            </Box>
                          </TableCell>
                          <TableCell align="right">{module.value}</TableCell>
                          <TableCell align="right">
                            {stats?.totalSessions > 0
                              ? Math.round((module.value / stats.totalSessions) * 100)
                              : 0}%
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label="85%"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 详细记录 */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  最近学习记录
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>日期</TableCell>
                        <TableCell>模块</TableCell>
                        <TableCell>时长</TableCell>
                        <TableCell>得分</TableCell>
                        <TableCell>状态</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats?.recentActivity?.slice(0, 10).map((session, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {formatDate(session.startTime)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                session.type === 'reading' ? '阅读' :
                                session.type === 'speaking' ? '口语' :
                                session.type === 'conversation' ? '对话' : session.type
                              }
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {formatTime(session.duration || 0)}
                          </TableCell>
                          <TableCell>
                            {session.score ? `${session.score}%` : '-'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label="已完成"
                              size="small"
                              color="success"
                              variant="filled"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography variant="body2" color="text.secondary">
                              暂无学习记录
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  学习建议
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  基于你的学习数据，我们为你提供个性化建议
                </Alert>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="保持每日学习习惯"
                      secondary="连续学习有助于长期记忆保持"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="增加口语练习"
                      secondary="口语是实际应用的关键技能"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="尝试不同难度材料"
                      secondary="适度的挑战有助于快速进步"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="复习已学内容"
                      secondary="定期复习能巩固学习效果"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 成就系统 */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  获得成就
                </Typography>
                <Grid container spacing={2}>
                  {userProfile?.achievements?.map((achievement, index) => (
                    <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                      <Paper
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                        }}
                      >
                        <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
                          {achievement.icon}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6" component="h3">
                            {achievement.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {achievement.description}
                          </Typography>
                          <Typography variant="caption" color="primary">
                            {formatDate(achievement.unlockedAt)}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                  {(!userProfile?.achievements || userProfile.achievements.length === 0) && (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        开始学习来解锁成就吧！完成各种学习任务可以获得不同的成就徽章。
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  待解锁成就
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <EmojiEvents color="disabled" />
                    </ListItemIcon>
                    <ListItemText
                      primary="月度学习者"
                      secondary="连续学习30天"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmojiEvents color="disabled" />
                    </ListItemIcon>
                    <ListItemText
                      primary="阅读达人"
                      secondary="完成50篇阅读材料"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmojiEvents color="disabled" />
                    </ListItemIcon>
                    <ListItemText
                      primary="口语流利"
                      secondary="口语练习得分超过90分"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmojiEvents color="disabled" />
                    </ListItemIcon>
                    <ListItemText
                      primary="对话高手"
                      secondary="完成30次对话练习"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  成就进度
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="成就完成度"
                      secondary={
                        <Box mt={1}>
                          <LinearProgress
                            variant="determinate"
                            value={
                              userProfile?.achievements?.length
                                ? (userProfile.achievements.length / 10) * 100
                                : 0
                            }
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {userProfile?.achievements?.length || 0} / 10 成就
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Progress;