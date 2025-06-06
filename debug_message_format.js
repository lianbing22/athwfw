// 调试企业微信消息格式
import { WeChatBot } from './src/utils/wechatBot.js';

// 创建一个调试版本的WeChatBot，重写sendMessage方法来查看实际发送的内容
class DebugWeChatBot extends WeChatBot {
  async sendMessage(data) {
    console.log('=== 实际发送的消息格式 ===');
    console.log(JSON.stringify(data, null, 2));
    console.log('=== 消息内容 ===');
    if (data.msgtype === 'markdown') {
      console.log(data.markdown.content);
    }
    console.log('=== 发送到API ===');
    
    // 调用原始的sendMessage方法
    return super.sendMessage(data);
  }
}

// 使用调试版本
const debugBot = new DebugWeChatBot('a1871121-70b0-48a3-b3c1-f37240c7a5b3');

// 模拟服务信息
const serviceInfo = {
  type: '茶水服务',
  details: {
    serviceType: '更换',
    quantity: 1,
    note: '用户通过阿泰会务服务系统申请'
  },
  roomInfo: {
    name: '会议室A'
  },
  userInfo: {
    name: '测试用户'
  },
  timestamp: Date.now()
};

console.log('开始调试消息格式...');

try {
  const result = await debugBot.sendServiceRequest(serviceInfo);
  console.log('\n=== API响应 ===');
  console.log(result);
} catch (error) {
  console.error('发送失败:', error);
}