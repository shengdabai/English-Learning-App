# 📚 English Learning App

AI驱动的英语学习应用，通过沉浸式学习体验帮助用户快速掌握英语使用能力。

## ✨ 特性

### 🎯 核心功能
- **阅读理解** - 分级阅读材料，AI辅助理解和词汇学习
- **口语练习** - 实时语音识别和发音评估，影子跟读训练
- **对话练习** - AI对话伙伴，多场景化练习模式
- **学习进度** - 详细的学习统计和个性化分析
- **成就系统** - 激励性学习体验和目标追踪

### 🤖 AI功能
- 智能语音识别和发音评估
- 个性化学习路径推荐
- 实时对话练习和语法纠正
- 自适应难度调整

### 📱 用户体验
- 响应式设计，支持桌面和移动设备
- 离线学习功能
- 进度同步和备份
- 多语言界面支持

## 🚀 快速开始

### 环境要求
- Node.js 16.0+
- npm 或 yarn
- 现代浏览器（Chrome, Firefox, Safari, Edge）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/english-learning-app.git
cd english-learning-app
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **启动开发服务器**
```bash
npm start
# 或
yarn start
```

4. **打开浏览器**
访问 `http://localhost:3000` 开始使用

### 构建生产版本
```bash
npm run build
# 或
yarn build
```

## 📖 使用指南

### 首次使用
1. 选择适合的英语级别（初级/中级/高级）
2. 设置每日学习目标
3. 开始第一个学习模块

### 学习模块

#### 📖 阅读理解
- **分级材料**：根据用户水平提供合适的阅读内容
- **智能词汇**：点击单词查看释义和例句
- **语音朗读**：标准美式发音，可调节语速
- **理解测试**：阅读后进行理解能力测试

#### 🎤 口语练习
- **发音评估**：AI实时评估发音准确度
- **影子跟读**：跟随标准音频进行跟读训练
- **详细反馈**：语速、节奏、完整性等多维度分析
- **进步追踪**：记录每次练习的详细数据

#### 💬 对话练习
- **场景对话**：餐厅、机场、面试等真实场景
- **AI伙伴**：智能对话伙伴，自然语言交流
- **语音交互**：支持语音输入和输出
- **即时反馈**：语法纠正和表达建议

#### 📊 学习进度
- **数据可视化**：学习时间、进步趋势图表
- **详细统计**：各模块学习情况分析
- **目标设定**：个性化学习目标和里程碑
- **成就系统**：激励用户持续学习

## 🛠️ 技术架构

### 前端技术栈
- **React 18** - 现代化用户界面
- **Material-UI (MUI)** - UI组件库
- **React Router** - 单页面应用路由
- **Chart.js** - 数据可视化

### 核心服务
- **语音服务** - Web Speech API集成
- **用户服务** - 本地数据管理
- **阅读服务** - 内容管理和理解评估
- **进度追踪** - 学习数据分析和统计

### 数据存储
- **本地存储** - 用户偏好和学习进度
- **IndexedDB** - 大型内容缓存
- **LocalStorage** - 配置和会话数据

## 📁 项目结构

```
english-learning-app/
├── public/                 # 静态资源
│   ├── index.html         # HTML模板
│   ├── favicon.ico        # 网站图标
│   └── manifest.json      # PWA配置
├── src/
│   ├── components/        # 通用组件
│   │   ├── Header.js      # 顶部导航栏
│   │   ├── Navigation.js  # 侧边导航栏
│   │   └── ...
│   ├── pages/            # 页面组件
│   │   ├── Home.js       # 首页
│   │   ├── Reading.js    # 阅读模块
│   │   ├── Speaking.js   # 口语模块
│   │   ├── Conversation.js # 对话模块
│   │   ├── Progress.js   # 进度页面
│   │   └── Settings.js   # 设置页面
│   ├── services/         # 业务逻辑服务
│   │   ├── userService.js # 用户管理
│   │   ├── speechService.js # 语音处理
│   │   ├── readingService.js # 阅读服务
│   │   └── ...
│   ├── utils/            # 工具函数
│   ├── styles/           # 样式文件
│   ├── assets/           # 静态资源
│   ├── App.js            # 主应用组件
│   └── index.js          # 应用入口
├── package.json          # 项目配置
├── README.md            # 项目文档
└── .gitignore          # Git忽略文件
```

## 🔧 配置说明

### 语音功能配置
- 需要HTTPS环境才能使用语音功能
- 需要麦克风权限
- 推荐使用Chrome或Edge浏览器

### 学习级别定义
- **初级**：基础词汇和简单句型
- **中级**：日常对话和基础语法
- **高级**：复杂表达和专业词汇

### 数据备份
- 支持导出学习数据
- 可跨设备同步进度
- 定期自动备份

## 🎨 自定义

### 添加阅读材料
在 `src/services/readingService.js` 中添加新的阅读内容：

```javascript
const READING_MATERIALS = {
  beginner: [
    {
      id: 'new_material_001',
      title: '新阅读材料',
      level: 'A1',
      category: 'daily_life',
      content: '文章内容...',
      vocabulary: [
        { word: 'example', definition: '例子', example: 'This is an example.' }
      ],
      questions: [
        { question: '问题内容?', answer: '答案' }
      ],
      audioUrl: null,
      estimatedTime: 5,
    }
  ]
};
```

### 扩展对话场景
在 `src/pages/Conversation.js` 中添加新场景：

```javascript
const scenarios = [
  {
    id: 'hospital',
    title: '医院就诊',
    description: '练习在医院就医的英语对话',
    difficulty: 'intermediate',
    context: '场景描述...',
    starterMessage: '欢迎来到对话练习！',
    icon: '🏥',
    vocabulary: ['symptom', 'prescription', 'diagnosis'],
  }
];
```

## 🧪 测试

### 运行测试
```bash
npm test
# 或
yarn test
```

### 测试覆盖率
```bash
npm run test:coverage
# 或
yarn test:coverage
```

## 📈 性能优化

### 已实现的优化
- 代码分割和懒加载
- 图片压缩和缓存
- 语音数据预加载
- 组件级别的性能监控

### 建议优化
- 使用Service Worker缓存
- 实现服务端渲染
- 添加PWA功能
- 优化首屏加载时间

## 🔒 隐私和安全

### 数据保护
- 所有数据本地存储
- 不收集个人信息
- 可完全控制数据导出和删除
- 支持完全离线使用

### 浏览器权限
- 麦克风权限（语音功能）
- 本地存储权限（数据保存）
- 网络权限（可选的内容更新）

## 🤝 贡献指南

### 开发环境设置
1. Fork项目
2. 创建功能分支
3. 安装依赖
4. 进行开发
5. 提交PR

### 代码规范
- 使用ESLint和Prettier
- 遵循React最佳实践
- 编写单元测试
- 更新相关文档

### 提交规范
```
type(scope): description

feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建工具相关
```

## 🐛 问题报告

### 常见问题
- **语音功能不工作**：检查HTTPS环境和浏览器权限
- **数据丢失**：检查浏览器本地存储设置
- **加载缓慢**：清除缓存或检查网络连接

### 报告问题
在GitHub Issues中报告问题时，请包含：
- 浏览器版本和操作系统
- 详细的问题描述
- 复现步骤
- 相关的错误信息

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 感谢所有贡献者对项目的改进
- 感谢开源社区的技术支持
- 特别感谢原始项目的启发

## 📞 联系方式

- 项目主页：https://github.com/your-username/english-learning-app
- 问题反馈：https://github.com/your-username/english-learning-app/issues
- 邮箱：your-email@example.com

---

**开始你的英语学习之旅吧！** 🚀

Made with ❤️ for English learners everywhere.