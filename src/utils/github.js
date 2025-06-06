import axios from 'axios'

// GitHub配置
const GITHUB_CONFIG = {
  owner: 'lianbing22', // 替换为你的GitHub用户名
  repo: 'hysfw', // 替换为你的仓库名
  token: '', // 替换为你的GitHub Personal Access Token
  baseURL: 'https://api.github.com'
}

// 创建axios实例
const githubApi = axios.create({
  baseURL: GITHUB_CONFIG.baseURL,
  headers: {
    'Authorization': `token ${GITHUB_CONFIG.token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  }
})

// 标签定义
const LABELS = {
  SERVICE_REQUEST: 'service-request',
  SCHEDULE: 'schedule',
  STAFF: 'staff',
  BUILDING_A: 'building-a',
  BUILDING_B: 'building-b',
  STATUS_PENDING: 'status-pending',
  STATUS_PROCESSING: 'status-processing',
  STATUS_COMPLETED: 'status-completed',
  PRIORITY_HIGH: 'priority-high',
  PRIORITY_NORMAL: 'priority-normal',
  PRIORITY_LOW: 'priority-low'
}

// 服务请求相关API
export const serviceApi = {
  // 创建服务请求Issue
  async createServiceIssue(service) {
    try {
      const labels = [LABELS.SERVICE_REQUEST, LABELS.STATUS_PENDING]
      
      // 添加楼栋标签
      const room = service.meetingRoom
      if (room.startsWith('A')) {
        labels.push(LABELS.BUILDING_A)
      } else if (room.startsWith('B')) {
        labels.push(LABELS.BUILDING_B)
      }
      
      // 添加优先级标签
      if (service.priority === 'high') {
        labels.push(LABELS.PRIORITY_HIGH)
      } else if (service.priority === 'low') {
        labels.push(LABELS.PRIORITY_LOW)
      } else {
        labels.push(LABELS.PRIORITY_NORMAL)
      }
      
      const issueData = {
        title: `服务请求 - ${service.meetingRoom} - ${service.serviceType}`,
        body: this.formatServiceIssueBody(service),
        labels
      }
      
      const response = await githubApi.post(
        `/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues`,
        issueData
      )
      
      return {
        ...service,
        issueNumber: response.data.number,
        issueUrl: response.data.html_url
      }
    } catch (error) {
      console.error('创建服务请求Issue失败:', error)
      throw error
    }
  },
  
  // 更新服务请求Issue
  async updateServiceIssue(serviceId, updateData) {
    try {
      // 这里需要根据serviceId找到对应的Issue number
      // 实际实现中可能需要在本地存储或通过搜索API找到对应的Issue
      const issueNumber = await this.findIssueByServiceId(serviceId)
      
      const labels = [LABELS.SERVICE_REQUEST]
      
      // 更新状态标签
      if (updateData.status === 'processing') {
        labels.push(LABELS.STATUS_PROCESSING)
      } else if (updateData.status === 'completed') {
        labels.push(LABELS.STATUS_COMPLETED)
      } else {
        labels.push(LABELS.STATUS_PENDING)
      }
      
      const issueData = {
        body: this.formatServiceIssueBody({ ...updateData }),
        labels
      }
      
      const response = await githubApi.patch(
        `/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues/${issueNumber}`,
        issueData
      )
      
      return response.data
    } catch (error) {
      console.error('更新服务请求Issue失败:', error)
      throw error
    }
  },
  
  // 获取服务请求列表
  async getServiceIssues(filters = {}) {
    try {
      const params = {
        labels: LABELS.SERVICE_REQUEST,
        state: 'all',
        sort: 'created',
        direction: 'desc',
        per_page: 100
      }
      
      if (filters.status) {
        params.labels += `,status-${filters.status}`
      }
      
      if (filters.building) {
        params.labels += `,building-${filters.building.toLowerCase()}`
      }
      
      const response = await githubApi.get(
        `/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues`,
        { params }
      )
      
      return response.data.map(issue => this.parseServiceIssue(issue))
    } catch (error) {
      console.error('获取服务请求列表失败:', error)
      throw error
    }
  },
  
  // 格式化服务请求Issue内容
  formatServiceIssueBody(service) {
    return `
## 服务请求详情

**服务ID**: ${service.id}
**会议室**: ${service.meetingRoom}
**服务类型**: ${service.serviceType}
**优先级**: ${service.priority || 'normal'}
**请求时间**: ${service.requestTime}
**请求人**: ${service.requester}
**描述**: ${service.description || '无'}

## 服务状态

**当前状态**: ${service.status}
**分配服务员**: ${service.assignedStaff ? JSON.stringify(service.assignedStaff) : '未分配'}
**开始时间**: ${service.startTime || '未开始'}
**完成时间**: ${service.completedTime || '未完成'}
**预计用时**: ${service.estimatedTime}分钟

---
*此Issue由会议室服务系统自动创建*
    `.trim()
  },
  
  // 解析服务请求Issue
  parseServiceIssue(issue) {
    // 从Issue body中解析服务请求数据
    // 这里需要实现解析逻辑，从Markdown格式中提取数据
    const body = issue.body || ''
    
    // 简化的解析逻辑，实际应该更robust
    const serviceIdMatch = body.match(/\*\*服务ID\*\*: (.+)/)
    const meetingRoomMatch = body.match(/\*\*会议室\*\*: (.+)/)
    const serviceTypeMatch = body.match(/\*\*服务类型\*\*: (.+)/)
    const statusMatch = body.match(/\*\*当前状态\*\*: (.+)/)
    
    return {
      id: serviceIdMatch ? serviceIdMatch[1] : `issue_${issue.number}`,
      meetingRoom: meetingRoomMatch ? meetingRoomMatch[1] : '',
      serviceType: serviceTypeMatch ? serviceTypeMatch[1] : '',
      status: statusMatch ? statusMatch[1] : 'pending',
      issueNumber: issue.number,
      issueUrl: issue.html_url,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at
    }
  },
  
  // 根据服务ID查找Issue编号
  async findIssueByServiceId(serviceId) {
    try {
      const response = await githubApi.get(
        `/search/issues?q=repo:${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}+label:${LABELS.SERVICE_REQUEST}+"${serviceId}"`
      )
      
      if (response.data.items.length > 0) {
        return response.data.items[0].number
      }
      
      throw new Error(`未找到服务ID为 ${serviceId} 的Issue`)
    } catch (error) {
      console.error('查找Issue失败:', error)
      throw error
    }
  }
}

// 排班相关API
export const scheduleApi = {
  // 创建排班Issue
  async createScheduleIssue(schedule) {
    try {
      const issueData = {
        title: `排班 - ${schedule.date} - ${schedule.building}座`,
        body: this.formatScheduleIssueBody(schedule),
        labels: [LABELS.SCHEDULE, `building-${schedule.building.toLowerCase()}`]
      }
      
      const response = await githubApi.post(
        `/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues`,
        issueData
      )
      
      return {
        ...schedule,
        issueNumber: response.data.number,
        issueUrl: response.data.html_url
      }
    } catch (error) {
      console.error('创建排班Issue失败:', error)
      throw error
    }
  },
  
  // 获取排班列表
  async getScheduleIssues(year, month) {
    try {
      const response = await githubApi.get(
        `/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues`,
        {
          params: {
            labels: LABELS.SCHEDULE,
            state: 'all',
            per_page: 100
          }
        }
      )
      
      return response.data
        .map(issue => this.parseScheduleIssue(issue))
        .filter(schedule => {
          if (!year || !month) return true
          const date = new Date(schedule.date)
          return date.getFullYear() === year && date.getMonth() + 1 === month
        })
    } catch (error) {
      console.error('获取排班列表失败:', error)
      throw error
    }
  },
  
  // 格式化排班Issue内容
  formatScheduleIssueBody(schedule) {
    return `
## 排班信息

**日期**: ${schedule.date}
**楼栋**: ${schedule.building}座
**早班**: ${schedule.morningShift || '无'}
**午班**: ${schedule.afternoonShift || '无'}
**晚班**: ${schedule.eveningShift || '无'}
**备注**: ${schedule.notes || '无'}

**创建时间**: ${schedule.createdTime}
**更新时间**: ${schedule.updatedTime}

---
*此Issue由会议室服务系统自动创建*
    `.trim()
  },
  
  // 解析排班Issue
  parseScheduleIssue(issue) {
    const body = issue.body || ''
    
    const dateMatch = body.match(/\*\*日期\*\*: (.+)/)
    const buildingMatch = body.match(/\*\*楼栋\*\*: (.+)/)
    const morningMatch = body.match(/\*\*早班\*\*: (.+)/)
    const afternoonMatch = body.match(/\*\*午班\*\*: (.+)/)
    const eveningMatch = body.match(/\*\*晚班\*\*: (.+)/)
    
    return {
      id: `schedule_${issue.number}`,
      date: dateMatch ? dateMatch[1] : '',
      building: buildingMatch ? buildingMatch[1].replace('座', '') : '',
      morningShift: morningMatch && morningMatch[1] !== '无' ? morningMatch[1] : null,
      afternoonShift: afternoonMatch && afternoonMatch[1] !== '无' ? afternoonMatch[1] : null,
      eveningShift: eveningMatch && eveningMatch[1] !== '无' ? eveningMatch[1] : null,
      issueNumber: issue.number,
      issueUrl: issue.html_url,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at
    }
  }
}

// 服务员相关API
export const staffApi = {
  // 获取服务员列表
  async getStaffIssues() {
    try {
      const response = await githubApi.get(
        `/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues`,
        {
          params: {
            labels: LABELS.STAFF,
            state: 'all',
            per_page: 100
          }
        }
      )
      
      return response.data.map(issue => this.parseStaffIssue(issue))
    } catch (error) {
      console.error('获取服务员列表失败:', error)
      throw error
    }
  },
  
  // 解析服务员Issue
  parseStaffIssue(issue) {
    const body = issue.body || ''
    
    // 解析服务员信息
    return {
      id: `staff_${issue.number}`,
      name: issue.title.replace('服务员 - ', ''),
      issueNumber: issue.number,
      issueUrl: issue.html_url
    }
  }
}

// 导出统一的API对象
export const githubApi = {
  ...serviceApi,
  ...scheduleApi,
  ...staffApi,
  
  // 通用方法
  async createIssue(title, body, labels = []) {
    try {
      const response = await githubApi.post(
        `/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues`,
        { title, body, labels }
      )
      return response.data
    } catch (error) {
      console.error('创建Issue失败:', error)
      throw error
    }
  },
  
  async updateIssue(issueNumber, data) {
    try {
      const response = await githubApi.patch(
        `/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues/${issueNumber}`,
        data
      )
      return response.data
    } catch (error) {
      console.error('更新Issue失败:', error)
      throw error
    }
  },
  
  async closeIssue(issueNumber) {
    try {
      const response = await githubApi.patch(
        `/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues/${issueNumber}`,
        { state: 'closed' }
      )
      return response.data
    } catch (error) {
      console.error('关闭Issue失败:', error)
      throw error
    }
  }
}

export default githubApi