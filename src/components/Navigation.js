import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Toolbar,
  Typography,
  Divider,
  Box,
  Badge,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Home,
  MenuBook as BookOpen,
  Mic,
  ChatBubbleOutline as MessageCircle,
  TrendingUp,
  Settings,
  Timeline,
  School,
  EmojiEvents,
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const drawerWidth = 240;
const railWidth = 64; // 窄屏(<600px)只保留图标,把宽度还给正文

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down('sm'));
  const paperWidth = isNarrow ? railWidth : drawerWidth;

  const menuItems = [
    {
      text: '首页',
      icon: <Home />,
      path: '/',
      badge: null,
    },
    {
      text: '阅读理解',
      icon: <BookOpen />,
      path: '/reading',
      badge: null,
    },
    {
      text: '口语练习',
      icon: <Mic />,
      path: '/speaking',
      badge: null,
    },
    {
      text: '对话练习',
      icon: <MessageCircle />,
      path: '/conversation',
      badge: null,
    },
    {
      text: '学习进度',
      icon: <TrendingUp />,
      path: '/progress',
      badge: null,
    },
    {
      text: '设置',
      icon: <Settings />,
      path: '/settings',
      badge: null,
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <StyledDrawer
      variant="permanent"
      anchor="left"
      sx={{
        '& .MuiDrawer-paper': {
          position: 'relative',
          whiteSpace: 'nowrap',
          width: paperWidth,
          overflowX: 'hidden',
          transition: 'width 0.3s ease',
        },
      }}
    >
      <Toolbar sx={isNarrow ? { px: 0, justifyContent: 'center' } : undefined}>
        <Typography variant="h6" noWrap component="div" color="primary">
          {isNarrow ? '📚' : '📚 English Learning'}
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              aria-label={item.text}
              title={isNarrow ? item.text : undefined}
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                minHeight: 48,
                justifyContent: isNarrow ? 'center' : 'initial',
                px: isNarrow ? 0 : 2.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: isNarrow ? 0 : 3,
                  justifyContent: 'center',
                }}
              >
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText
                sx={isNarrow ? { display: 'none' } : undefined}
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ mt: 2, display: isNarrow ? 'none' : undefined }} />

      {/* 学习状态指示器 */}
      <Box sx={{ p: 2, display: isNarrow ? 'none' : undefined }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          今日学习
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ width: 24, height: 24, bgcolor: 'success.main' }}>
            <School sx={{ fontSize: 14 }} />
          </Avatar>
          <Chip
            label="连续学习"
            size="small"
            color="success"
            variant="outlined"
            sx={{ height: 24, fontSize: '0.7rem' }}
          />
        </Box>
      </Box>

      {/* 快速统计 */}
      <Box sx={{ p: 2, mt: 'auto', display: isNarrow ? 'none' : undefined }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          学习成就
        </Typography>
        <Box display="flex" flexDirection="column" gap={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <EmojiEvents sx={{ fontSize: 16, color: 'warning.main' }} />
            <Typography variant="caption">本周目标 80%</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Timeline sx={{ fontSize: 16, color: 'info.main' }} />
            <Typography variant="caption">学习进度 良好</Typography>
          </Box>
        </Box>
      </Box>
    </StyledDrawer>
  );
};

export default Navigation;