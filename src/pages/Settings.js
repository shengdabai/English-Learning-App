import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  VolumeUp,
  Speed,
  Schedule,
  Language,
  Save,
  Restore,
  Delete,
  CloudUpload,
  CloudDownload,
  Security,
  Notifications,
  Info,
} from '@mui/icons-material';
import { loadUserProfile, saveUserProfile } from '../services/userService';
import { getAvailableVoices } from '../services/speechService';

const Settings = ({ userProfile, updateUserProfile }) => {
  const [preferences, setPreferences] = useState({
    theme: 'light',
    voiceSpeed: 1.0,
    autoPlay: true,
    language: 'en-US',
    dailyGoal: 30,
    notifications: {
      daily: true,
      achievements: true,
      reminders: false,
    },
    privacy: {
      analytics: true,
      crashReporting: true,
      shareProgress: false,
    },
  });
  const [availableVoices, setAvailableVoices] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  useEffect(() => {
    if (userProfile?.preferences) {
      setPreferences({ ...preferences, ...userProfile.preferences });
    }
    loadVoices();
  }, [userProfile]);

  const loadVoices = () => {
    try {
      const voices = getAvailableVoices();
      setAvailableVoices(voices);
    } catch (error) {
      console.error('Error loading voices:', error);
    }
  };

  const handlePreferenceChange = (category, field, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: category === 'notifications' || category === 'privacy'
        ? { ...prev[category], [field]: value }
        : value
    }));
  };

  const handleSave = () => {
    try {
      const updatedProfile = {
        ...userProfile,
        preferences,
      };

      saveUserProfile(updatedProfile);
      updateUserProfile(updatedProfile);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleReset = () => {
    const defaultPreferences = {
      theme: 'light',
      voiceSpeed: 1.0,
      autoPlay: true,
      language: 'en-US',
      dailyGoal: 30,
      notifications: {
        daily: true,
        achievements: true,
        reminders: false,
      },
      privacy: {
        analytics: true,
        crashReporting: true,
        shareProgress: false,
      },
    };

    setPreferences(defaultPreferences);
    setShowResetDialog(false);
    setSaveStatus('success');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleExportData = () => {
    try {
      const exportData = {
        profile: userProfile,
        preferences,
        exportDate: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      const exportFileDefaultName = `english-learning-backup-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      setShowExportDialog(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error exporting data:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        if (importedData.preferences) {
          setPreferences(importedData.preferences);
        }

        if (importedData.profile) {
          saveUserProfile(importedData.profile);
          updateUserProfile(importedData.profile);
        }

        setSaveStatus('success');
        setTimeout(() => setSaveStatus(''), 3000);
      } catch (error) {
        console.error('Error importing data:', error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    };

    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm('确定要清除所有学习数据吗？此操作不可恢复。')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const learningLevels = [
    { value: 'beginner', label: '初级 (Beginner)' },
    { value: 'intermediate', label: '中级 (Intermediate)' },
    { value: 'advanced', label: '高级 (Advanced)' },
  ];

  const languages = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'en-AU', label: 'English (Australia)' },
    { value: 'en-CA', label: 'English (Canada)' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        设置
      </Typography>

      {saveStatus === 'success' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          设置已成功保存！
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          保存设置时出错，请重试。
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 学习设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📚 学习设置
              </Typography>

              <Box mb={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>学习级别</InputLabel>
                  <Select
                    value={userProfile?.level || 'beginner'}
                    onChange={(e) => {
                      const updatedProfile = { ...userProfile, level: e.target.value };
                      saveUserProfile(updatedProfile);
                      updateUserProfile(updatedProfile);
                    }}
                    label="学习级别"
                  >
                    {learningLevels.map((level) => (
                      <MenuItem key={level.value} value={level.value}>
                        {level.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box mb={3}>
                <Typography id="daily-goal-slider" gutterBottom>
                  每日学习目标: {preferences.dailyGoal} 分钟
                </Typography>
                <Slider
                  value={preferences.dailyGoal}
                  onChange={(e, value) => handlePreferenceChange('', 'dailyGoal', value)}
                  min={10}
                  max={120}
                  step={10}
                  valueLabelDisplay="auto"
                  aria-labelledby="daily-goal-slider"
                />
              </Box>

              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel>学习语言</InputLabel>
                <Select
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('', 'language', e.target.value)}
                  label="学习语言"
                >
                  {languages.map((lang) => (
                    <MenuItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* 语音设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔊 语音设置
              </Typography>

              <Box mb={3}>
                <Typography id="voice-speed-slider" gutterBottom>
                  语音速度: {preferences.voiceSpeed}x
                </Typography>
                <Slider
                  value={preferences.voiceSpeed}
                  onChange={(e, value) => handlePreferenceChange('', 'voiceSpeed', value)}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  valueLabelDisplay="auto"
                  aria-labelledby="voice-speed-slider"
                  icon={<Speed />}
                />
              </Box>

              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel>语音选择</InputLabel>
                <Select
                  value={preferences.voiceId || ''}
                  onChange={(e) => handlePreferenceChange('', 'voiceId', e.target.value)}
                  label="语音选择"
                >
                  {availableVoices.map((voice) => (
                    <MenuItem key={voice.voiceId} value={voice.voiceId}>
                      {voice.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.autoPlay}
                    onChange={(e) => handlePreferenceChange('', 'autoPlay', e.target.checked)}
                  />
                }
                label="自动播放语音"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* 通知设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔔 通知设置
              </Typography>

              <List>
                <ListItem>
                  <ListItemText
                    primary="每日学习提醒"
                    secondary="在设定时间提醒您开始学习"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={preferences.notifications?.daily || false}
                      onChange={(e) => handlePreferenceChange('notifications', 'daily', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="成就通知"
                    secondary="获得新成就时通知您"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={preferences.notifications?.achievements || false}
                      onChange={(e) => handlePreferenceChange('notifications', 'achievements', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="学习建议"
                    secondary="根据学习进度提供个性化建议"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={preferences.notifications?.reminders || false}
                      onChange={(e) => handlePreferenceChange('notifications', 'reminders', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 隐私设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔒 隐私设置
              </Typography>

              <List>
                <ListItem>
                  <ListItemText
                    primary="使用分析"
                    secondary="帮助我们改进产品体验"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={preferences.privacy?.analytics !== false}
                      onChange={(e) => handlePreferenceChange('privacy', 'analytics', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="错误报告"
                    secondary="自动发送错误报告帮助修复问题"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={preferences.privacy?.crashReporting !== false}
                      onChange={(e) => handlePreferenceChange('privacy', 'crashReporting', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="分享进度"
                    secondary="与学习者社区分享学习进度"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={preferences.privacy?.shareProgress || false}
                      onChange={(e) => handlePreferenceChange('privacy', 'shareProgress', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 数据管理 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💾 数据管理
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<CloudDownload />}
                    onClick={() => setShowExportDialog(true)}
                  >
                    导出数据
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    component="label"
                    startIcon={<CloudUpload />}
                  >
                    导入数据
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      style={{ display: 'none' }}
                    />
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    color="warning"
                    startIcon={<Restore />}
                    onClick={() => setShowResetDialog(true)}
                  >
                    重置设置
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleClearData}
                  >
                    清除所有数据
                  </Button>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>数据说明：</strong>
                  • 导出数据包含您的学习进度和设置<br/>
                  • 重置设置将恢复默认配置，不会清除学习数据<br/>
                  • 清除所有数据将删除您的学习记录，此操作不可恢复
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* 保存按钮 */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Save />}
              onClick={handleSave}
            >
              保存设置
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* 重置确认对话框 */}
      <Dialog open={showResetDialog} onClose={() => setShowResetDialog(false)}>
        <DialogTitle>重置设置</DialogTitle>
        <DialogContent>
          <Typography>
            确定要重置所有设置到默认值吗？这不会清除您的学习数据，只会恢复设置选项。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetDialog(false)}>
            取消
          </Button>
          <Button onClick={handleReset} color="warning">
            重置
          </Button>
        </DialogActions>
      </Dialog>

      {/* 导出确认对话框 */}
      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)}>
        <DialogTitle>导出数据</DialogTitle>
        <DialogContent>
          <Typography>
            将导出您的学习进度和设置数据。请妥善保管导出的文件，它包含您的个人学习记录。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>
            取消
          </Button>
          <Button onClick={handleExportData} color="primary">
            导出
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;