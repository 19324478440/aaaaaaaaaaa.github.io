const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'mathmaster_jwt_secret_key_2025';

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // 提供静态文件服务

// 模拟数据库 - 内存存储
const mockData = {
  users: [
    {
      id: 1,
      username: 'demo',
      password: 'demo', // 简化版本，实际应该使用哈希密码
      name: '数学小达人',
      grade: '高二',
      specialty: '函数与导数',
      learning_goal: '冲击高考数学145+',
      challenge_direction: '函数综合题、导数应用',
      statistics: {
        completed_levels: 12,
        notes_count: 8,
        consecutive_days: 15,
        points: 380
      },
      progress: {
        '函数的奥秘': [
          { level: 1, completed: true },
          { level: 2, completed: true },
          { level: 3, completed: true },
          { level: 4, completed: false },
          { level: 5, completed: false },
          { level: 6, completed: false }
        ],
        '指数与对数': [
          { level: 1, completed: true },
          { level: 2, completed: true },
          { level: 3, completed: false },
          { level: 4, completed: false },
          { level: 5, completed: false },
          { level: 6, completed: false }
        ],
        '三角函数': [
          { level: 1, completed: true },
          { level: 2, completed: false },
          { level: 3, completed: false },
          { level: 4, completed: false },
          { level: 5, completed: false },
          { level: 6, completed: false }
        ],
        '数列与求和': [
          { level: 1, completed: true },
          { level: 2, completed: false },
          { level: 3, completed: false },
          { level: 4, completed: false },
          { level: 5, completed: false },
          { level: 6, completed: false }
        ],
        '导数初探': [
          { level: 1, completed: false },
          { level: 2, completed: false },
          { level: 3, completed: false },
          { level: 4, completed: false },
          { level: 5, completed: false },
          { level: 6, completed: false }
        ],
        '概率统计': [
          { level: 1, completed: false },
          { level: 2, completed: false },
          { level: 3, completed: false },
          { level: 4, completed: false },
          { level: 5, completed: false },
          { level: 6, completed: false }
        ]
      },
      lastCheckin: null // 最后打卡日期
    }
  ],
  notes: [
    {
      id: 1,
      userId: 1,
      title: '函数定义域的理解技巧',
      content: '求函数定义域要记住三要素：根号内非负、分母不为零、对数真数大于零。建议画个数轴帮助理解！特别是复合函数的定义域，要从内向外逐层分析。比如求f(x)=√(x-2)/(x-3)的定义域，需要同时满足x-2≥0和x-3≠0。',
      type: '入门心得',
      likes: 25,
      comments_count: 8,
      name: '数学小达人',
      createdAt: '2025-01-14T10:30:00Z'
    },
    {
      id: 2,
      userId: 1,
      title: '三角函数图像变换记忆口诀',
      content: '左加右减对自变量，上加下减对整体。周期变换看ω，值域变化看A和k。这个口诀帮我记住了所有变换规则！比如y=2sin(3x-π/2)+1，可以分解为：振幅2，周期2π/3，相位左移π/6，上移1个单位。',
      type: '进阶心得',
      likes: 42,
      comments_count: 15,
      name: '函数高手',
      createdAt: '2025-01-13T14:20:00Z'
    },
    {
      id: 3,
      userId: 1,
      title: '裂项相消法的进阶应用',
      content: '遇到1/(n(n+1))形式的数列，用裂项相消。但更复杂的如1/(n(n+2))需要拆成1/2×(1/n - 1/(n+2))，这个技巧在压轴题中很实用！关键是找到合适的分拆方式，让中间项能够相互抵消。',
      type: '挑战心得',
      likes: 68,
      comments_count: 23,
      name: '数列达人',
      createdAt: '2025-01-12T09:15:00Z'
    },
    {
      id: 4,
      userId: 1,
      title: '导数在生活中的应用',
      content: '导数其实就是瞬时变化率。比如汽车速度表显示的就是位移对时间的导数。经济学中的边际成本、边际收益也是导数的应用。理解了这一点，抽象的导数概念就变得具体了！',
      type: '进阶心得',
      likes: 35,
      comments_count: 12,
      name: '导数小王子',
      createdAt: '2025-01-11T16:45:00Z'
    },
    {
      id: 5,
      userId: 1,
      title: '指数函数与对数函数的互逆关系',
      content: '指数函数和对数函数是互逆的！a^x = y 等价于 log_a(y) = x。这个关系在解指数方程和对数方程时非常有用。记住：指数函数的底数和对数函数的底数要相同。',
      type: '入门心得',
      likes: 28,
      comments_count: 6,
      name: '指数爱好者',
      createdAt: '2025-01-10T11:20:00Z'
    },
    {
      id: 6,
      userId: 1,
      title: '三角函数的诱导公式记忆法',
      content: '诱导公式可以用"奇变偶不变，符号看象限"来记忆。π/2的奇数倍要变函数名（sin变cos），偶数倍不变。符号根据原函数在对应象限的符号确定。',
      type: '进阶心得',
      likes: 55,
      comments_count: 18,
      name: '三角专家',
      createdAt: '2025-01-09T15:30:00Z'
    },
    {
      id: 7,
      userId: 1,
      title: '等差数列求和公式的推导',
      content: '等差数列求和公式 S_n = n(a₁ + a_n)/2 的推导很简单：把数列正着写一遍，倒着写一遍，对应项相加都是 a₁ + a_n，共有 n 项，所以总和是 n(a₁ + a_n)，除以2就是前n项和。',
      type: '入门心得',
      likes: 33,
      comments_count: 9,
      name: '数列新手',
      createdAt: '2025-01-08T09:45:00Z'
    },
    {
      id: 8,
      userId: 1,
      title: '等比数列求和公式的应用技巧',
      content: '等比数列求和时，要注意公比q是否等于1。q=1时，S_n = na₁；q≠1时，用公式 S_n = a₁(1-qⁿ)/(1-q)。在求极限时，如果|q|<1，当n→∞时，qⁿ→0，所以 S = a₁/(1-q)。',
      type: '进阶心得',
      likes: 47,
      comments_count: 14,
      name: '数列高手',
      createdAt: '2025-01-07T13:15:00Z'
    },
    {
      id: 9,
      userId: 1,
      title: '导数的几何意义：切线斜率',
      content: '函数在某点的导数，就是函数图像在该点处切线的斜率。如果导数大于0，函数在该点附近单调递增；如果导数小于0，函数在该点附近单调递减。导数为0的点可能是极值点。',
      type: '进阶心得',
      likes: 52,
      comments_count: 16,
      name: '几何达人',
      createdAt: '2025-01-06T10:00:00Z'
    },
    {
      id: 10,
      userId: 1,
      title: '复合函数求导的链式法则',
      content: '复合函数求导用链式法则：如果 y = f(g(x))，那么 y\' = f\'(g(x)) · g\'(x)。记住：从外到内，一层一层求导，然后相乘。比如 (sin(x²))\' = cos(x²) · 2x。',
      type: '挑战心得',
      likes: 61,
      comments_count: 21,
      name: '微积分大师',
      createdAt: '2025-01-05T14:50:00Z'
    },
    {
      id: 11,
      userId: 1,
      title: '概率计算中的排列与组合',
      content: '排列考虑顺序，组合不考虑顺序。排列数 A(n,m) = n!/(n-m)!，组合数 C(n,m) = n!/(m!(n-m)!)。在概率题中，要分清是排列还是组合，这直接影响计算结果。',
      type: '入门心得',
      likes: 39,
      comments_count: 11,
      name: '概率新手',
      createdAt: '2025-01-04T08:30:00Z'
    },
    {
      id: 12,
      userId: 1,
      title: '条件概率与独立事件',
      content: '条件概率 P(A|B) = P(AB)/P(B)。如果 P(A|B) = P(A)，则A和B相互独立。独立事件满足 P(AB) = P(A)·P(B)。注意：互斥事件和独立事件是不同的概念！',
      type: '进阶心得',
      likes: 44,
      comments_count: 13,
      name: '统计专家',
      createdAt: '2025-01-03T12:00:00Z'
    },
    {
      id: 13,
      userId: 1,
      title: '函数的周期性判断方法',
      content: '判断函数是否周期函数，关键是找到最小正周期T，使得 f(x+T) = f(x) 对所有x成立。三角函数都有周期，比如 sin x 和 cos x 的周期是 2π，tan x 的周期是 π。',
      type: '进阶心得',
      likes: 38,
      comments_count: 10,
      name: '周期探索者',
      createdAt: '2025-01-02T16:20:00Z'
    },
    {
      id: 14,
      userId: 1,
      title: '对数运算的换底公式',
      content: '换底公式：log_a(b) = log_c(b) / log_c(a)。常用的是换成以10为底或以e为底。这个公式在化简对数表达式时非常有用，特别是当底数不同时。',
      type: '入门心得',
      likes: 31,
      comments_count: 7,
      name: '对数学习者',
      createdAt: '2025-01-01T09:10:00Z'
    },
    {
      id: 15,
      userId: 1,
      title: '函数图像的对称性',
      content: '如果 f(-x) = f(x)，函数关于y轴对称（偶函数）；如果 f(-x) = -f(x)，函数关于原点对称（奇函数）。利用对称性可以简化函数图像的绘制和分析。',
      type: '进阶心得',
      likes: 41,
      comments_count: 12,
      name: '图像分析家',
      createdAt: '2024-12-31T11:40:00Z'
    }
  ],
  contacts: [] // 联系表单提交记录
};

// JWT 认证中间件
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '无效的认证令牌' });
    }
    req.user = user;
    next();
  });
  }
  
// 获取用户对象
function getUserById(userId) {
  return mockData.users.find(u => u.id === userId);
}

// API 路由

// POST /api/login - 用户登录
app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;

    // 支持快速体验（demo用户）
    if (username === 'demo' && (!password || password === 'demo')) {
      const user = getUserById(1);
      if (user) {
        const token = jwt.sign(
          { id: user.id, username: user.username },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            grade: user.grade,
            specialty: user.specialty,
            learning_goal: user.learning_goal,
            challenge_direction: user.challenge_direction,
            statistics: user.statistics
          }
        });
      }
    }

    // 普通登录验证
    const user = mockData.users.find(
      u => u.username === username && (!password || u.password === password)
    );
        
        if (user) {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
            user: {
              id: user.id,
          username: user.username,
          name: user.name,
          grade: user.grade,
          specialty: user.specialty,
          learning_goal: user.learning_goal,
          challenge_direction: user.challenge_direction,
          statistics: user.statistics
        }
      });
    }

    res.status(401).json({ error: '用户名或密码错误' });
      } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
      }
});
    
// GET /api/user - 获取用户信息
app.get('/api/user', authenticateToken, (req, res) => {
  try {
    const user = getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      grade: user.grade,
      specialty: user.specialty,
      learning_goal: user.learning_goal,
      challenge_direction: user.challenge_direction,
      statistics: user.statistics
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// GET /api/progress - 获取学习进度
app.get('/api/progress', authenticateToken, (req, res) => {
  try {
    const user = getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(user.progress);
  } catch (error) {
    console.error('获取进度错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
      }
});

// POST /api/progress/update - 更新关卡进度
app.post('/api/progress/update', authenticateToken, (req, res) => {
  try {
    const { theme, level } = req.body;
    const user = getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    if (!theme || !level) {
      return res.status(400).json({ error: '缺少必要参数：theme 和 level' });
    }
    
    // 更新进度
    if (!user.progress[theme]) {
      user.progress[theme] = [];
    }

    const levelIndex = user.progress[theme].findIndex(l => l.level === level);
    if (levelIndex >= 0) {
      user.progress[theme][levelIndex].completed = true;
    } else {
      user.progress[theme].push({ level, completed: true });
      }
      
    // 更新统计信息
    let completedCount = 0;
    Object.values(user.progress).forEach(levels => {
      completedCount += levels.filter(l => l.completed).length;
    });
    user.statistics.completed_levels = completedCount;
    user.statistics.points = (completedCount * 10) + (user.statistics.consecutive_days * 5);

    res.json({
      message: '进度更新成功',
      progress: user.progress,
      statistics: user.statistics
    });
  } catch (error) {
    console.error('更新进度错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// POST /api/checkin - 每日打卡
app.post('/api/checkin', authenticateToken, (req, res) => {
  try {
    const user = getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
      }

    const today = new Date().toISOString().split('T')[0];
    const lastCheckin = user.lastCheckin ? new Date(user.lastCheckin).toISOString().split('T')[0] : null;

    if (lastCheckin === today) {
      return res.json({
        message: '今天已经打卡过了',
        consecutive_days: user.statistics.consecutive_days,
        points: user.statistics.points
      });
      }
      
    // 检查是否连续打卡
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastCheckin === yesterdayStr) {
      // 连续打卡
      user.statistics.consecutive_days += 1;
    } else if (lastCheckin !== today) {
      // 中断了，重新开始
      user.statistics.consecutive_days = 1;
    }

    user.lastCheckin = new Date().toISOString();
    user.statistics.points += 10; // 打卡奖励积分

    res.json({
      message: '打卡成功！获得10积分',
      consecutive_days: user.statistics.consecutive_days,
      points: user.statistics.points
    });
  } catch (error) {
    console.error('打卡错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
          }
});

// GET /api/notes - 获取心得列表
app.get('/api/notes', authenticateToken, (req, res) => {
  try {
    // 返回所有心得（可以添加分页、筛选等功能）
    const notes = mockData.notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content,
      type: note.type,
      likes: note.likes,
      comments_count: note.comments_count,
      name: note.name,
      createdAt: note.createdAt
    }));

    res.json(notes);
      } catch (error) {
    console.error('获取心得列表错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
      }
});

// POST /api/notes/:id/like - 点赞心得
app.post('/api/notes/:id/like', authenticateToken, (req, res) => {
  try {
    const noteId = parseInt(req.params.id);
    const note = mockData.notes.find(n => n.id === noteId);

    if (!note) {
      return res.status(404).json({ error: '心得不存在' });
    }

    note.likes += 1;

    res.json({
      message: '点赞成功',
      likes: note.likes
    });
  } catch (error) {
    console.error('点赞错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// POST /api/contact - 提交联系表单
app.post('/api/contact', authenticateToken, (req, res) => {
  try {
    const { name, contact, message } = req.body;

    if (!name || !contact || !message) {
      return res.status(400).json({ error: '请填写所有必填字段' });
    }

    const contactRecord = {
      id: mockData.contacts.length + 1,
      name,
      contact,
      message,
      userId: req.user.id,
      createdAt: new Date().toISOString()
    };

    mockData.contacts.push(contactRecord);

    res.json({
      message: '反馈提交成功！我们会尽快回复您。'
    });
  } catch (error) {
    console.error('提交联系表单错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
    }
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'MathMaster API 服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// 处理根路径，返回 index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('========================================');
  console.log('MathMaster 后端服务器启动成功！');
  console.log(`服务器运行在: http://localhost:${PORT}`);
  console.log('========================================');
  console.log('API 端点列表：');
  console.log('  POST   /api/login              - 用户登录');
  console.log('  GET    /api/user               - 获取用户信息');
  console.log('  GET    /api/progress           - 获取学习进度');
  console.log('  POST   /api/progress/update    - 更新关卡进度');
  console.log('  POST   /api/checkin            - 每日打卡');
  console.log('  GET    /api/notes              - 获取心得列表');
  console.log('  POST   /api/notes/:id/like     - 点赞心得');
  console.log('  POST   /api/contact            - 提交联系表单');
  console.log('  GET    /api/health             - 健康检查');
  console.log('========================================');
  console.log('提示：可以直接访问 http://localhost:3000 查看网站');
  console.log('========================================');
});
