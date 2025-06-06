// 测试官方示例格式
import { WeChatBot } from './src/utils/wechatBot.js';

const bot = new WeChatBot('a1871121-70b0-48a3-b3c1-f37240c7a5b3');

// 官方示例格式
const officialFormat = {
  "msgtype": "markdown",
  "markdown": {
    "content": "实时新增用户反馈<font color=\"warning\">132例</font>，请相关同事注意。\n> 类型:<font color=\"comment\">用户反馈</font>\n> 普通用户反馈:<font color=\"comment\">117例</font>\n> VIP用户反馈:<font color=\"comment\">15例</font>"
  }
};

// 我们当前的格式（简化版）
const ourFormat = {
  "msgtype": "markdown",
  "markdown": {
    "content": "## ☕ 阿泰会务服务申请\n\n> **服务类型**: <font color=\"comment\">茶水服务</font>\n> **申请时间**: 2025/6/6 18:21:30\n> **会议室**: 会议室A\n> **申请人**: 测试用户\n\n**服务详情**:\n- 服务类型: **更换**\n- 数量: 1\n- 备注: 用户通过阿泰会务服务系统申请\n\n---\n*请相关工作人员及时处理此服务申请*"
  }
};

console.log('=== 测试官方示例格式 ===');
console.log(JSON.stringify(officialFormat, null, 2));

try {
  const result1 = await bot.sendMessage(officialFormat);
  console.log('官方格式发送结果:', result1);
} catch (error) {
  console.error('官方格式发送失败:', error);
}

console.log('\n=== 测试我们的格式 ===');
console.log(JSON.stringify(ourFormat, null, 2));

try {
  const result2 = await bot.sendMessage(ourFormat);
  console.log('我们的格式发送结果:', result2);
} catch (error) {
  console.error('我们的格式发送失败:', error);
}