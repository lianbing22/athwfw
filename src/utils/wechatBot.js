/**
 * 企业微信群机器人工具类
 * 用于向企业微信群发送各种类型的消息
 */

class WeChatBot {
  constructor(webhookKey) {
    this.webhookUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${webhookKey}`;
  }

  /**
   * 发送HTTP请求到企业微信机器人
   * @param {Object} data - 消息数据
   * @returns {Promise} 请求结果
   */
  async sendMessage(data) {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.errcode !== 0) {
        throw new Error(`发送失败: ${result.errmsg}`);
      }
      
      return result;
    } catch (error) {
      console.error('企业微信消息发送失败:', error);
      throw error;
    }
  }

  /**
   * 发送文本消息
   * @param {string} content - 文本内容
   * @param {Array} mentionedList - @用户列表
   * @param {Array} mentionedMobileList - @手机号列表
   * @returns {Promise} 发送结果
   */
  async sendText(content, mentionedList = [], mentionedMobileList = []) {
    const data = {
      msgtype: 'text',
      text: {
        content,
        mentioned_list: mentionedList,
        mentioned_mobile_list: mentionedMobileList
      }
    };
    
    return this.sendMessage(data);
  }

  /**
   * 发送Markdown消息
   * @param {string} content - Markdown内容
   * @returns {Promise} 发送结果
   */
  async sendMarkdown(content) {
    const data = {
      msgtype: 'markdown',
      markdown: {
        content
      }
    };
    
    return this.sendMessage(data);
  }

  /**
   * 发送图文消息
   * @param {Array} articles - 图文列表
   * @returns {Promise} 发送结果
   */
  async sendNews(articles) {
    const data = {
      msgtype: 'news',
      news: {
        articles
      }
    };
    
    return this.sendMessage(data);
  }

  /**
   * 发送服务申请通知
   * @param {Object} serviceInfo - 服务信息
   * @returns {Promise} 发送结果
   */
  async sendServiceRequest(serviceInfo) {
    const { type, details, roomInfo, userInfo, timestamp } = serviceInfo;
    
    // 根据服务类型设置图标和颜色
    const serviceConfig = {
      '空调调温': { icon: '❄️', color: 'info' },
      '茶水服务': { icon: '☕', color: 'comment' },
      '设备维护': { icon: '🎤', color: 'warning' }
    };
    
    const config = serviceConfig[type] || { icon: '📋', color: 'comment' };
    const time = new Date(timestamp).toLocaleString('zh-CN');
    
    const content = `## ${config.icon} 阿泰会务服务申请

` +
      `> **服务类型**: <font color="${config.color}">${type}</font>\n` +
      `> **申请时间**: ${time}\n` +
      `> **会议室**: ${roomInfo?.name || '未知'}\n` +
      `> **申请人**: ${userInfo?.name || '匿名用户'}\n\n` +
      `**服务详情**:\n${this.formatServiceDetails(type, details)}\n\n` +
      `---\n` +
      `*请相关工作人员及时处理此服务申请*`;
    
    return this.sendMarkdown(content);
  }

  /**
   * 格式化服务详情
   * @param {string} type - 服务类型
   * @param {Object} details - 服务详情
   * @returns {string} 格式化后的详情
   */
  formatServiceDetails(type, details) {
    switch (type) {
      case '空调调温':
        return `- 目标温度: **${details.temperature}°C**\n- 备注: ${details.note || '无'}`;
      
      case '茶水服务':
        return `- 服务类型: **${details.serviceType}**\n- 数量: ${details.quantity || 1}\n- 备注: ${details.note || '无'}`;
      
      case '设备维护':
        return `- 设备类型: **${details.equipmentType}**\n- 问题描述: ${details.issue}\n- 紧急程度: ${details.urgency || '普通'}`;
      
      default:
        return JSON.stringify(details, null, 2);
    }
  }

  /**
   * 发送服务完成通知
   * @param {Object} serviceInfo - 服务信息
   * @returns {Promise} 发送结果
   */
  async sendServiceCompleted(serviceInfo) {
    const { type, roomInfo, completedBy, completedAt } = serviceInfo;
    
    const serviceConfig = {
      '空调调温': { icon: '❄️', color: 'info' },
      '茶水服务': { icon: '☕', color: 'comment' },
      '设备维护': { icon: '🎤', color: 'warning' }
    };
    
    const config = serviceConfig[type] || { icon: '✅', color: 'info' };
    const time = new Date(completedAt).toLocaleString('zh-CN');
    
    const content = `## ✅ 服务完成通知

` +
      `> **服务类型**: <font color="${config.color}">${config.icon} ${type}</font>\n` +
      `> **完成时间**: ${time}\n` +
      `> **会议室**: ${roomInfo?.name || '未知'}\n` +
      `> **处理人员**: ${completedBy}\n\n` +
      `**服务已完成，感谢您的耐心等待！**`;
    
    return this.sendMarkdown(content);
  }

  /**
   * 发送每日服务统计
   * @param {Object} stats - 统计数据
   * @returns {Promise} 发送结果
   */
  async sendDailyStats(stats) {
    const { date, totalRequests, completedRequests, pendingRequests, serviceBreakdown } = stats;
    
    const completionRate = totalRequests > 0 ? ((completedRequests / totalRequests) * 100).toFixed(1) : 0;
    
    let content = `## 📊 阿泰会务服务日报

`;
    content += `**日期**: ${date}\n\n`;
    content += `### 📈 总体统计
`;
    content += `- 总申请数: <font color="info">${totalRequests}</font>\n`;
    content += `- 已完成: <font color="info">${completedRequests}</font>\n`;
    content += `- 待处理: <font color="warning">${pendingRequests}</font>\n`;
    content += `- 完成率: <font color="info">${completionRate}%</font>\n\n`;
    
    if (serviceBreakdown && Object.keys(serviceBreakdown).length > 0) {
      content += `### 🔍 服务分类统计
`;
      Object.entries(serviceBreakdown).forEach(([service, count]) => {
        const config = {
          '空调调温': '❄️',
          '茶水服务': '☕',
          '设备维护': '🎤'
        };
        const icon = config[service] || '📋';
        content += `- ${icon} ${service}: ${count}次\n`;
      });
    }
    
    content += `\n---\n*数据统计时间: ${new Date().toLocaleString('zh-CN')}*`;
    
    return this.sendMarkdown(content);
  }
}

// 默认配置
const DEFAULT_WEBHOOK_KEY = 'a1871121-70b0-48a3-b3c1-f37240c7a5b3';

// 创建默认实例
const wechatBot = new WeChatBot(DEFAULT_WEBHOOK_KEY);

export { WeChatBot, wechatBot };
export default wechatBot;