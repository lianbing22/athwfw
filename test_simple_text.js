// 测试简单文本消息
import { WeChatBot } from './src/utils/wechatBot.js';

const bot = new WeChatBot('a1871121-70b0-48a3-b3c1-f37240c7a5b3');

console.log('=== 测试简单文本消息 ===');

try {
  // 发送简单文本消息
  const result1 = await bot.sendText('这是一条测试文本消息，请查收！');
  console.log('文本消息发送结果:', result1);
  
  // 等待2秒
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 发送带@all的文本消息
  const result2 = await bot.sendText('这是一条@所有人的测试消息', ['@all']);
  console.log('@all文本消息发送结果:', result2);
  
  // 等待2秒
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 发送简单的markdown消息
  const result3 = await bot.sendMarkdown('# 测试标题\n\n这是一条**简单**的markdown消息');
  console.log('简单markdown消息发送结果:', result3);
  
} catch (error) {
  console.error('发送失败:', error);
}