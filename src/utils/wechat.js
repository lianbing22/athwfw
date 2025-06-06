import axios from 'axios'

// 企业微信机器人配置
const WECHAT_CONFIG = {
  webhookUrl: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=693a91f6-7xxx-4bc4-97a0-0ec2sifa5aaa'
}

// 创建axios实例
const wechatApi = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 消息类型枚举
export const MESSAGE_TYPES = {
  TEXT: 'text',
  MARKDOWN: 'markdown',
  IMAGE: 'image',
  NEWS: 'news',
  FILE: 'file',
  VOICE: 'voice',
  TEMPLATE_CARD: 'template_card'
}

// 企业微信机器人API
export const wechatBot = {
  // 发送文本消息
  async sendText(content, mentionedList = [], mentionedMobileList = []) {
    try {
      const data = {
        msgtype: MESSAGE_TYPES.TEXT,
        text: {
          content,
          mentioned_list: mentionedList,
          mentioned_mobile_list: mentionedMobileList
        }
      }
      
      const response = await wechatApi.post(WECHAT_CONFIG.webhookUrl, data)
      return response.data
    } catch (error) {
      console.error('发送文本消息失败:', error)
      throw error
    }
  },
  
  // 发送Markdown消息
  async sendMarkdown(content) {
    try {
      const data = {
        msgtype: MESSAGE_TYPES.MARKDOWN,
        markdown: {
          content
        }
      }
      
      const response = await wechatApi.post(WECHAT_CONFIG.webhookUrl, data)
      return response.data
    } catch (error) {
      console.error('发送Markdown消息失败:', error)
      throw error
    }
  },
  
  // 发送图片消息
  async sendImage(base64, md5) {
    try {
      const data = {
        msgtype: MESSAGE_TYPES.IMAGE,
        image: {
          base64,
          md5
        }
      }
      
      const response = await wechatApi.post(WECHAT_CONFIG.webhookUrl, data)
      return response.data
    } catch (error) {
      console.error('发送图片消息失败:', error)
      throw error
    }
  },
  
  // 发送图文消息
  async sendNews(articles) {
    try {
      const data = {
        msgtype: MESSAGE_TYPES.NEWS,
        news: {
          articles
        }
      }
      
      const response = await wechatApi.post(WECHAT_CONFIG.webhookUrl, data)
      return response.data
    } catch (error) {
      console.error('发送图文消息失败:', error)
      throw error
    }
  },
  
  // 发送文件消息
  async sendFile(mediaId) {
    try {
      const data = {
        msgtype: MESSAGE_TYPES.FILE,
        file: {
          media_id: mediaId
        }
      }
      
      const response = await wechatApi.post(WECHAT_CONFIG.webhookUrl, data)
      return response.data
    } catch (error) {
      console.error('发送文件消息失败:', error)
      throw error
    }
  },
  
  // 发送语音消息
  async sendVoice(mediaId) {
    try {
      const data = {
        msgtype: MESSAGE_TYPES.VOICE,
        voice: {
          media_id: mediaId
        }
      }
      
      const response = await wechatApi.post(WECHAT_CONFIG.webhookUrl, data)
      return response.data
    } catch (error) {
      console.error('发送语音消息失败:', error)
      throw error
    }
  },
  
  // 发送模板卡片消息
  async sendTemplateCard(cardType, cardData) {
    try {
      const data = {
        msgtype: MESSAGE_TYPES.TEMPLATE_CARD,
        template_card: {
          card_type: cardType,
          ...cardData
        }
      }
      
      const response = await wechatApi.post(WECHAT_CONFIG.webhookUrl, data)
      return response.data
    } catch (error) {
      console.error('发送模板卡片消息失败:', error)
      throw error
    }
  }
}

// 服务请求通知模板
export const serviceNotifications = {
  // 新服务请求通知
  async notifyNewService(service) {
    const content = `## 🔔 新服务请求

**会议室**: ${service.meetingRoom}
**服务类型**: ${service.serviceType}
**请求人**: ${service.requester}
**请求时间**: ${service.requestTime}
**描述**: ${service.description || '无'}
**优先级**: ${service.priority === 'high' ? '🔴 高' : service.priority === 'low' ? '🟢 低' : '🟡 普通'}

> 请相关服务员及时处理`
    
    return await wechatBot.sendMarkdown(content)
  },
  
  // 服务状态更新通知
  async notifyServiceUpdate(service, oldStatus, newStatus) {
    const statusEmoji = {
      pending: '⏳',
      processing: '🔄',
      completed: '✅',
      cancelled: '❌'
    }
    
    const statusText = {
      pending: '待处理',
      processing: '处理中',
      completed: '已完成',
      cancelled: '已取消'
    }
    
    const content = `## 📋 服务状态更新

**会议室**: ${service.meetingRoom}
**服务类型**: ${service.serviceType}
**状态变更**: ${statusEmoji[oldStatus]} ${statusText[oldStatus]} → ${statusEmoji[newStatus]} ${statusText[newStatus]}
**处理人**: ${service.assignedStaff ? service.assignedStaff.map(s => s.name).join(', ') : '未分配'}
**更新时间**: ${new Date().toLocaleString('zh-CN')}`
    
    if (newStatus === 'completed' && service.completedTime) {
      content += `\n**完成时间**: ${service.completedTime}`
    }
    
    return await wechatBot.sendMarkdown(content)
  },
  
  // 服务分配通知
  async notifyServiceAssignment(service, staff) {
    const content = `## 👥 服务分配通知

**会议室**: ${service.meetingRoom}
**服务类型**: ${service.serviceType}
**分配给**: ${staff.map(s => `@${s.name}`).join(' ')}
**请求时间**: ${service.requestTime}
**预计用时**: ${service.estimatedTime}分钟

> 请及时前往处理`
    
    const mentionedList = staff.map(s => s.wechatId).filter(Boolean)
    
    return await wechatBot.sendText(content, mentionedList)
  },
  
  // 紧急服务通知
  async notifyUrgentService(service) {
    const content = `## 🚨 紧急服务请求

**会议室**: ${service.meetingRoom}
**服务类型**: ${service.serviceType}
**请求人**: ${service.requester}
**请求时间**: ${service.requestTime}
**描述**: ${service.description || '无'}

> ⚠️ 此为紧急服务请求，请立即处理！`
    
    return await wechatBot.sendMarkdown(content)
  },
  
  // 服务超时提醒
  async notifyServiceTimeout(service) {
    const content = `## ⏰ 服务超时提醒

**会议室**: ${service.meetingRoom}
**服务类型**: ${service.serviceType}
**请求时间**: ${service.requestTime}
**已超时**: ${Math.floor((Date.now() - new Date(service.requestTime).getTime()) / 60000)}分钟
**分配服务员**: ${service.assignedStaff ? service.assignedStaff.map(s => s.name).join(', ') : '未分配'}

> ⚠️ 服务处理时间过长，请关注处理进度`
    
    return await wechatBot.sendMarkdown(content)
  }
}

// 排班通知模板
export const scheduleNotifications = {
  // 排班更新通知
  async notifyScheduleUpdate(date, building, schedules) {
    const content = `## 📅 排班更新通知

**日期**: ${date}
**楼栋**: ${building}座

**早班 (8:00-12:00)**: ${schedules.morningShift || '无'}
**午班 (12:00-18:00)**: ${schedules.afternoonShift || '无'}
**晚班 (18:00-22:00)**: ${schedules.eveningShift || '无'}

> 请相关服务员注意值班时间`
    
    return await wechatBot.sendMarkdown(content)
  },
  
  // 值班提醒
  async notifyShiftReminder(staff, shift, date, building) {
    const shiftText = {
      morning: '早班 (8:00-12:00)',
      afternoon: '午班 (12:00-18:00)',
      evening: '晚班 (18:00-22:00)'
    }
    
    const content = `## 🔔 值班提醒

@${staff.name} 您好！

**日期**: ${date}
**楼栋**: ${building}座
**班次**: ${shiftText[shift]}

> 请准时到岗，做好服务准备工作`
    
    const mentionedList = staff.wechatId ? [staff.wechatId] : []
    
    return await wechatBot.sendText(content, mentionedList)
  },
  
  // 换班申请通知
  async notifyShiftChangeRequest(fromStaff, toStaff, date, shift, building) {
    const content = `## 🔄 换班申请

**申请人**: ${fromStaff.name}
**被换班人**: ${toStaff.name}
**日期**: ${date}
**班次**: ${shift}
**楼栋**: ${building}座

> 请管理员审核换班申请`
    
    return await wechatBot.sendMarkdown(content)
  }
}

// 系统通知模板
export const systemNotifications = {
  // 系统维护通知
  async notifyMaintenance(startTime, endTime, description) {
    const content = `## 🔧 系统维护通知

**维护时间**: ${startTime} - ${endTime}
**维护内容**: ${description}

> 维护期间系统可能无法正常使用，请提前做好安排`
    
    return await wechatBot.sendMarkdown(content)
  },
  
  // 每日统计报告
  async notifyDailyReport(date, stats) {
    const content = `## 📊 每日服务统计 (${date})

**总服务请求**: ${stats.total}个
**已完成**: ${stats.completed}个
**处理中**: ${stats.processing}个
**待处理**: ${stats.pending}个
**平均处理时间**: ${stats.avgTime}分钟

**各楼栋服务量**:
- A座: ${stats.buildingA}个
- B座: ${stats.buildingB}个

> 感谢各位服务员的辛勤工作！`
    
    return await wechatBot.sendMarkdown(content)
  },
  
  // 异常告警
  async notifyAlert(type, message, level = 'warning') {
    const levelEmoji = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      critical: '🚨'
    }
    
    const content = `## ${levelEmoji[level]} 系统告警

**告警类型**: ${type}
**告警信息**: ${message}
**告警时间**: ${new Date().toLocaleString('zh-CN')}

> 请相关人员及时处理`
    
    return await wechatBot.sendMarkdown(content)
  }
}

// 导出统一的通知API
export const notifications = {
  ...serviceNotifications,
  ...scheduleNotifications,
  ...systemNotifications,
  
  // 通用消息发送
  async send(type, content, options = {}) {
    switch (type) {
      case 'text':
        return await wechatBot.sendText(content, options.mentionedList, options.mentionedMobileList)
      case 'markdown':
        return await wechatBot.sendMarkdown(content)
      case 'image':
        return await wechatBot.sendImage(content.base64, content.md5)
      case 'news':
        return await wechatBot.sendNews(content)
      case 'file':
        return await wechatBot.sendFile(content)
      case 'voice':
        return await wechatBot.sendVoice(content)
      case 'template_card':
        return await wechatBot.sendTemplateCard(content.cardType, content.cardData)
      default:
        throw new Error(`不支持的消息类型: ${type}`)
    }
  }
}

export default notifications