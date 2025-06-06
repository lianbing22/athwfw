<template>
  <div class="service-status-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">服务状态</h1>
      <p class="page-subtitle">查看和管理您的服务申请</p>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <div class="filter-controls">
        <div class="filter-group">
          <label class="filter-label">状态筛选</label>
          <select v-model="filters.status" class="filter-select">
            <option value="">全部状态</option>
            <option value="pending">待处理</option>
            <option value="processing">处理中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">楼栋筛选</label>
          <select v-model="filters.building" class="filter-select">
            <option value="">全部楼栋</option>
            <option value="A">A座</option>
            <option value="B">B座</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">服务类型</label>
          <select v-model="filters.serviceType" class="filter-select">
            <option value="">全部类型</option>
            <option value="设备维修">设备维修</option>
            <option value="环境清洁">环境清洁</option>
            <option value="设备调试">设备调试</option>
            <option value="物品补充">物品补充</option>
            <option value="技术支持">技术支持</option>
            <option value="其他服务">其他服务</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">搜索</label>
          <input 
            type="text" 
            v-model="filters.search" 
            class="filter-input"
            placeholder="搜索会议室、申请人..."
          >
        </div>
        
        <button class="btn btn-outline btn-sm" @click="resetFilters">
          重置筛选
        </button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon pending">⏳</div>
          <div class="stat-content">
            <div class="stat-number">{{ statusStats.pending }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon processing">🔄</div>
          <div class="stat-content">
            <div class="stat-number">{{ statusStats.processing }}</div>
            <div class="stat-label">处理中</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon completed">✅</div>
          <div class="stat-content">
            <div class="stat-number">{{ statusStats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon total">📊</div>
          <div class="stat-content">
            <div class="stat-number">{{ statusStats.total }}</div>
            <div class="stat-label">总计</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 服务列表 -->
    <div class="service-list-section">
      <div class="list-header">
        <h2>服务列表</h2>
        <div class="list-actions">
          <button class="btn btn-outline btn-sm" @click="refreshList">
            <span class="btn-icon">🔄</span>
            刷新
          </button>
          <button class="btn btn-primary btn-sm" @click="goToServiceRequest">
            <span class="btn-icon">➕</span>
            新建申请
          </button>
        </div>
      </div>

      <div class="service-list" v-if="filteredServices.length > 0">
        <div 
          v-for="service in paginatedServices" 
          :key="service.id"
          class="service-card"
          :class="`status-${service.status}`"
        >
          <div class="service-header">
            <div class="service-basic-info">
              <h3 class="service-title">
                {{ getMeetingRoomName(service.meetingRoom) }}
                <span class="service-type-tag">{{ service.serviceType }}</span>
              </h3>
              <div class="service-meta">
                <span class="service-id">ID: {{ service.id }}</span>
                <span class="service-time">{{ formatTime(service.requestTime) }}</span>
              </div>
            </div>
            <div class="service-status">
              <span class="status-badge" :class="`status-${service.status}`">
                {{ getStatusText(service.status) }}
              </span>
              <span class="priority-badge" :class="`priority-${service.priority}`">
                {{ getPriorityText(service.priority) }}
              </span>
            </div>
          </div>

          <div class="service-content">
            <div class="service-details">
              <div class="detail-item">
                <span class="detail-label">申请人:</span>
                <span class="detail-value">{{ service.requester }}</span>
              </div>
              <div class="detail-item" v-if="service.phone">
                <span class="detail-label">联系电话:</span>
                <span class="detail-value">{{ service.phone }}</span>
              </div>
              <div class="detail-item" v-if="service.description">
                <span class="detail-label">描述:</span>
                <span class="detail-value">{{ service.description }}</span>
              </div>
              <div class="detail-item" v-if="service.assignedStaff && service.assignedStaff.length > 0">
                <span class="detail-label">分配服务员:</span>
                <span class="detail-value">{{ service.assignedStaff.map(s => s.name).join(', ') }}</span>
              </div>
            </div>

            <!-- 进度条 -->
            <div class="service-progress" v-if="service.status === 'processing'">
              <div class="progress-info">
                <span class="progress-label">处理进度</span>
                <span class="progress-time">{{ getProgressTime(service) }}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: getProgress(service) + '%' }"></div>
              </div>
              <div class="progress-text">
                预计还需 {{ getRemainingTime(service) }} 分钟
              </div>
            </div>

            <!-- 时间线 -->
            <div class="service-timeline">
              <div class="timeline-item completed">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <div class="timeline-title">申请提交</div>
                  <div class="timeline-time">{{ formatTime(service.requestTime) }}</div>
                </div>
              </div>
              <div 
                class="timeline-item"
                :class="{ completed: service.startTime }"
                v-if="service.status !== 'cancelled'"
              >
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <div class="timeline-title">开始处理</div>
                  <div class="timeline-time">
                    {{ service.startTime ? formatTime(service.startTime) : '等待中...' }}
                  </div>
                </div>
              </div>
              <div 
                class="timeline-item"
                :class="{ completed: service.completedTime }"
                v-if="service.status !== 'cancelled'"
              >
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <div class="timeline-title">完成服务</div>
                  <div class="timeline-time">
                    {{ service.completedTime ? formatTime(service.completedTime) : '处理中...' }}
                  </div>
                </div>
              </div>
              <div 
                class="timeline-item completed"
                v-if="service.status === 'cancelled'"
              >
                <div class="timeline-dot cancelled"></div>
                <div class="timeline-content">
                  <div class="timeline-title">申请取消</div>
                  <div class="timeline-time">{{ formatTime(service.updatedTime || service.requestTime) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="service-actions">
            <button 
              v-if="service.status === 'pending'"
              class="btn btn-outline btn-sm"
              @click="cancelService(service.id)"
            >
              取消申请
            </button>
            <button 
              v-if="service.status === 'completed'"
              class="btn btn-outline btn-sm"
              @click="rateService(service.id)"
            >
              评价服务
            </button>
            <button 
              class="btn btn-primary btn-sm"
              @click="viewServiceDetail(service.id)"
            >
              查看详情
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-else>
        <div class="empty-icon">📋</div>
        <h3>暂无服务记录</h3>
        <p>您还没有提交过服务申请</p>
        <button class="btn btn-primary" @click="goToServiceRequest">
          立即申请服务
        </button>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          class="btn btn-outline btn-sm"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <span class="pagination-info">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页
        </span>
        <button 
          class="btn btn-outline btn-sm"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useServiceStore } from '@/stores/service'
import { getMeetingRoomById, formatTime, getRelativeTime } from '@/utils/common'

const router = useRouter()
const appStore = useAppStore()
const serviceStore = useServiceStore()

// 筛选条件
const filters = ref({
  status: '',
  building: '',
  serviceType: '',
  search: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 计算属性
const filteredServices = computed(() => {
  let services = [...serviceStore.services]
  
  // 状态筛选
  if (filters.value.status) {
    services = services.filter(service => service.status === filters.value.status)
  }
  
  // 楼栋筛选
  if (filters.value.building) {
    services = services.filter(service => {
      const room = getMeetingRoomById(service.meetingRoom)
      return room && room.building === filters.value.building
    })
  }
  
  // 服务类型筛选
  if (filters.value.serviceType) {
    services = services.filter(service => service.serviceType === filters.value.serviceType)
  }
  
  // 搜索筛选
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    services = services.filter(service => {
      const room = getMeetingRoomById(service.meetingRoom)
      const roomName = room ? room.name : service.meetingRoom
      return roomName.toLowerCase().includes(searchTerm) ||
             service.requester.toLowerCase().includes(searchTerm) ||
             service.serviceType.toLowerCase().includes(searchTerm) ||
             service.id.toLowerCase().includes(searchTerm)
    })
  }
  
  // 按请求时间倒序排列
  return services.sort((a, b) => new Date(b.requestTime) - new Date(a.requestTime))
})

const paginatedServices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredServices.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredServices.value.length / pageSize.value)
})

const statusStats = computed(() => {
  const stats = {
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    total: 0
  }
  
  filteredServices.value.forEach(service => {
    stats[service.status]++
    stats.total++
  })
  
  return stats
})

// 方法
const getMeetingRoomName = (roomId) => {
  const room = getMeetingRoomById(roomId)
  return room ? room.name : roomId
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

const getPriorityText = (priority) => {
  const priorityMap = {
    high: '紧急',
    normal: '普通',
    low: '不急'
  }
  return priorityMap[priority] || priority
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

const getProgressTime = (service) => {
  if (!service.startTime) return ''
  
  const startTime = new Date(service.startTime)
  const now = new Date()
  const elapsed = Math.round((now - startTime) / (1000 * 60))
  
  return `已用时 ${elapsed} 分钟`
}

const resetFilters = () => {
  filters.value = {
    status: '',
    building: '',
    serviceType: '',
    search: ''
  }
  currentPage.value = 1
}

const refreshList = async () => {
  try {
    appStore.setLoading(true)
    await serviceStore.loadServices()
  } catch (error) {
    console.error('刷新列表失败:', error)
    alert('刷新失败，请稍后重试')
  } finally {
    appStore.setLoading(false)
  }
}

const goToServiceRequest = () => {
  router.push('/service-request')
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

const rateService = (serviceId) => {
  // TODO: 实现服务评价功能
  alert('服务评价功能开发中...')
}

const viewServiceDetail = (serviceId) => {
  router.push(`/service-detail/${serviceId}`)
}

// 监听筛选条件变化，重置分页
watch(filters, () => {
  currentPage.value = 1
}, { deep: true })

// 生命周期
onMounted(async () => {
  try {
    appStore.setLoading(true)
    await serviceStore.loadServices()
  } catch (error) {
    console.error('加载服务列表失败:', error)
  } finally {
    appStore.setLoading(false)
  }
})
</script>

<style scoped>
.service-status-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2.2rem;
  color: var(--primary-color);
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.filter-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 150px;
}

.filter-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.filter-select,
.filter-input {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.stats-section {
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.pending {
  background: var(--warning-light);
}

.stat-icon.processing {
  background: var(--primary-light);
}

.stat-icon.completed {
  background: var(--success-light);
}

.stat-icon.total {
  background: var(--info-light);
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.service-list-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.list-header h2 {
  color: var(--text-primary);
  margin: 0;
  font-size: 1.3rem;
}

.list-actions {
  display: flex;
  gap: 10px;
}

.btn-icon {
  margin-right: 5px;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.service-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
  border-left: 4px solid var(--border-color);
}

.service-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.service-card.status-pending {
  border-left-color: var(--warning-color);
}

.service-card.status-processing {
  border-left-color: var(--primary-color);
}

.service-card.status-completed {
  border-left-color: var(--success-color);
}

.service-card.status-cancelled {
  border-left-color: var(--error-color);
  opacity: 0.7;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.service-title {
  color: var(--text-primary);
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.service-type-tag {
  background: var(--primary-light);
  color: var(--primary-color);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.service-meta {
  display: flex;
  gap: 15px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.service-status {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-end;
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

.status-badge.status-cancelled {
  background: var(--error-light);
  color: var(--error-color);
}

.priority-badge {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 500;
}

.priority-badge.priority-high {
  background: var(--error-light);
  color: var(--error-color);
}

.priority-badge.priority-normal {
  background: var(--info-light);
  color: var(--info-color);
}

.priority-badge.priority-low {
  background: var(--success-light);
  color: var(--success-color);
}

.service-content {
  margin-bottom: 15px;
}

.service-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  gap: 8px;
}

.detail-label {
  color: var(--text-secondary);
  font-weight: 500;
  min-width: 80px;
}

.detail-value {
  color: var(--text-primary);
  flex: 1;
}

.service-progress {
  background: var(--background-light);
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.progress-label {
  font-weight: 500;
  color: var(--text-primary);
}

.progress-time {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.progress-bar {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.service-timeline {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.timeline-item.completed {
  opacity: 1;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--border-color);
  flex-shrink: 0;
}

.timeline-item.completed .timeline-dot {
  background: var(--primary-color);
}

.timeline-dot.cancelled {
  background: var(--error-color);
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.timeline-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.timeline-time {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.service-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: 10px;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.pagination-info {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .service-status-page {
    padding: 15px;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .service-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .service-status {
    align-items: flex-start;
    flex-direction: row;
    gap: 10px;
  }
  
  .service-details {
    grid-template-columns: 1fr;
  }
  
  .service-timeline {
    flex-direction: column;
    gap: 10px;
  }
  
  .service-actions {
    justify-content: stretch;
    flex-direction: column;
  }
  
  .list-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .list-actions {
    justify-content: center;
  }
}
</style>