<template>
  <div class="admin-services">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">服务管理</h1>
      <p class="page-subtitle">管理所有会议室服务请求</p>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label">状态筛选</label>
          <select v-model="statusFilter" class="filter-select">
            <option value="">全部状态</option>
            <option value="pending">待处理</option>
            <option value="processing">处理中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">服务类型</label>
          <select v-model="typeFilter" class="filter-select">
            <option value="">全部类型</option>
            <option value="cleaning">清洁服务</option>
            <option value="maintenance">设备维修</option>
            <option value="setup">会议布置</option>
            <option value="catering">茶水服务</option>
            <option value="technical">技术支持</option>
            <option value="other">其他服务</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">优先级</label>
          <select v-model="priorityFilter" class="filter-select">
            <option value="">全部优先级</option>
            <option value="low">低</option>
            <option value="normal">中</option>
            <option value="high">高</option>
            <option value="urgent">紧急</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">楼栋</label>
          <select v-model="buildingFilter" class="filter-select">
            <option value="">全部楼栋</option>
            <option value="A">A座</option>
            <option value="B">B座</option>
          </select>
        </div>
      </div>
      
      <div class="search-row">
        <div class="search-group">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索服务ID、申请人、会议室..." 
            class="search-input"
          >
          <button class="btn btn-primary" @click="searchServices">
            🔍 搜索
          </button>
        </div>
        
        <div class="action-buttons">
          <button class="btn btn-outline" @click="exportServices">
            📊 导出
          </button>
          <button class="btn btn-outline" @click="refreshServices">
            🔄 刷新
          </button>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stats-row">
        <div class="stat-item">
          <div class="stat-number">{{ filteredServices.length }}</div>
          <div class="stat-label">筛选结果</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ pendingCount }}</div>
          <div class="stat-label">待处理</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ processingCount }}</div>
          <div class="stat-label">处理中</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ completedCount }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
    </div>

    <!-- 服务列表 -->
    <div class="services-section">
      <div class="services-header">
        <h3>服务列表</h3>
        <div class="view-controls">
          <button 
            class="btn btn-sm"
            :class="{ 'btn-primary': viewMode === 'card', 'btn-outline': viewMode !== 'card' }"
            @click="viewMode = 'card'"
          >
            卡片视图
          </button>
          <button 
            class="btn btn-sm"
            :class="{ 'btn-primary': viewMode === 'table', 'btn-outline': viewMode !== 'table' }"
            @click="viewMode = 'table'"
          >
            表格视图
          </button>
        </div>
      </div>

      <!-- 卡片视图 -->
      <div class="services-grid" v-if="viewMode === 'card' && filteredServices.length > 0">
        <div 
          v-for="service in paginatedServices" 
          :key="service.id"
          class="service-card"
          :class="`status-${service.status}`"
          @click="viewServiceDetail(service.id)"
        >
          <div class="service-header">
            <div class="service-id">#{{ service.id }}</div>
            <div class="service-status">
              <span class="status-badge" :class="service.status">
                {{ getStatusText(service.status) }}
              </span>
            </div>
          </div>
          
          <div class="service-info">
            <div class="service-type">
              <span class="type-icon">{{ getServiceTypeIcon(service.type) }}</span>
              <span class="type-text">{{ getServiceTypeName(service.type) }}</span>
            </div>
            
            <div class="service-priority">
              <span class="priority-badge" :class="service.priority">
                {{ getPriorityText(service.priority) }}
              </span>
            </div>
          </div>
          
          <div class="service-details">
            <div class="detail-item">
              <span class="detail-icon">🏢</span>
              <span class="detail-text">{{ getMeetingRoomName(service.meetingRoom) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">👤</span>
              <span class="detail-text">{{ service.requester }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">📞</span>
              <span class="detail-text">{{ service.phone }}</span>
            </div>
          </div>
          
          <div class="service-description">
            {{ service.description || '无详细描述' }}
          </div>
          
          <div class="service-time">
            <div class="time-item">
              <span class="time-label">创建时间:</span>
              <span class="time-value">{{ formatTime(service.createdAt) }}</span>
            </div>
            <div class="time-item" v-if="service.updatedAt !== service.createdAt">
              <span class="time-label">更新时间:</span>
              <span class="time-value">{{ formatTime(service.updatedAt) }}</span>
            </div>
          </div>
          
          <div class="service-actions">
            <button 
              v-if="service.status === 'pending'"
              class="btn btn-primary btn-sm"
              @click.stop="acceptService(service.id)"
            >
              接受
            </button>
            <button 
              v-if="service.status === 'processing'"
              class="btn btn-success btn-sm"
              @click.stop="completeService(service.id)"
            >
              完成
            </button>
            <button 
              class="btn btn-outline btn-sm"
              @click.stop="editService(service.id)"
            >
              编辑
            </button>
            <button 
              v-if="service.status !== 'cancelled'"
              class="btn btn-error btn-sm"
              @click.stop="cancelService(service.id)"
            >
              取消
            </button>
          </div>
        </div>
      </div>

      <!-- 表格视图 -->
      <div class="services-table" v-if="viewMode === 'table' && filteredServices.length > 0">
        <table class="table">
          <thead>
            <tr>
              <th @click="sortBy('id')" class="sortable">
                ID
                <span class="sort-icon" v-if="sortField === 'id'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortBy('type')" class="sortable">
                类型
                <span class="sort-icon" v-if="sortField === 'type'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>会议室</th>
              <th>申请人</th>
              <th @click="sortBy('priority')" class="sortable">
                优先级
                <span class="sort-icon" v-if="sortField === 'priority'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortBy('status')" class="sortable">
                状态
                <span class="sort-icon" v-if="sortField === 'status'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortBy('createdAt')" class="sortable">
                创建时间
                <span class="sort-icon" v-if="sortField === 'createdAt'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="service in paginatedServices" 
              :key="service.id"
              class="table-row"
              @click="viewServiceDetail(service.id)"
            >
              <td class="service-id">#{{ service.id }}</td>
              <td>
                <span class="type-badge">
                  {{ getServiceTypeName(service.type) }}
                </span>
              </td>
              <td>{{ getMeetingRoomName(service.meetingRoom) }}</td>
              <td>{{ service.requester }}</td>
              <td>
                <span class="priority-badge" :class="service.priority">
                  {{ getPriorityText(service.priority) }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="service.status">
                  {{ getStatusText(service.status) }}
                </span>
              </td>
              <td>{{ formatTime(service.createdAt) }}</td>
              <td class="actions-cell">
                <div class="table-actions">
                  <button 
                    v-if="service.status === 'pending'"
                    class="btn btn-primary btn-xs"
                    @click.stop="acceptService(service.id)"
                  >
                    接受
                  </button>
                  <button 
                    v-if="service.status === 'processing'"
                    class="btn btn-success btn-xs"
                    @click.stop="completeService(service.id)"
                  >
                    完成
                  </button>
                  <button 
                    class="btn btn-outline btn-xs"
                    @click.stop="editService(service.id)"
                  >
                    编辑
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-if="filteredServices.length === 0">
        <div class="empty-icon">📋</div>
        <h3>暂无服务请求</h3>
        <p>当前筛选条件下没有找到服务请求</p>
        <button class="btn btn-primary" @click="clearFilters">
          清除筛选
        </button>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-section" v-if="filteredServices.length > pageSize">
      <div class="pagination-info">
        显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredServices.length) }} 条，
        共 {{ filteredServices.length }} 条记录
      </div>
      <div class="pagination-controls">
        <button 
          class="btn btn-outline btn-sm"
          :disabled="currentPage === 1"
          @click="currentPage = 1"
        >
          首页
        </button>
        <button 
          class="btn btn-outline btn-sm"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <span class="page-numbers">
          <button 
            v-for="page in visiblePages" 
            :key="page"
            class="btn btn-sm"
            :class="{ 'btn-primary': page === currentPage, 'btn-outline': page !== currentPage }"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
        </span>
        <button 
          class="btn btn-outline btn-sm"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
        <button 
          class="btn btn-outline btn-sm"
          :disabled="currentPage === totalPages"
          @click="currentPage = totalPages"
        >
          末页
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
import { getMeetingRoomName, formatTime, getMeetingRoomsByBuilding } from '@/utils/common'

const router = useRouter()
const appStore = useAppStore()
const serviceStore = useServiceStore()

// 响应式数据
const statusFilter = ref('')
const typeFilter = ref('')
const priorityFilter = ref('')
const buildingFilter = ref('')
const searchQuery = ref('')
const viewMode = ref('card') // 'card' | 'table'
const sortField = ref('createdAt')
const sortOrder = ref('desc')
const currentPage = ref(1)
const pageSize = ref(12)

// 计算属性
const filteredServices = computed(() => {
  let services = [...serviceStore.services]
  
  // 状态筛选
  if (statusFilter.value) {
    services = services.filter(service => service.status === statusFilter.value)
  }
  
  // 类型筛选
  if (typeFilter.value) {
    services = services.filter(service => service.type === typeFilter.value)
  }
  
  // 优先级筛选
  if (priorityFilter.value) {
    services = services.filter(service => service.priority === priorityFilter.value)
  }
  
  // 楼栋筛选
  if (buildingFilter.value) {
    const buildingRooms = getMeetingRoomsByBuilding(buildingFilter.value)
    const roomIds = buildingRooms.map(room => room.id)
    services = services.filter(service => roomIds.includes(service.meetingRoom))
  }
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    services = services.filter(service => 
      service.id.toString().includes(query) ||
      service.requester.toLowerCase().includes(query) ||
      getMeetingRoomName(service.meetingRoom).toLowerCase().includes(query) ||
      service.phone.includes(query) ||
      (service.description && service.description.toLowerCase().includes(query))
    )
  }
  
  // 排序
  services.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]
    
    if (sortField.value === 'createdAt' || sortField.value === 'updatedAt') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }
    
    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
  
  return services
})

const paginatedServices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredServices.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredServices.value.length / pageSize.value)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    }
  }
  
  return pages.filter(page => page !== '...')
})

const pendingCount = computed(() => {
  return filteredServices.value.filter(s => s.status === 'pending').length
})

const processingCount = computed(() => {
  return filteredServices.value.filter(s => s.status === 'processing').length
})

const completedCount = computed(() => {
  return filteredServices.value.filter(s => s.status === 'completed').length
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

const getServiceTypeIcon = (type) => {
  const icons = {
    'cleaning': '🧹',
    'maintenance': '🔧',
    'setup': '📋',
    'catering': '☕',
    'technical': '💻',
    'other': '📝'
  }
  return icons[type] || '📝'
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

const getStatusText = (status) => {
  const statuses = {
    'pending': '待处理',
    'processing': '处理中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statuses[status] || status
}

const sortBy = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'desc'
  }
}

const searchServices = () => {
  currentPage.value = 1
}

const clearFilters = () => {
  statusFilter.value = ''
  typeFilter.value = ''
  priorityFilter.value = ''
  buildingFilter.value = ''
  searchQuery.value = ''
  currentPage.value = 1
}

const refreshServices = async () => {
  try {
    appStore.setLoading(true)
    await serviceStore.loadServices()
  } catch (error) {
    console.error('刷新服务列表失败:', error)
  } finally {
    appStore.setLoading(false)
  }
}

const exportServices = () => {
  // TODO: 实现导出功能
  console.log('导出服务数据')
}

const acceptService = async (serviceId) => {
  try {
    appStore.setLoading(true)
    await serviceStore.updateServiceStatus(serviceId, 'processing')
  } catch (error) {
    console.error('接受服务失败:', error)
  } finally {
    appStore.setLoading(false)
  }
}

const completeService = async (serviceId) => {
  try {
    appStore.setLoading(true)
    await serviceStore.updateServiceStatus(serviceId, 'completed')
  } catch (error) {
    console.error('完成服务失败:', error)
  } finally {
    appStore.setLoading(false)
  }
}

const cancelService = async (serviceId) => {
  if (confirm('确定要取消这个服务请求吗？')) {
    try {
      appStore.setLoading(true)
      await serviceStore.updateServiceStatus(serviceId, 'cancelled')
    } catch (error) {
      console.error('取消服务失败:', error)
    } finally {
      appStore.setLoading(false)
    }
  }
}

const editService = (serviceId) => {
  router.push(`/admin/services/${serviceId}/edit`)
}

const viewServiceDetail = (serviceId) => {
  router.push(`/admin/services/${serviceId}`)
}

// 监听筛选条件变化，重置页码
watch([statusFilter, typeFilter, priorityFilter, buildingFilter], () => {
  currentPage.value = 1
})

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
.admin-services {
  padding: 20px;
  max-width: 1400px;
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

.filters-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.search-row {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-group {
  display: flex;
  gap: 10px;
  flex: 1;
  max-width: 400px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.stats-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: var(--background-light);
  border-radius: 6px;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 5px;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.services-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.services-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.services-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.3rem;
}

.view-controls {
  display: flex;
  gap: 5px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.service-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid var(--border-color);
}

.service-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.service-card.status-pending {
  border-left-color: var(--warning-color);
}

.service-card.status-processing {
  border-left-color: var(--info-color);
}

.service-card.status-completed {
  border-left-color: var(--success-color);
}

.service-card.status-cancelled {
  border-left-color: var(--error-color);
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.service-id {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 1.1rem;
}

.service-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.service-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-icon {
  font-size: 1.2rem;
}

.type-text {
  font-weight: 500;
  color: var(--text-primary);
}

.service-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.detail-icon {
  width: 16px;
  text-align: center;
}

.service-description {
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 1.4;
  margin-bottom: 15px;
  padding: 10px;
  background: var(--background-light);
  border-radius: 4px;
}

.service-time {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 15px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.time-item {
  display: flex;
  justify-content: space-between;
}

.time-label {
  font-weight: 500;
}

.service-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.pending {
  background: var(--warning-light);
  color: var(--warning-color);
}

.status-badge.processing {
  background: var(--info-light);
  color: var(--info-color);
}

.status-badge.completed {
  background: var(--success-light);
  color: var(--success-color);
}

.status-badge.cancelled {
  background: var(--error-light);
  color: var(--error-color);
}

.priority-badge {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.7rem;
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

.services-table {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.table th,
.table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.table th {
  background: var(--background-light);
  font-weight: 600;
  color: var(--text-primary);
}

.table th.sortable {
  cursor: pointer;
  user-select: none;
}

.table th.sortable:hover {
  background: var(--primary-light);
}

.sort-icon {
  margin-left: 5px;
  color: var(--primary-color);
}

.table-row {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.table-row:hover {
  background: var(--primary-light);
}

.type-badge {
  background: var(--info-light);
  color: var(--info-color);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.8rem;
}

.actions-cell {
  width: 120px;
}

.table-actions {
  display: flex;
  gap: 5px;
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

.pagination-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.pagination-info {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

@media (max-width: 768px) {
  .admin-services {
    padding: 15px;
  }
  
  .filters-row {
    grid-template-columns: 1fr;
  }
  
  .search-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-group {
    max-width: none;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .services-grid {
    grid-template-columns: 1fr;
  }
  
  .services-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .view-controls {
    justify-content: center;
  }
  
  .service-actions {
    justify-content: center;
  }
  
  .pagination-section {
    flex-direction: column;
    text-align: center;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .service-details {
    font-size: 0.8rem;
  }
  
  .service-actions {
    flex-direction: column;
  }
  
  .table {
    font-size: 0.8rem;
  }
  
  .table th,
  .table td {
    padding: 8px;
  }
}
</style>