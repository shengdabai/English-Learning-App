import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Divider,
  Avatar,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  VolumeUp,
  VolumeOff,
  Bookmark,
  BookmarkBorder,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  RadioButtonUnchecked,
  Translate,
  School,
  Timer,
  Star,
  PlayArrow,
  Pause,
} from '@mui/icons-material';

import {
  getReadingMaterials,
  getReadingMaterial,
  saveReadingRecord,
  generateComprehensionQuestions,
  scoreComprehensionQuiz,
  getReadingHistory,
} from '../services/readingService';
import { textToSpeech, stopSpeechRecognition } from '../services/speechService';
import { startLearningSession, endLearningSession } from '../services/userService';

const Reading = ({ userProfile, updateUserProfile }) => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [readingMode, setReadingMode] = useState('list'); // list, reading, quiz
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWord, setCurrentWord] = useState(null);
  const [bookmarkedWords, setBookmarkedWords] = useState(new Set());
  const [quizStep, setQuizStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [readingTime, setReadingTime] = useState(0);

  const contentRef = useRef(null);
  const completionRef = useRef(false);

  useEffect(() => {
    loadMaterials();
    loadBookmarks();
    loadHistory();
  }, []);

  useEffect(() => {
    let interval;
    if (readingMode === 'reading' && startTime) {
      interval = setInterval(() => {
        setReadingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [readingMode, startTime]);

  const loadMaterials = () => {
    const userMaterials = getReadingMaterials(userProfile.level);
    setMaterials(userMaterials);
  };

  const loadBookmarks = () => {
    try {
      const bookmarks = localStorage.getItem('bookmarked_words');
      if (bookmarks) {
        setBookmarkedWords(new Set(JSON.parse(bookmarks)));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const loadHistory = () => {
    const history = getReadingHistory();
    console.log('Reading history:', history);
  };

  const handleMaterialSelect = async (material) => {
    completionRef.current = false;
    startLearningSession('reading');
    setSelectedMaterial(material);
    setReadingMode('reading');
    setStartTime(Date.now());
    setReadingTime(0);

    // 记录开始阅读
    saveReadingRecord({
      materialId: material.id,
      title: material.title,
      level: material.level,
      category: material.category,
      startTime: new Date().toISOString(),
      status: 'started',
    });
  };

  const handleTextToSpeech = async (text) => {
    if (isPlaying) {
      // 停止播放
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

  const handleWordClick = (word) => {
    setCurrentWord(word);
  };

  const handleBookmark = (word) => {
    const newBookmarks = new Set(bookmarkedWords);
    if (newBookmarks.has(word)) {
      newBookmarks.delete(word);
    } else {
      newBookmarks.add(word);
    }
    setBookmarkedWords(newBookmarks);

    // 保存到本地存储
    try {
      localStorage.setItem(
        'bookmarked_words',
        JSON.stringify(Array.from(newBookmarks))
      );
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  };

  const handleStartQuiz = () => {
    const questions = generateComprehensionQuestions(
      selectedMaterial.content,
      selectedMaterial.level
    );

    if (questions.length > 0) {
      setQuizQuestions(questions);
      setReadingMode('quiz');
      setQuizStep(0);
      setSelectedAnswers({});
      setQuizResults(null);
    } else {
      // 没有生成的问题，直接完成
      handleCompleteReading();
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex,
    });
  };

  const handleNextQuestion = () => {
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      calculateQuizResults();
    }
  };

  const handlePreviousQuestion = () => {
    if (quizStep > 0) {
      setQuizStep(quizStep - 1);
    }
  };

  const calculateQuizResults = () => {
    setQuizResults({
      ...scoreComprehensionQuiz(quizQuestions, selectedAnswers),
      completedAt: new Date().toISOString(),
    });
  };

  const handleCompleteReading = async (score = 0) => {
    if (completionRef.current) return;
    completionRef.current = true;
    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime) / 1000 / 60); // 分钟

    // 保存阅读记录
    saveReadingRecord({
      materialId: selectedMaterial.id,
      title: selectedMaterial.title,
      level: selectedMaterial.level,
      category: selectedMaterial.category,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration,
      score,
      status: 'completed',
    });

    // 结束学习会话并更新用户配置
    const updatedProfile = await endLearningSession(score);
    if (updatedProfile) {
      updateUserProfile(updatedProfile);
    }

    // 重置状态
    setReadingMode('list');
    setSelectedMaterial(null);
    setStartTime(null);
    setReadingTime(0);
    setQuizResults(null);
    setQuizQuestions([]);
  };

  const formatReadingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderWordWithHighlight = (text) => {
    const words = text.split(/(\s+|[,.!?;:"'()]|[\r\n]+)/);

    return words.map((word, index) => {
      if (/\s+|[,.!?;:"'()]|[\r\n]+/.test(word)) {
        return word;
      }

      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      const isBookmarked = bookmarkedWords.has(cleanWord);

      return (
        <span
          key={index}
          onClick={() => handleWordClick(cleanWord)}
          style={{
            cursor: 'pointer',
            backgroundColor: isBookmarked ? '#fff3cd' : 'transparent',
            padding: '2px 4px',
            borderRadius: '4px',
            transition: 'background-color 0.2s',
          }}
        >
          {word}
        </span>
      );
    });
  };

  const renderReadingMode = () => {
    if (readingMode === 'list') {
      return (
        <Grid container spacing={3}>
          {materials.map((material) => (
            <Grid item xs={12} md={6} lg={4} key={material.id}>
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
                onClick={() => handleMaterialSelect(material)}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {material.title}
                    </Typography>
                    <Chip
                      label={material.level}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {material.content.substring(0, 100)}...
                  </Typography>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      icon={<Timer />}
                      label={`${material.estimatedTime} min`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<School />}
                      label={material.category.replace('_', ' ')}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Box mt={2} display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      {material.vocabulary?.length || 0} 词汇
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {material.questions?.length || 0} 问题
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    if (readingMode === 'reading' && selectedMaterial) {
      return (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5" component="h2">
                    {selectedMaterial.title}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color="text.secondary">
                      {formatReadingTime(readingTime)}
                    </Typography>
                    <IconButton
                      onClick={() => handleTextToSpeech(selectedMaterial.content)}
                      color={isPlaying ? 'error' : 'primary'}
                    >
                      {isPlaying ? <VolumeOff /> : <VolumeUp />}
                    </IconButton>
                  </Box>
                </Box>

                <Box mb={3}>
                  <Typography variant="body1" component="div" ref={contentRef} sx={{ lineHeight: 1.8 }}>
                    {renderWordWithHighlight(selectedMaterial.content)}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => setReadingMode('list')}
                  >
                    返回列表
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleStartQuiz}
                    endIcon={<ArrowForward />}
                  >
                    开始测验
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            {/* 词汇表 */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  重要词汇
                </Typography>
                <List dense>
                  {selectedMaterial.vocabulary?.slice(0, 5).map((vocab, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText
                        secondaryTypographyProps={{ component: 'div' }}
                        primary={
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle2">
                              {vocab.word}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleBookmark(vocab.word.toLowerCase())}
                              color={bookmarkedWords.has(vocab.word.toLowerCase()) ? 'warning' : 'default'}
                            >
                              {bookmarkedWords.has(vocab.word.toLowerCase()) ? <Bookmark /> : <BookmarkBorder />}
                            </IconButton>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {vocab.definition}
                            </Typography>
                            <Typography variant="caption" color="primary">
                              {vocab.example}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* 学习进度 */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  学习进度
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  期望阅读时间: {selectedMaterial.estimatedTime} 分钟
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (readingTime / 60) / selectedMaterial.estimatedTime * 100)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {Math.round((readingTime / 60) / selectedMaterial.estimatedTime * 100)}% 完成
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }

    if (readingMode === 'quiz' && selectedMaterial) {
      if (quizResults) {
        return (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2, width: 64, height: 64 }}>
                <CheckCircle sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h4" gutterBottom color="primary">
                测验完成！
              </Typography>
              <Typography variant="h6" gutterBottom>
                得分: {quizResults.score}%
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                正确 {quizResults.correctAnswers} / {quizResults.totalQuestions} 题
              </Typography>

              <Button
                variant="contained"
                color="primary"
                onClick={() => handleCompleteReading(quizResults.score)}
                sx={{ mt: 2 }}
              >
                继续学习
              </Button>
            </CardContent>
          </Card>
        );
      }

      const questions = quizQuestions;
      const currentQuestion = questions[quizStep];

      return (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              阅读理解测验
            </Typography>

            <Stepper activeStep={quizStep} sx={{ mb: 4 }}>
              {questions.map((_, index) => (
                <Step key={index}>
                  <StepLabel>{index + 1}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {currentQuestion && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  问题 {quizStep + 1}: {currentQuestion.question}
                </Typography>

                {currentQuestion.options && (
                  <List>
                    {currentQuestion.options.map((option, index) => (
                      <ListItem
                        key={index}
                        button
                        selected={selectedAnswers[quizStep] === index}
                        onClick={() => handleAnswerSelect(quizStep, index)}
                      >
                        <ListItemIcon>
                          {selectedAnswers[quizStep] === index ? (
                            <CheckCircle color="primary" />
                          ) : (
                            <RadioButtonUnchecked />
                          )}
                        </ListItemIcon>
                        <ListItemText primary={option} />
                      </ListItem>
                    ))}
                  </List>
                )}

                <Box display="flex" justifyContent="space-between" mt={4}>
                  <Button
                    variant="outlined"
                    disabled={quizStep === 0}
                    onClick={handlePreviousQuestion}
                    startIcon={<ArrowBack />}
                  >
                    上一题
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={selectedAnswers[quizStep] === undefined}
                    onClick={handleNextQuestion}
                    endIcon={<ArrowForward />}
                  >
                    {quizStep === questions.length - 1 ? '完成' : '下一题'}
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <Box>
      {readingMode !== 'list' && (
        <Box mb={2}>
          <Typography variant="h4" component="h1">
            阅读理解
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {readingMode === 'reading' && '沉浸式阅读体验，重点词汇学习'}
            {readingMode === 'quiz' && '测试你的理解能力'}
          </Typography>
        </Box>
      )}

      {renderReadingMode()}

      {/* 词汇详情对话框 */}
      <Dialog
        open={!!currentWord}
        onClose={() => setCurrentWord(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">词汇: {currentWord}</Typography>
            <IconButton onClick={() => setCurrentWord(null)}>
              ×
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {selectedMaterial?.vocabulary?.find(v => v.word.toLowerCase() === currentWord?.toLowerCase())?.definition || '点击查看更多词汇信息'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <IconButton
            onClick={() => currentWord && handleBookmark(currentWord)}
            color={bookmarkedWords.has(currentWord) ? 'warning' : 'default'}
          >
            {bookmarkedWords.has(currentWord) ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
          <IconButton onClick={() => currentWord && handleTextToSpeech(currentWord)}>
            <VolumeUp />
          </IconButton>
          <Button onClick={() => setCurrentWord(null)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reading;
