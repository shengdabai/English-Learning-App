import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  Paper,
  LinearProgress,
  Fab,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  Send,
  Mic,
  MicOff,
  VolumeUp,
  VolumeOff,
  Chat,
  Person,
  SmartToy,
  Translate,
  Language,
  Settings,
  Refresh,
} from '@mui/icons-material';

import {
  startSpeechRecognition,
  stopSpeechRecognition,
  textToSpeech,
  checkSpeechSupport,
} from '../services/speechService';
import { endLearningSession } from '../services/userService';

const Conversation = ({ userProfile, updateUserProfile }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [speechSupport, setSpeechSupport] = useState(null);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    messageCount: 0,
    speakingTime: 0,
    startTime: null,
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 对话场景
  const scenarios = [
    {
      id: 'restaurant',
      title: '餐厅点餐',
      description: '练习在餐厅用英语点餐和交流',
      difficulty: 'beginner',
      context: 'You are a customer at a restaurant. The waiter will help you order food.',
      starterMessage: 'Welcome to our restaurant! How can I help you today?',
      icon: '🍽️',
      vocabulary: ['menu', 'order', 'recommend', 'delicious', 'check'],
    },
    {
      id: 'airport',
      title: '机场问询',
      description: '练习在机场询问信息和方向',
      difficulty: 'intermediate',
      context: 'You are at an airport and need to find your gate.',
      starterMessage: 'Excuse me, how can I help you at the airport?',
      icon: '✈️',
      vocabulary: ['gate', 'boarding', 'security', 'departure', 'arrival'],
    },
    {
      id: 'job_interview',
      title: '求职面试',
      description: '练习英语求职面试对话',
      difficulty: 'advanced',
      context: 'You are in a job interview. Answer questions about your experience and skills.',
      starterMessage: 'Good morning! Thank you for coming in today. Can you tell me about yourself?',
      icon: '💼',
      vocabulary: ['experience', 'skills', 'position', 'company', 'opportunity'],
    },
    {
      id: 'doctor_visit',
      title: '看医生',
      description: '练习描述症状和医疗咨询',
      difficulty: 'intermediate',
      context: 'You are visiting a doctor. Describe your symptoms and ask for advice.',
      starterMessage: 'Hello! What brings you to see me today?',
      icon: '🏥',
      vocabulary: ['symptoms', 'prescription', 'appointment', 'treatment', 'medicine'],
    },
    {
      id: 'hotel_checkin',
      title: '酒店入住',
      description: '练习酒店入住和退房流程',
      difficulty: 'beginner',
      context: 'You are checking into a hotel.',
      starterMessage: 'Welcome to our hotel! Do you have a reservation with us?',
      icon: '🏨',
      vocabulary: ['reservation', 'check-in', 'room', 'key', 'checkout'],
    },
  ];

  useEffect(() => {
    const support = checkSpeechSupport();
    setSpeechSupport(support);

    if (!support.speechRecognition) {
      setError('您的浏览器不支持语音识别功能。');
    }

    // 添加欢迎消息
    const welcomeMessage = {
      id: Date.now(),
      sender: 'ai',
      text: '欢迎来到对话练习！请选择一个对话场景开始练习。',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScenarioSelect = (scenario) => {
    setCurrentScenario(scenario);

    // 清空消息历史
    const scenarioMessage = {
      id: Date.now(),
      sender: 'ai',
      text: `开始场景: ${scenario.title}\n\n${scenario.context}\n\n${scenario.starterMessage}`,
      timestamp: new Date(),
      scenario: scenario.id,
    };
    setMessages([scenarioMessage]);

    // 朗读AI消息
    setTimeout(() => {
      handlePlayText(scenarioMessage.text);
    }, 1000);

    // 开始会话统计
    setSessionStats({
      messageCount: 0,
      speakingTime: 0,
      startTime: new Date(),
    });

    // 开始学习会话
    setStartTime(Date.now());
  };

  const handlePlayText = async (text) => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      try {
        setIsPlaying(true);
        await textToSpeech(text, {
          rate: userProfile.preferences?.voiceSpeed || 1.0,
          lang: 'en-US',
        });
        setIsPlaying(false);
      } catch (error) {
        console.error('Text to speech error:', error);
        setIsPlaying(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !isRecording) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // 更新统计
    setSessionStats(prev => ({
      ...prev,
      messageCount: prev.messageCount + 1,
    }));

    // 模拟AI回复
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage.text, currentScenario);
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // 自动朗读AI回复
      if (userProfile.preferences?.autoPlay) {
        setTimeout(() => {
          handlePlayText(aiResponse);
        }, 500);
      }
    }, 1000 + Math.random() * 2000);
  };

  const generateAIResponse = (userMessage, scenario) => {
    // 简化的AI回复逻辑
    const responses = {
      restaurant: [
        "That sounds like a great choice! Would you like something to drink with that?",
        "Excellent! Our chef's special is very popular today.",
        "Of course! Let me tell you about our daily specials.",
      ],
      airport: [
        "Your gate is B27. You should go through security first.",
        "The flight will board in about 45 minutes.",
        "You can find the information desk just around the corner.",
      ],
      job_interview: [
        "That's very interesting. Can you tell me more about your previous experience?",
        "Great! What skills do you think make you a good fit for this position?",
        "Thank you for sharing. Do you have any questions for us?",
      ],
      doctor_visit: [
        "I see. How long have you been experiencing these symptoms?",
        "Let me check that for you. Have you taken any medication?",
        "I'll prescribe something for you. Take it twice daily with meals.",
      ],
      hotel_checkin: [
        "Perfect! I can see your reservation for a deluxe room.",
        "Your room is on the 5th floor. Here's your key card.",
        "Breakfast is served from 7 AM to 10 AM in the restaurant.",
      ],
    };

    const scenarioResponses = responses[scenario?.id] || [
      "That's interesting! Tell me more about that.",
      "I understand. How does that make you feel?",
      "Thank you for sharing. What would you like to know next?",
    ];

    return scenarioResponses[Math.floor(Math.random() * scenarioResponses.length)];
  };

  const handleStartRecording = () => {
    if (!speechSupport?.speechRecognition) {
      setError('语音识别不可用。');
      return;
    }

    setError('');

    const recognitionInstance = startSpeechRecognition(
      (result) => {
        if (result.isFinal) {
          setInputText(result.transcript);
          handleStopRecording();
          setTimeout(() => handleSendMessage(), 100);
        }
      },
      (error) => {
        console.error('Speech recognition error:', error);
        setError(`语音识别错误: ${error.message}`);
        handleStopRecording();
      }
    );

    if (recognitionInstance) {
      setRecognition(recognitionInstance);
      setIsRecording(true);
    }
  };

  const handleStopRecording = () => {
    if (recognition) {
      stopSpeechRecognition(recognition);
    }
    setIsRecording(false);
    setRecognition(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEndConversation = async () => {
    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime) / 1000 / 60); // 分钟

    // 计算会话得分（基于消息数量和时长）
    const messageScore = Math.min(100, sessionStats.messageCount * 10);
    const durationScore = Math.min(100, (duration / 10) * 100); // 10分钟满分
    const finalScore = Math.round((messageScore + durationScore) / 2);

    const updatedProfile = await endLearningSession(finalScore);
    if (updatedProfile) {
      updateUserProfile(updatedProfile);
    }

    // 重置状态
    setCurrentScenario(null);
    setMessages([{
      id: Date.now(),
      sender: 'ai',
      text: `对话练习完成！\n\n统计信息：\n- 对话时长: ${duration}分钟\n- 消息数量: ${sessionStats.messageCount}条\n- 综合评分: ${finalScore}分\n\n选择一个新场景继续练习吧！`,
      timestamp: new Date(),
    }]);
    setStartTime(null);
    setSessionStats({
      messageCount: 0,
      speakingTime: 0,
      startTime: null,
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!currentScenario) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          对话练习
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          选择一个场景，开始与AI进行英语对话练习
        </Typography>

        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {scenarios.map((scenario) => (
            <Grid item xs={12} sm={6} md={4} key={scenario.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleScenarioSelect(scenario)}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="h3" mr={2}>
                      {scenario.icon}
                    </Typography>
                    <Box>
                      <Typography variant="h6" component="h3">
                        {scenario.title}
                      </Typography>
                      <Chip
                        label={scenario.difficulty}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {scenario.description}
                  </Typography>

                  <Box mt={2}>
                    <Typography variant="caption" color="primary">
                      重点词汇:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                      {scenario.vocabulary.map((word) => (
                        <Chip
                          key={word}
                          label={word}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* 对话头部 */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" component="h1">
            对话练习: {currentScenario.title}
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mt={1}>
            <Typography variant="h5">
              {currentScenario.icon}
            </Typography>
            <Chip
              label={currentScenario.difficulty}
              color="primary"
              variant="outlined"
            />
            {sessionStats.startTime && (
              <Typography variant="body2" color="text.secondary">
                开始时间: {formatTime(sessionStats.startTime)}
              </Typography>
            )}
          </Box>
        </Box>

        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => setCurrentScenario(null)}
            sx={{ mr: 1 }}
          >
            更换场景
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleEndConversation}
          >
            结束对话
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
              {/* 消息列表 */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  mb: 2,
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#c1c1c1',
                    borderRadius: '3px',
                  },
                }}
              >
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        maxWidth: '70%',
                        gap: 1,
                      }}
                    >
                      {message.sender === 'ai' && (
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                          <SmartToy />
                        </Avatar>
                      )}
                      <Paper
                        sx={{
                          p: 2,
                          backgroundColor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                          color: message.sender === 'user' ? 'white' : 'text.primary',
                          borderRadius: message.sender === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                        }}
                      >
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {message.text}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5, display: 'block' }}>
                          {formatTime(message.timestamp)}
                        </Typography>
                      </Paper>
                      {message.sender === 'user' && (
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                          <Person />
                        </Avatar>
                      )}
                    </Box>
                  </Box>
                ))}

                {/* 正在输入指示器 */}
                {isTyping && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      <SmartToy />
                    </Avatar>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.100' }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'text.secondary',
                            animation: 'pulse 1.4s infinite',
                          }}
                        />
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'text.secondary',
                            animation: 'pulse 1.4s infinite 0.2s',
                          }}
                        />
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'text.secondary',
                            animation: 'pulse 1.4s infinite 0.4s',
                          }}
                        />
                      </Box>
                    </Paper>
                  </Box>
                )}

                <div ref={messagesEndRef} />
              </Box>

              {/* 输入区域 */}
              <Box display="flex" gap={1} alignItems="flex-end">
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder="输入消息或点击麦克风说话..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton
                          onClick={() => messages.length > 0 && handlePlayText(messages[messages.length - 1].text)}
                          disabled={isPlaying || messages.length === 0}
                          size="small"
                        >
                          {isPlaying ? <VolumeOff /> : <VolumeUp />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  color={isRecording ? 'error' : 'primary'}
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={!speechSupport?.speechRecognition}
                  sx={{ alignSelf: 'center' }}
                >
                  {isRecording ? <MicOff /> : <Mic />}
                </IconButton>
                <Fab
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isRecording}
                  size="small"
                >
                  <Send />
                </Fab>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* 场景信息 */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                场景说明
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {currentScenario.context}
              </Typography>
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  重点词汇:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {currentScenario.vocabulary.map((word) => (
                    <Chip
                      key={word}
                      label={word}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* 对话统计 */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                对话统计
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="消息数量"
                    secondary={`${sessionStats.messageCount} 条`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="对话时长"
                    secondary={sessionStats.startTime ? `${Math.floor((Date.now() - sessionStats.startTime) / 1000 / 60)} 分钟` : '0 分钟'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* 使用提示 */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                使用提示
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• 使用完整的句子进行交流" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• 注意使用场景相关的词汇" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• 可以询问 meanings 或 translations" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• 点击喇叭按钮可以听取消息" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Conversation;