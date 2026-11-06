import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Mic,
  MicOff,
  VolumeUp,
  VolumeOff,
  PlayArrow,
  Stop,
  Refresh,
  CheckCircle,
  RadioButtonUnchecked,
  School,
  Timer,
  Speed,
  TrendingUp,
  VolumeDown,
  VolumeUp as VolumeHigh,
} from '@mui/icons-material';

import {
  startSpeechRecognition,
  stopSpeechRecognition,
  textToSpeech,
  checkSpeechSupport,
  getPronunciationMaterials,
  analyzeShadowReading,
} from '../services/speechService';
import { endLearningSession } from '../services/userService';

const Speaking = ({ userProfile, updateUserProfile }) => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [recognitionResult, setRecognitionResult] = useState('');
  const [pronunciationScore, setPronunciationScore] = useState(null);
  const [error, setError] = useState('');
  const [speechSupport, setSpeechSupport] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const audioRef = useRef(null);

  useEffect(() => {
    const support = checkSpeechSupport();
    setSpeechSupport(support);

    if (!support.speechRecognition) {
      setError('您的浏览器不支持语音识别功能。请使用 Chrome、Edge 或其他现代浏览器。');
    }

    loadMaterials();
  }, []);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRecording, startTime]);

  const loadMaterials = () => {
    const speakingMaterials = getPronunciationMaterials(userProfile.level);
    setMaterials(speakingMaterials);
  };

  const handleMaterialSelect = (material) => {
    setSelectedMaterial(material);
    setRecognitionResult('');
    setPronunciationScore(null);
    setError('');
    setShowResults(false);
    setAttemptCount(0);
  };

  const handlePlayText = async () => {
    if (!selectedMaterial) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      try {
        setIsPlaying(true);
        await textToSpeech(selectedMaterial.text, {
          rate: userProfile.preferences?.voiceSpeed || 1.0,
          lang: 'en-US',
        });
        setIsPlaying(false);
      } catch (error) {
        console.error('Text to speech error:', error);
        setError('播放失败，请检查音频设置。');
        setIsPlaying(false);
      }
    }
  };

  const handleStartRecording = () => {
    if (!speechSupport?.speechRecognition) {
      setError('语音识别不可用，请检查浏览器权限。');
      return;
    }

    setError('');
    setStartTime(Date.now());
    setRecordingTime(0);

    const recognitionInstance = startSpeechRecognition(
      (result) => {
        setRecognitionResult(result.transcript);

        if (result.isFinal) {
          handleStopRecording(result.transcript);
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

  const handleStopRecording = (finalResult = null) => {
    if (recognition) {
      stopSpeechRecognition(recognition);
    }

    setIsRecording(false);
    setRecognition(null);

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    if (finalResult && selectedMaterial) {
      // 分析发音
      const analysis = analyzeShadowReading(
        selectedMaterial.text,
        finalResult,
        startTime,
        endTime
      );

      setPronunciationScore(analysis);
      setAttemptCount(attemptCount + 1);

      // 更新最佳分数
      if (analysis.score > bestScore) {
        setBestScore(analysis.score);
      }

      setTimeout(() => {
        setShowResults(true);
      }, 1000);
    } else if (!finalResult) {
      // 用户手动停止录音
      setRecognitionResult('');
    }

    setStartTime(null);
    setRecordingTime(0);
  };

  const handleRetry = () => {
    setRecognitionResult('');
    setPronunciationScore(null);
    setShowResults(false);
  };

  const handleCompletePractice = async () => {
    const score = pronunciationScore?.score || 0;
    const updatedProfile = await endLearningSession(score);
    if (updatedProfile) {
      updateUserProfile(updatedProfile);
    }

    // 重置状态
    setSelectedMaterial(null);
    setRecognitionResult('');
    setPronunciationScore(null);
    setShowResults(false);
    setAttemptCount(0);
    setBestScore(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'warning';
    if (score >= 60) return 'info';
    return 'error';
  };

  const getFeedbackEmoji = (grade) => {
    const emojis = {
      excellent: '🎉',
      good: '😊',
      fair: '📝',
      needs_improvement: '🎧',
    };
    return emojis[grade] || '📚';
  };

  if (!selectedMaterial) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          口语练习
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          AI发音评估，提升口语流利度和准确度
        </Typography>

        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {materials.map((material) => (
            <Grid item xs={12} sm={6} md={4} key={material.id}>
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
                    <Typography variant="h6" component="h3">
                      练习 {material.id.replace('pron_', '')}
                    </Typography>
                    <Chip
                      label={material.difficulty}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <Typography
                    variant="body1"
                    paragraph
                    sx={{
                      fontStyle: 'italic',
                      mb: 2,
                      minHeight: 60,
                    }}
                  >
                    "{material.text}"
                  </Typography>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      icon={<School />}
                      label={material.category}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      重点: {material.focusWords?.join(', ')}
                    </Typography>
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
      <Typography variant="h4" gutterBottom>
        口语练习
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">
                  练习 {selectedMaterial.id.replace('pron_', '')}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedMaterial(null)}
                >
                  返回列表
                </Button>
              </Box>

              {/* 目标文本 */}
              <Paper sx={{ p: 3, mb: 3, backgroundColor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  请朗读以下文本:
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.2rem', lineHeight: 1.8 }}>
                  {selectedMaterial.text}
                </Typography>
              </Paper>

              {/* 控制按钮 */}
              <Box display="flex" justifyContent="center" alignItems="center" gap={2} mb={3}>
                <IconButton
                  size="large"
                  onClick={handlePlayText}
                  disabled={isRecording}
                  color={isPlaying ? 'error' : 'primary'}
                  sx={{ width: 60, height: 60 }}
                >
                  {isPlaying ? <VolumeOff /> : <VolumeUp />}
                </IconButton>

                <IconButton
                  size="large"
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={!speechSupport?.speechRecognition}
                  color={isRecording ? 'error' : 'success'}
                  sx={{ width: 80, height: 80 }}
                >
                  {isRecording ? <MicOff /> : <Mic />}
                </IconButton>

                {pronunciationScore && (
                  <IconButton
                    size="large"
                    onClick={handleRetry}
                    color="warning"
                    sx={{ width: 60, height: 60 }}
                  >
                    <Refresh />
                  </IconButton>
                )}
              </Box>

              {/* 状态信息 */}
              <Box display="flex" justifyContent="center" alignItems="center" gap={3} mb={3}>
                {isRecording && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} color="error" />
                    <Typography variant="body2" color="error">
                      录音中 {formatTime(recordingTime)}
                    </Typography>
                  </Box>
                )}

                {isPlaying && (
                  <Typography variant="body2" color="primary">
                    正在播放...
                  </Typography>
                )}
              </Box>

              {/* 识别结果 */}
              {recognitionResult && (
                <Paper sx={{ p: 2, mb: 3, backgroundColor: 'blue.50' }}>
                  <Typography variant="subtitle2" gutterBottom color="primary">
                    识别结果:
                  </Typography>
                  <Typography variant="body1">
                    "{recognitionResult}"
                  </Typography>
                </Paper>
              )}

              {/* 错误信息 */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* 评分结果 */}
              {showResults && pronunciationScore && (
                <Dialog open={showResults} onClose={() => setShowResults(false)} maxWidth="md" fullWidth>
                  <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6">发音评估结果</Typography>
                      <Typography variant="h4">
                        {getFeedbackEmoji(pronunciationScore.grade)}
                      </Typography>
                    </Box>
                  </DialogTitle>
                  <DialogContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Box textAlign="center" mb={2}>
                          <Typography variant="h2" color={getScoreColor(pronunciationScore.score)}>
                            {pronunciationScore.score}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            综合得分
                          </Typography>
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={pronunciationScore.score}
                          sx={{ height: 8, borderRadius: 4, mb: 2 }}
                          color={getScoreColor(pronunciationScore.score)}
                        />

                        <Typography variant="h6" gutterBottom color={getScoreColor(pronunciationScore.score)}>
                          {pronunciationScore.feedback.message}
                        </Typography>

                        <Box display="flex" justifyContent="space-between" mt={2}>
                          <Typography variant="body2">
                            尝试次数: {attemptCount}
                          </Typography>
                          <Typography variant="body2">
                            最佳得分: {bestScore}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom>
                          详细分析:
                        </Typography>

                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <Timer color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="时长"
                              secondary={`${pronunciationScore.duration}秒`}
                            />
                          </ListItem>

                          <ListItem>
                            <ListItemIcon>
                              <Speed color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="语速"
                              secondary={`${pronunciationScore.speed?.wpm || 0} WPM (${pronunciationScore.speed?.grade || 'normal'})`}
                            />
                          </ListItem>

                          <ListItem>
                            <ListItemIcon>
                              <TrendingUp color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="完整性"
                              secondary={`${Math.round(pronunciationScore.completeness || 0)}%`}
                            />
                          </ListItem>

                          {pronunciationScore.similarity !== undefined && (
                            <ListItem>
                              <ListItemIcon>
                                <CheckCircle color="primary" />
                              </ListItemIcon>
                              <ListItemText
                                primary="相似度"
                                secondary={`${Math.round(pronunciationScore.similarity)}%`}
                              />
                            </ListItem>
                          )}
                        </List>

                        {pronunciationScore.suggestions && pronunciationScore.suggestions.length > 0 && (
                          <Box mt={2}>
                            <Typography variant="subtitle2" gutterBottom color="text.secondary">
                              改进建议:
                            </Typography>
                            {pronunciationScore.suggestions.map((suggestion, index) => (
                              <Typography key={index} variant="body2" color="text.secondary">
                                • {suggestion}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setShowResults(false)}>
                      继续练习
                    </Button>
                    <Button
                      onClick={handleCompletePractice}
                      variant="contained"
                      color="primary"
                    >
                      完成练习
                    </Button>
                  </DialogActions>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* 练习提示 */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                练习提示
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• 在安静的环境中练习" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• 保持自然语速，不要过快" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• 注意语音语调的变化" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• 先听示例，再跟读练习" />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* 评分标准 */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                评分标准
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="优秀 (90-100)"
                    secondary="发音标准，语调自然"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="良好 (75-89)"
                    secondary="基本准确，稍有改进空间"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="一般 (60-74)"
                    secondary="可以理解，需多练习"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="需改进 (0-59)"
                    secondary="需要重点练习基础发音"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Speaking;