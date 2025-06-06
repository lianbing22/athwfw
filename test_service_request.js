// 测试企业微信服务申请通知格式
import wechatBot from './src/utils/wechatBot.js';

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

console.log('准备发送服务申请通知...');
console.log('服务信息:', JSON.stringify(serviceInfo, null, 2));

// 测试发送
try {
  const result = await wechatBot.sendServiceRequest(serviceInfo);
  console.log('发送成功:', result);
} catch (error) {
  console.error('发送失败:', error);
  console.error('错误详情:', error.message);
}