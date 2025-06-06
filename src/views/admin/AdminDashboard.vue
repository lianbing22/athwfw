<template>
  <div class="admin-dashboard">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">管理后台</h1>
      <p class="page-subtitle">会议室服务管理系统</p>
    </div>

    <!-- 数据统计卡片 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <div class="stat-number">{{ totalServices }}</div>
            <div class="stat-label">总服务请求</div>
            <div class="stat-change positive" v-if="serviceGrowth > 0">
              +{{ serviceGrowth }}% 较上月
            </div>
          </div>
        </div>
        
        <div class="stat-card warning">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <div class="stat-number">{{ pendingServices }}</div>
            <div class="stat-label">待处理请求</div>
            <div class="stat-change" :class="{ negative: pendingGrowth > 0, positive: pendingGrowth < 0 }">
              {{ pendingGrowth > 0 ? '+' : '' }}{{ pendingGrowth }}% 较昨日
            </div>
          </div>
        </div>
        
        <div class="stat-card success">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-number">{{ completedServices }}</div>
            <div class="stat-label">已完成请求</div>
            <div class="stat-change positive">
              {{ completionRate }}% 完成率
            </div>
          </div>
        </div>
        
        <div class="stat-card info">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <div class="stat-number">{{ averageResponseTime }}</div>
            <div class="stat-label">平均响应时间</div>
            <div class="stat-change" :class="{ positive: responseTimeChange < 0, negative: responseTimeChange > 0 }">
              {{ responseTimeChange > 0 ? '+' : '' }}{{ responseTimeChange }}% 较上周
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <h3>快速操作</h3>
      <div class="actions-grid">
        <button class="action-card" @click="router.push('/admin/services')">
          <div class="action-icon">📋</div>
          <div class="action-title">服务管理</div>
          <div class="action-desc">查看和处理服务请求</div>
        </button>
        
        <button class="action-card" @click="router.push('/admin/schedule')">
          <div class="action-icon">📅</div>
          <div class="action-title">排班管理</div>
          <div class="action-desc">管理服务员排班</div>
        </button>
        
        <button class="action-card" @click="router.push('/admin/staff')">
          <div class="action-icon">👥</div>
          <div class="action-title">员工管理</div>
          <div class="action-desc">管理服务员信息</div>
        </button>
        
        <button class="action-card" @click="router.push('/admin/reports')">
          <div class="action-icon">📊</div>
          <div class="action-title">数据报表</div>
          <div class="action-desc">查看统计报表</div>
        </button>
      </div>
    </div>

    <!-- 待处理服务 -->
    <div class="pending-services">
      <div class="section-header">
        <h3>待处理服务</h3>
        <router-link to="/admin/services" class="btn btn-outline btn-sm">
          查看全部
        </router-link>
      </div>
      
      <div class="services-list" v-if="recentPendingServices.length > 0">
        <div 
          v-for="service in recentPendingServices" 
          :key="service.id"
          class="service-item"
          @click="router.push(`/admin/services/${service.id}`)"
        >
          <div class="service-info">
            <div class="service-header">
              <span class="service-id">#{{ service.id }}</span>
              <span class="service-type">{{ getServiceTypeName(service.type) }}</span>
              <span class="priority-badge" :class="service.priority">
                {{ getPriorityText(service.priority) }}
              </span>
            </div>
            
            <div class="service-details">
              <div class="service-room">
                <span class="room-icon">🏢</span>
                {{ getMeetingRoomName(service.meetingRoom) }}
              </div>
              <div class="service-requester">
                <span class="user-icon">👤</span>
                {{ service.requester }}
              </div>
              <div class="service-time">
                <span class="time-icon">⏰</span>
                {{ getRelativeTime(service.createdAt) }}
              </div>
            </div>
            
            <div class="service-description">
              {{ service.description || '无详细描述' }}
            </div>
          </div>
          
          <div class="service-actions">
            <button 
              class="btn btn-primary btn-sm"
              @click.stop="acceptService(service.id)"
            >
              接受
            </button>
            <button 
              class="btn btn-outline btn-sm"
              @click.stop="viewServiceDetail(service.id)"
            >
              详情
            </button>
          </div>
        </div>
      </div>
      
      <div class="empty-state" v-else>
        <div class="empty-icon">✨</div>
        <h4>暂无待处理服务</h4>
        <p>所有服务请求都已处理完成</p>
      </div>
    </div>

    <!-- 今日排班 -->
    <div class="today-schedule">
      <div class="section-header">
        <h3>今日排班</h3>
        <router-link to="/admin/schedule" class="btn btn-outline btn-sm">
          管理排班
        </router-link>
      </div>
      
      <div class="schedule-grid" v-if="todaySchedules.length > 0">
        <div 
          v-for="schedule in todaySchedules" 
          :key="schedule.id"
          class="schedule-card"
          :class="`building-${schedule.building.toLowerCase()}`"
        >
          <div class="schedule-header">
            <span class="building-name">{{ schedule.building }}座</span>
            <span class="schedule-date">{{ formatDate(schedule.date) }}</span>
          </div>
          
          <div class="schedule-shifts">
            <div class="shift-item" v-if="schedule.morningShift">
              <div class="shift-time">早班 (8:00-12:00)</div>
              <div class="shift-staff">{{ schedule.morningShift }}</div>
            </div>
            <div class="shift-item" v-if="schedule.afternoonShift">
              <div class="shift-time">午班 (12:00-18:00)</div>
              <div class="shift-staff">{{ schedule.afternoonShift }}</div>
            </div>
            <div class="shift-item" v-if="schedule.eveningShift">
              <div class="shift-time">晚班 (18:00-22:00)</div>
              <div class="shift-staff">{{ schedule.eveningShift }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="empty-state" v-else>
        <div class="empty-icon">📅</div>
        <h4>今日暂无排班</h4>
        <p>请安排今日的服务员值班</p>
        <router-link to="/admin/schedule" class="btn btn-primary btn-sm">
          立即安排
        </router-link>
      </div>
    </div>

    <!-- 系统状态 -->
    <div class="system-status">
      <h3>系统状态</h3>
      <div class="status-grid">
        <div class="status-item">
          <div class="status-indicator online"></div>
          <div class="status-info">
            <div class="status-title">GitHub API</div>
            <div class="status-desc">连接正常</div>
          </div>
        </div>
        
        <div class="status-item">
          <div class="status-indicator online"></div>
          <div class="status-info">
            <div class="status-title">企业微信机器人</div>
            <div class="status-desc">推送正常</div>
          </div>
        </div>
        
        <div class="status-item">
          <div class="status-indicator" :class="dataStatus"></div>
          <div class="status-info">
            <div class="status-title">数据同步</div>
            <div class="status-desc">{{ dataStatusText }}</div>
          </div>
        </div>
        
        <div class="status-item">
          <div class="status-indicator online"></div>
          <div class="status-info">
            <div class="status-title">系统运行时间</div>
            <div class="status-desc">{{ systemUptime }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="recent-activities">
      <h3>最近活动</h3>
      <div class="activities-list">
        <div 
          v-for="activity in recentActivities" 
          :key="activity.id"
          class="activity-item"
        >
          <div class="activity-icon" :class="activity.type">
            {{ getActivityIcon(activity.type) }}
          </div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-desc">{{ activity.description }}</div>
            <div class="activity-time">{{ getRelativeTime(activity.timestamp) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useServiceStore } from '@/stores/service'
import { useScheduleStore } from '@/stores/schedule'
import { getMeetingRoomName, getRelativeTime, formatTime } from '@/utils/common'

const router = useRouter()
const appStore = useAppStore()
const serviceStore = useServiceStore()
const scheduleStore = useScheduleStore()

// 响应式数据
const systemUptime = ref('2天 14小时 32分钟')
const dataStatus = ref('online')
const dataStatusText = ref('最后同步: 2分钟前')

// 计算属性
const totalServices = computed(() => {
  return serviceStore.services.length
})

const pendingServices = computed(() => {
  return serviceStore.pendingServices.length
})

const completedServices = computed(() => {
  return serviceStore.completedServices.length
})

const serviceGrowth = computed(() => {
  // 模拟数据，实际应该从API获取
  return 12
})

const pendingGrowth = computed(() => {
  // 模拟数据，实际应该从API获取
  return -8
})

const completionRate = computed(() => {
  const total = totalServices.value
  const completed = completedServices.value
  return total > 0 ? Math.round((completed / total) * 100) : 0
})

const averageResponseTime = computed(() => {
  // 模拟数据，实际应该计算真实的平均响应时间
  return '15分钟'
})

const responseTimeChange = computed(() => {
  // 模拟数据
  return -5
})

const recentPendingServices = computed(() => {
  return serviceStore.pendingServices
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
})

const todaySchedules = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return scheduleStore.schedules.filter(schedule => schedule.date === today)
})

const recentActivities = computed(() => {
  // 模拟最近活动数据
  return [
    {
      id: 1,
      type: 'service',
      title: '新服务请求',
      description: '张三申请了B座301会议室的设备维修服务',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      type: 'schedule',
      title: '排班更新',
      description: '李四的明日排班已更新为A座早班',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      type: 'completion',
      title: '服务完成',
      description: 'B座201会议室的清洁服务已完成',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: 4,
      type: 'system',
      title: '系统通知',
      description: '企业微信机器人推送功能已启用',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    }
  ]
})

// 方法
const getServiceTypeName = (type) => {
  const types = {
    'cleaning': '清洁服务',
    'maintenance': '设备维修',
    'setup': '会议布置',
    'catering': '茶水服务',
    'technical': '技术支持',
    'other': '其他服务'
  }
  return types[type] || type
}

const getPriorityText = (priority) => {
  const priorities = {
    'low': '低',
    'normal': '中',
    'high': '高',
    'urgent': '紧急'
  }
  return priorities[priority] || priority
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const getActivityIcon = (type) => {
  const icons = {
    'service': '📋',
    'schedule': '📅',
    'completion': '✅',
    'system': '⚙️'
  }
  return icons[type] || '📝'
}

const acceptService = async (serviceId) => {
  try {
    appStore.setLoading(true)
    await serviceStore.updateServiceStatus(serviceId, 'processing')
    // 可以添加成功提示
  } catch (error) {
    console.error('接受服务失败:', error)
    // 可以添加错误提示
  } finally {
    appStore.setLoading(false)
  }
}

const viewServiceDetail = (serviceId) => {
  router.push(`/admin/services/${serviceId}`)
}

const loadDashboardData = async () => {
  try {
    appStore.setLoading(true)
    await Promise.all([
      serviceStore.loadServices(),
      scheduleStore.loadSchedules(),
      scheduleStore.loadStaff()
    ])
  } catch (error) {
    console.error('加载仪表板数据失败:', error)
  } finally {
    appStore.setLoading(false)
  }
}

// 生命周期
onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin: 0;
}

.stats-section {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  border-left: 4px solid var(--border-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.stat-card.primary {
  border-left-color: var(--primary-color);
}

.stat-card.warning {
  border-left-color: var(--warning-color);
}

.stat-card.success {
  border-left-color: var(--success-color);
}

.stat-card.info {
  border-left-color: var(--info-color);
}

.stat-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-number {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 5px;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: 5px;
}

.stat-change {
  font-size: 0.85rem;
  font-weight: 500;
}

.stat-change.positive {
  color: var(--success-color);
}

.stat-change.negative {
  color: var(--error-color);
}

.quick-actions {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.quick-actions h3 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
  font-size: 1.4rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.action-card {
  background: var(--background-light);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.action-card:hover {
  background: var(--primary-light);
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 2rem;
  margin-bottom: 5px;
}

.action-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
}

.action-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.pending-services,
.today-schedule,
.system-status,
.recent-activities {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.section-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.4rem;
}

.services-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.service-item {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.service-item:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.service-info {
  flex: 1;
}

.service-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.service-id {
  font-weight: 600;
  color: var(--primary-color);
}

.service-type {
  background: var(--info-light);
  color: var(--info-color);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.priority-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.priority-badge.low {
  background: var(--success-light);
  color: var(--success-color);
}

.priority-badge.normal {
  background: var(--info-light);
  color: var(--info-color);
}

.priority-badge.high {
  background: var(--warning-light);
  color: var(--warning-color);
}

.priority-badge.urgent {
  background: var(--error-light);
  color: var(--error-color);
}

.service-details {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.service-details > div {
  display: flex;
  align-items: center;
  gap: 5px;
}

.service-description {
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 1.4;
}

.service-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.6;
}

.empty-state h4 {
  color: var(--text-primary);
  margin-bottom: 10px;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.schedule-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid var(--border-color);
}

.schedule-card.building-a {
  border-left-color: var(--primary-color);
}

.schedule-card.building-b {
  border-left-color: var(--success-color);
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.building-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.schedule-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.schedule-shifts {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shift-item {
  background: var(--background-light);
  padding: 10px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shift-time {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.shift-staff {
  font-weight: 500;
  color: var(--text-primary);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: var(--background-light);
  border-radius: 8px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-indicator.online {
  background: var(--success-color);
}

.status-indicator.offline {
  background: var(--error-color);
}

.status-indicator.warning {
  background: var(--warning-color);
}

.status-title {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.status-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: var(--background-light);
  border-radius: 8px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.activity-icon.service {
  background: var(--primary-light);
}

.activity-icon.schedule {
  background: var(--info-light);
}

.activity-icon.completion {
  background: var(--success-light);
}

.activity-icon.system {
  background: var(--warning-light);
}

.activity-title {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 5px;
}

.activity-desc {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 5px;
  line-height: 1.4;
}

.activity-time {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 15px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .service-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .service-actions {
    justify-content: flex-end;
  }
  
  .service-details {
    flex-direction: column;
    gap: 5px;
  }
  
  .schedule-grid {
    grid-template-columns: 1fr;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
}
</style>