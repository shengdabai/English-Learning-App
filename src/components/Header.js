import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Notifications,
  AccountCircle,
  EmojiEvents,
  LocalFireDepartment,
  Schedule,
  Settings,
  Logout,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
}));

const Header = ({ userProfile }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = React.useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenuOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationsAnchor(null);
  };

  const getDailyProgress = () => {
    if (!userProfile?.dailyGoal) return 0;

    // 获取今日学习时间
    const today = new Date().toDateString();
    const todayMinutes = userProfile.sessions
      ?.filter(session => new Date(session.startTime).toDateString() === today)
      ?.reduce((total, session) => total + (session.duration || 0), 0) || 0;

    return Math.min(100, (todayMinutes / userProfile.dailyGoal) * 100);
  };

  const getLevelColor = (level) => {
    const colors = {
      beginner: 'success',
      intermediate: 'warning',
      advanced: 'error',
    };
    return colors[level] || 'default';
  };

  const getLevelText = (level) => {
    const texts = {
      beginner: '初级',
      intermediate: '中级',
      advanced: '高级',
    };
    return texts[level] || '未知';
  };

  const getStreakIcon = (streak) => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⚡';
    if (streak >= 7) return '💫';
    if (streak >= 3) return '✨';
    return '🌟';
  };

  return (
    <>
      <StyledAppBar position="fixed">
        {/* 每日进度条 */}
        <LinearProgress
          variant="determinate"
          value={getDailyProgress()}
          sx={{
            height: 3,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              backgroundColor: getDailyProgress() >= 100 ? 'success.main' : 'primary.main',
            },
          }}
        />

        <Toolbar>
          <Box sx={{ flexGrow: 1 }} />

          {/* 学习统计 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
            {/* 连续学习天数 */}
            <Tooltip title="连续学习天数">
              <Chip
                icon={<LocalFireDepartment />}
                label={`${userProfile?.streak || 0}天`}
                color={userProfile?.streak >= 7 ? 'warning' : 'default'}
                variant="outlined"
                size="small"
                sx={{ fontSize: '0.75rem' }}
              />
            </Tooltip>

            {/* 等级 */}
            <Chip
              label={getLevelText(userProfile?.level)}
              color={getLevelColor(userProfile?.level)}
              variant="filled"
              size="small"
              sx={{ fontWeight: 'bold' }}
            />

            {/* 今日学习时间 */}
            <Tooltip title="今日学习进度">
              <Chip
                icon={<Schedule />}
                label={`${Math.round(getDailyProgress())}%`}
                color={getDailyProgress() >= 100 ? 'success' : 'primary'}
                variant="outlined"
                size="small"
              />
            </Tooltip>

            {/* 成就数 */}
            <Tooltip title="获得成就数">
              <Chip
                icon={<EmojiEvents />}
                label={userProfile?.achievements?.length || 0}
                color="warning"
                variant="outlined"
                size="small"
              />
            </Tooltip>
          </Box>

          {/* 通知 */}
          <Tooltip title="通知">
            <IconButton
              color="inherit"
              onClick={handleNotificationsMenuOpen}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* 用户头像和菜单 */}
          <Tooltip title="用户设置">
            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
              sx={{ p: 0.5 }}
            >
              <Avatar
                alt="用户头像"
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                }}
              >
                {getStreakIcon(userProfile?.streak || 0)}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </StyledAppBar>

      {/* 用户菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 200,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="h6" noWrap>
            学习者
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getLevelText(userProfile?.level)} · {userProfile?.totalMinutes || 0}分钟
          </Typography>
          <Typography variant="caption" color="text.secondary">
            连续学习 {userProfile?.streak || 0} 天
          </Typography>
        </Box>

        <MenuItem onClick={() => { window.location.href = '/progress'; }}>
          <EmojiEvents sx={{ mr: 2 }} />
          <Typography>学习进度</Typography>
        </MenuItem>

        <MenuItem onClick={() => { window.location.href = '/settings'; }}>
          <Settings sx={{ mr: 2 }} />
          <Typography>设置</Typography>
        </MenuItem>

        <MenuItem onClick={handleMenuClose}>
          <AccountCircle sx={{ mr: 2 }} />
          <Typography>个人资料</Typography>
        </MenuItem>

        <MenuItem onClick={handleMenuClose}>
          <Logout sx={{ mr: 2 }} />
          <Typography>退出登录</Typography>
        </MenuItem>
      </Menu>

      {/* 通知菜单 */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 280,
            maxHeight: 400,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="h6">通知</Typography>
        </Box>

        <MenuItem>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              每日学习提醒
            </Typography>
            <Typography variant="caption" color="text.secondary">
              今天还没有完成学习目标哦！
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              2小时前
            </Typography>
          </Box>
        </MenuItem>

        <MenuItem>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              新成就解锁！
            </Typography>
            <Typography variant="caption" color="text.secondary">
              恭喜你获得"一周勇士"成就
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              1天前
            </Typography>
          </Box>
        </MenuItem>

        <MenuItem>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              学习建议
            </Typography>
            <Typography variant="caption" color="text.secondary">
              根据你的学习进度，建议多练习口语
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              3天前
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </>
  );
};

export default Header;