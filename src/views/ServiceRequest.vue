<template>
  <div class="service-request-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">申请服务</h1>
      <p class="page-subtitle">请填写服务申请信息，我们将尽快为您安排</p>
    </div>

    <!-- 服务申请表单 -->
    <div class="request-form-container">
      <form @submit.prevent="submitRequest" class="request-form">
        <!-- 会议室选择 -->
        <div class="form-section">
          <h3 class="section-title">会议室信息</h3>
          
          <div class="form-group">
            <label class="form-label required">选择楼栋</label>
            <div class="radio-group">
              <label class="radio-item">
                <input 
                  type="radio" 
                  v-model="form.building" 
                  value="A"
                  @change="onBuildingChange"
                >
                <span class="radio-text">A座</span>
              </label>
              <label class="radio-item">
                <input 
                  type="radio" 
                  v-model="form.building" 
                  value="B"
                  @change="onBuildingChange"
                >
                <span class="radio-text">B座</span>
              </label>
            </div>
          </div>

          <div class="form-group" v-if="form.building">
            <label class="form-label required">选择楼层</label>
            <select v-model="form.floor" @change="onFloorChange" class="form-select">
              <option value="">请选择楼层</option>
              <option 
                v-for="floor in availableFloors" 
                :key="floor" 
                :value="floor"
              >
                {{ floor }}楼
              </option>
            </select>
          </div>

          <div class="form-group" v-if="form.floor">
            <label class="form-label required">选择会议室</label>
            <div class="room-grid">
              <div 
                v-for="room in availableRooms" 
                :key="room.id"
                class="room-card"
                :class="{ active: form.meetingRoom === room.id }"
                @click="selectRoom(room.id)"
              >
                <div class="room-name">{{ room.name }}</div>
                <div class="room-info">{{ room.building }}座 {{ room.floor }}楼</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 服务类型选择 -->
        <div class="form-section">
          <h3 class="section-title">服务类型</h3>
          
          <div class="form-group">
            <label class="form-label required">选择服务类型</label>
            <div class="service-type-grid">
              <div 
                v-for="serviceType in serviceTypes" 
                :key="serviceType.id"
                class="service-type-card"
                :class="{ active: form.serviceType === serviceType.name }"
                @click="selectServiceType(serviceType.name)"
              >
                <div class="service-icon">{{ serviceType.icon }}</div>
                <div class="service-name">{{ serviceType.name }}</div>
                <div class="service-desc">{{ serviceType.description }}</div>
                <div class="service-time">预计 {{ serviceType.estimatedTime }} 分钟</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 服务详情 -->
        <div class="form-section">
          <h3 class="section-title">服务详情</h3>
          
          <div class="form-group">
            <label class="form-label required">申请人姓名</label>
            <input 
              type="text" 
              v-model="form.requester" 
              class="form-input"
              placeholder="请输入您的姓名"
              required
            >
          </div>

          <div class="form-group">
            <label class="form-label">联系电话</label>
            <input 
              type="tel" 
              v-model="form.phone" 
              class="form-input"
              placeholder="请输入联系电话"
            >
          </div>

          <div class="form-group">
            <label class="form-label">优先级</label>
            <select v-model="form.priority" class="form-select">
              <option value="normal">普通</option>
              <option value="high">紧急</option>
              <option value="low">不急</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">详细描述</label>
            <textarea 
              v-model="form.description" 
              class="form-textarea"
              placeholder="请详细描述您的服务需求，以便我们更好地为您服务"
              rows="4"
            ></textarea>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <button type="button" class="btn btn-outline" @click="resetForm">
            重置表单
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="!isFormValid || isSubmitting"
          >
            <span v-if="isSubmitting">提交中...</span>
            <span v-else>提交申请</span>
          </button>
        </div>
      </form>
    </div>

    <!-- 服务说明 -->
    <div class="service-info">
      <h3>服务说明</h3>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-icon">⏰</div>
          <div class="info-content">
            <h4>响应时间</h4>
            <p>普通服务：30分钟内响应<br>紧急服务：10分钟内响应</p>
          </div>
        </div>
        <div class="info-item">
          <div class="info-icon">👥</div>
          <div class="info-content">
            <h4>服务团队</h4>
            <p>专业服务员团队<br>7×24小时值班</p>
          </div>
        </div>
        <div class="info-item">
          <div class="info-icon">📱</div>
          <div class="info-content">
            <h4>状态通知</h4>
            <p>实时推送服务进度<br>微信群通知</p>
          </div>
        </div>
        <div class="info-item">
          <div class="info-icon">⭐</div>
          <div class="info-content">
            <h4>服务保障</h4>
            <p>专业标准化服务<br>满意度跟踪</p>
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
import { getMeetingRooms, getMeetingRoomsByBuilding, getMeetingRoomsByFloor, generateId } from '@/utils/common'

const router = useRouter()
const appStore = useAppStore()
const serviceStore = useServiceStore()

// 表单数据
const form = ref({
  building: '',
  floor: '',
  meetingRoom: '',
  serviceType: '',
  requester: '',
  phone: '',
  priority: 'normal',
  description: ''
})

// 状态
const isSubmitting = ref(false)

// 服务类型数据
const serviceTypes = ref([
  {
    id: 1,
    name: '设备维修',
    icon: '🔧',
    description: '投影仪、音响等设备故障维修',
    estimatedTime: 30
  },
  {
    id: 2,
    name: '环境清洁',
    icon: '🧹',
    description: '会议室清洁、垃圾清理',
    estimatedTime: 20
  },
  {
    id: 3,
    name: '设备调试',
    icon: '⚙️',
    description: '设备参数调整、功能测试',
    estimatedTime: 15
  },
  {
    id: 4,
    name: '物品补充',
    icon: '📦',
    description: '纸张、笔、水等物品补充',
    estimatedTime: 10
  },
  {
    id: 5,
    name: '技术支持',
    icon: '💻',
    description: '软件安装、网络配置等',
    estimatedTime: 25
  },
  {
    id: 6,
    name: '其他服务',
    icon: '🛎️',
    description: '其他特殊服务需求',
    estimatedTime: 20
  }
])

// 计算属性
const availableFloors = computed(() => {
  if (!form.value.building) return []
  
  const rooms = getMeetingRoomsByBuilding(form.value.building)
  const floors = [...new Set(rooms.map(room => room.floor))]
  return floors.sort((a, b) => a - b)
})

const availableRooms = computed(() => {
  if (!form.value.building || !form.value.floor) return []
  
  return getMeetingRoomsByFloor(form.value.building, parseInt(form.value.floor))
})

const isFormValid = computed(() => {
  return form.value.meetingRoom && 
         form.value.serviceType && 
         form.value.requester.trim()
})

// 方法
const onBuildingChange = () => {
  form.value.floor = ''
  form.value.meetingRoom = ''
}

const onFloorChange = () => {
  form.value.meetingRoom = ''
}

const selectRoom = (roomId) => {
  form.value.meetingRoom = roomId
}

const selectServiceType = (typeName) => {
  form.value.serviceType = typeName
}

const resetForm = () => {
  form.value = {
    building: '',
    floor: '',
    meetingRoom: '',
    serviceType: '',
    requester: '',
    phone: '',
    priority: 'normal',
    description: ''
  }
}

const submitRequest = async () => {
  if (!isFormValid.value || isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    
    // 获取选中的服务类型信息
    const selectedServiceType = serviceTypes.value.find(type => type.name === form.value.serviceType)
    
    // 构建服务请求数据
    const serviceRequest = {
      id: generateId(),
      meetingRoom: form.value.meetingRoom,
      serviceType: form.value.serviceType,
      requester: form.value.requester,
      phone: form.value.phone,
      priority: form.value.priority,
      description: form.value.description,
      status: 'pending',
      requestTime: new Date().toISOString(),
      estimatedTime: selectedServiceType?.estimatedTime || 20,
      assignedStaff: [],
      startTime: null,
      completedTime: null
    }
    
    // 提交服务请求
    await serviceStore.createServiceRequest(serviceRequest)
    
    // 显示成功消息
    alert('服务申请提交成功！我们将尽快为您安排服务。')
    
    // 跳转到服务状态页面
    router.push('/service-status')
    
  } catch (error) {
    console.error('提交服务申请失败:', error)
    alert('提交失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

// 生命周期
onMounted(() => {
  // 如果有当前选中的会议室，自动填充
  if (appStore.currentMeetingRoom) {
    const room = getMeetingRooms().find(r => r.id === appStore.currentMeetingRoom)
    if (room) {
      form.value.building = room.building
      form.value.floor = room.floor.toString()
      form.value.meetingRoom = room.id
    }
  }
})
</script>

<style scoped>
.service-request-page {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
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

.request-form-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.request-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--border-color);
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: 1.3rem;
  color: var(--text-primary);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: var(--primary-color);
  border-radius: 2px;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.form-label.required::after {
  content: ' *';
  color: var(--error-color);
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 10px 15px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.radio-item:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.radio-item input[type="radio"] {
  margin: 0;
}

.radio-item input[type="radio"]:checked + .radio-text {
  color: var(--primary-color);
  font-weight: 600;
}

.radio-text {
  font-size: 0.95rem;
  color: var(--text-primary);
}

.form-select {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  transition: border-color 0.3s ease;
}

.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.room-card {
  padding: 15px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.room-card:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.room-card.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.room-name {
  font-weight: 600;
  margin-bottom: 5px;
}

.room-info {
  font-size: 0.85rem;
  opacity: 0.8;
}

.service-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.service-type-card {
  padding: 20px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.service-type-card:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.service-type-card.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.service-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.service-name {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.service-desc {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-bottom: 8px;
  line-height: 1.4;
}

.service-time {
  font-size: 0.8rem;
  opacity: 0.7;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid var(--border-color);
}

.service-info {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.service-info h3 {
  font-size: 1.3rem;
  color: var(--text-primary);
  margin-bottom: 25px;
  text-align: center;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  border-radius: 8px;
  background: var(--background-light);
}

.info-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.info-content h4 {
  color: var(--text-primary);
  margin-bottom: 8px;
  font-size: 1rem;
}

.info-content p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .service-request-page {
    padding: 15px;
  }
  
  .request-form-container {
    padding: 20px;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .radio-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .room-grid {
    grid-template-columns: 1fr;
  }
  
  .service-type-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>