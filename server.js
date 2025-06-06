import express from 'express';
import cors from 'cors';
import { WeChatBot } from './src/utils/wechatBot.js';

const app = express();
const port = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 创建企业微信机器人实例
const wechatBot = new WeChatBot('a1871121-70b0-48a3-b3c1-f37240c7a5b3');

// 企业微信通知接口
app.post('/api/wechat/notify', async (req, res) => {
  try {
    console.log('收到企业微信通知请求:', req.body);
    
    const { serviceInfo } = req.body;
    
    if (!serviceInfo) {
      return res.status(400).json({ error: '缺少服务信息' });
    }
    
    // 发送企业微信通知
    const result = await wechatBot.sendServiceRequest(serviceInfo);
    
    console.log('企业微信通知发送成功:', result);
    res.json({ success: true, result });
    
  } catch (error) {
    console.error('企业微信通知发送失败:', error);
    res.status(500).json({ 
      error: '发送失败', 
      message: error.message 
    });
  }
});

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(port, () => {
  console.log(`企业微信通知服务器运行在 http://localhost:${port}`);
  console.log(`API端点: http://localhost:${port}/api/wechat/notify`);
});

export default app;