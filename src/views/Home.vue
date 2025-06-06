<template>
  <div class="home-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">会议室服务系统</h1>
      <p class="page-subtitle">为您提供专业的会议室服务</p>
    </div>

    <!-- 快速操作区域 -->
    <div class="quick-actions">
      <div class="action-card primary" @click="$router.push('/meeting-service')">
        <div class="action-icon">📱</div>
        <div class="action-content">
          <div class="action-title">会中扫码服务</div>
          <div class="action-desc">空调调温 · 茶水服务 · 设备维护</div>
        </div>
        <div class="action-badge">MVP</div>
      </div>
      
      <div class="action-card" @click="goToServiceRequest">
        <div class="action-icon">🛎️</div>
        <h3>申请服务</h3>
        <p>快速申请会议室服务</p>
      </div>
      
      <div class="action-card" @click="goToServiceStatus">
        <div class="action-icon">📋</div>
        <h3>服务状态</h3>
        <p>查看服务处理进度</p>
      </div>
      
      <div class="action-card" @click="goToSchedule">
        <div class="action-icon">📅</div>
        <h3>值班安排</h3>
        <p>查看服务员排班</p>
      </div>
    </div>

    <!-- 当前服务状态 -->
    <div class="current-status" v-if="currentServices.length > 0">
      <h2>当前服务状态</h2>
      <div class="service-list">
        <div 
          v-for="service in currentServices" 
          :key="service.id"
          class="service-item"
          :class="`status-${service.status}`"
        >
          <div class="service-info">
            <div class="service-header">
              <span class="room-name">{{ service.meetingRoom }}</span>
              <span class="service-type">{{ service.serviceType }}</span>
              <span class="status-badge" :class="`status-${service.status}`">
                {{ getStatusText(service.status) }}
              </span>
            </div>
            <div class="service-details">
              <span class="request-time">{{ formatTime(service.requestTime) }}</span>
              <span class="requester">{{ service.requester }}</span>
            </div>
            <div class="service-progress" v-if="service.status === 'processing'">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: getProgress(service) + '%' }"></div>
              </div>
              <span class="progress-text">预计还需 {{ getRemainingTime(service) }} 分钟</span>
            </div>
          </div>
          <div class="service-actions">
            <button 
              v-if="service.status === 'pending'"
              class="btn btn-primary btn-sm"
              @click="cancelService(service.id)"
            >
              取消申请
            </button>
            <button 
              class="btn btn-outline btn-sm"
              @click="viewServiceDetail(service.id)"
            >
              查看详情
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 今日统计 -->
    <div class="daily-stats">
      <h2>今日统计</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">{{ todayStats.total }}</div>
          <div class="stat-label">总服务量</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ todayStats.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ todayStats.processing }}</div>
          <div class="stat-label">处理中</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ todayStats.avgTime }}</div>
          <div class="stat-label">平均用时(分钟)</div>
        </div>
      </div>
    </div>

    <!-- 公告通知 -->
    <div class="announcements" v-if="announcements.length > 0">
      <h2>公告通知</h2>
      <div class="announcement-list">
        <div 
          v-for="announcement in announcements" 
          :key="announcement.id"
          class="announcement-item"
          :class="announcement.type"
        >
          <div class="announcement-icon">
            {{ getAnnouncementIcon(announcement.type) }}
          </div>
          <div class="announcement-content">
            <h4>{{ announcement.title }}</h4>
            <p>{{ announcement.content }}</p>
            <span class="announcement-time">{{ formatTime(announcement.time) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速联系 -->
    <div class="quick-contact">
      <h2>快速联系</h2>
      <div class="contact-grid">
        <div class="contact-item">
          <div class="contact-icon">📞</div>
          <div class="contact-info">
            <h4>服务热线</h4>
            <p>400-123-4567</p>
          </div>
        </div>
        <div class="contact-item">
          <div class="contact-icon">💬</div>
          <div class="contact-info">
            <h4>在线客服</h4>
            <p>工作日 9:00-18:00</p>
          </div>
        </div>
        <div class="contact-item">
          <div class="contact-icon">📧</div>
          <div class="contact-info">
            <h4>邮箱支持</h4>
            <p>service@company.com</p>
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
import { formatTime, getRelativeTime } from '@/utils/common'

const router = useRouter()
const appStore = useAppStore()
const serviceStore = useServiceStore()

// 响应式数据
const announcements = ref([
  {
    id: 1,
    type: 'info',
    title: '系统升级通知',
    content: '系统将于今晚22:00-24:00进行升级维护，期间可能影响服务申请。',
    time: new Date().toISOString()
  },
  {
    id: 2,
    type: 'warning',
    title: '服务调整',
    content: 'A座3楼会议室暂停服务，预计明日恢复。',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
])

// 计算属性
const currentServices = computed(() => {
  return serviceStore.services
    .filter(service => ['pending', 'processing'].includes(service.status))
    .slice(0, 5) // 只显示前5个
})

const todayStats = computed(() => {
  const today = new Date().toDateString()
  const todayServices = serviceStore.services.filter(service => 
    new Date(service.requestTime).toDateString() === today
  )
  
  const completed = todayServices.filter(s => s.status === 'completed')
  const processing = todayServices.filter(s => s.status === 'processing')
  
  const avgTime = completed.length > 0 
    ? Math.round(completed.reduce((sum, s) => {
        const start = new Date(s.startTime || s.requestTime)
        const end = new Date(s.completedTime)
        return sum + (end - start) / (1000 * 60)
      }, 0) / completed.length)
    : 0
  
  return {
    total: todayServices.length,
    completed: completed.length,
    processing: processing.length,
    avgTime
  }
})

// 方法
const goToServiceRequest = () => {
  router.push('/service-request')
}

const goToServiceStatus = () => {
  router.push('/service-status')
}

const goToSchedule = () => {
  router.push('/schedule')
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const getProgress = (service) => {
  if (service.status !== 'processing' || !service.startTime || !service.estimatedTime) {
    return 0
  }
  
  const startTime = new Date(service.startTime)
  const now = new Date()
  const elapsed = (now - startTime) / (1000 * 60) // 分钟
  
  return Math.min(Math.round((elapsed / service.estimatedTime) * 100), 100)
}

const getRemainingTime = (service) => {
  if (service.status !== 'processing' || !service.startTime || !service.estimatedTime) {
    return 0
  }
  
  const startTime = new Date(service.startTime)
  const now = new Date()
  const elapsed = (now - startTime) / (1000 * 60) // 分钟
  const remaining = Math.max(service.estimatedTime - elapsed, 0)
  
  return Math.round(remaining)
}

const cancelService = async (serviceId) => {
  if (confirm('确定要取消这个服务申请吗？')) {
    try {
      await serviceStore.updateServiceStatus(serviceId, 'cancelled')
    } catch (error) {
      console.error('取消服务失败:', error)
      alert('取消服务失败，请稍后重试')
    }
  }
}

const viewServiceDetail = (serviceId) => {
  router.push(`/service-detail/${serviceId}`)
}

const getAnnouncementIcon = (type) => {
  const iconMap = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅'
  }
  return iconMap[type] || 'ℹ️'
}

// 生命周期
onMounted(async () => {
  try {
    appStore.setLoading(true)
    await serviceStore.loadServices()
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    appStore.setLoading(false)
  }
})
</script>

<style scoped>
.home-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
  border: 2px solid transparent;
  position: relative;
}

.action-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-card.primary {
  background: linear-gradient(135deg, var(--primary-color), #667eea);
  color: white;
  border-color: var(--primary-color);
}

.action-card.primary .action-title {
  color: white;
  font-weight: 600;
}

.action-card.primary .action-desc {
  color: rgba(255, 255, 255, 0.9);
}

.action-card.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.action-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--warning-color);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.action-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.action-card h3 {
  color: var(--text-primary);
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.action-card p {
  color: var(--text-secondary);
  margin: 0;
}

.current-status {
  margin-bottom: 40px;
}

.current-status h2 {
  color: var(--text-primary);
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.service-item {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid var(--border-color);
}

.service-item.status-pending {
  border-left-color: var(--warning-color);
}

.service-item.status-processing {
  border-left-color: var(--primary-color);
}

.service-item.status-completed {
  border-left-color: var(--success-color);
}

.service-info {
  flex: 1;
}

.service-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 8px;
}

.room-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.service-type {
  color: var(--text-secondary);
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.status-pending {
  background: var(--warning-light);
  color: var(--warning-color);
}

.status-badge.status-processing {
  background: var(--primary-light);
  color: var(--primary-color);
}

.status-badge.status-completed {
  background: var(--success-light);
  color: var(--success-color);
}

.service-details {
  display: flex;
  gap: 20px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.service-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.service-actions {
  display: flex;
  gap: 10px;
}

.daily-stats {
  margin-bottom: 40px;
}

.daily-stats h2 {
  color: var(--text-primary);
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  background: white;
  border-radius: 8px;
  padding: 25px 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 5px;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.announcements {
  margin-bottom: 40px;
}

.announcements h2 {
  color: var(--text-primary);
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.announcement-item {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 15px;
  border-left: 4px solid var(--border-color);
}

.announcement-item.info {
  border-left-color: var(--primary-color);
}

.announcement-item.warning {
  border-left-color: var(--warning-color);
}

.announcement-item.error {
  border-left-color: var(--error-color);
}

.announcement-item.success {
  border-left-color: var(--success-color);
}

.announcement-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.announcement-content h4 {
  color: var(--text-primary);
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.announcement-content p {
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.5;
}

.announcement-time {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.quick-contact h2 {
  color: var(--text-primary);
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.contact-item {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.contact-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.contact-info h4 {
  color: var(--text-primary);
  margin-bottom: 5px;
  font-size: 1.1rem;
}

.contact-info p {
  color: var(--text-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .home-page {
    padding: 15px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
  
  .service-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .service-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
</style>