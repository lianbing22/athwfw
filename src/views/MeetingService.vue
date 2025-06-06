<template>
  <div class="meeting-service">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">小泰会务服务</h1>
      <p class="page-subtitle">会中扫码服务</p>
    </div>

    <!-- 会议室信息 -->
    <div class="room-info" v-if="currentRoom">
      <div class="room-card">
        <div class="room-icon">🏢</div>
        <div class="room-details">
          <div class="room-name">{{ currentRoom.name }}</div>
          <div class="room-location">{{ currentRoom.building }}座 {{ currentRoom.floor }}楼</div>
        </div>
        <div class="room-status">
          <span class="status-badge online">服务中</span>
        </div>
      </div>
    </div>

    <!-- 服务选项 -->
    <div class="service-options">
      <h3>请选择需要的服务</h3>
      
      <!-- 空调调温服务 -->
      <div class="service-card" @click="selectService('aircon')">
        <div class="service-icon">❄️</div>
        <div class="service-content">
          <div class="service-title">空调调温</div>
          <div class="service-desc">调节会议室温度，提供舒适环境</div>
        </div>
        <div class="service-arrow">›</div>
      </div>
      
      <!-- 茶水服务 -->
      <div class="service-card" @click="selectService('tea')">
        <div class="service-icon">☕</div>
        <div class="service-content">
          <div class="service-title">茶水服务</div>
          <div class="service-desc">茶水更换或添加，饮品补充</div>
        </div>
        <div class="service-arrow">›</div>
      </div>
      
      <!-- 设备维护 -->
      <div class="service-card" @click="selectService('equipment')">
        <div class="service-icon">🎤</div>
        <div class="service-content">
          <div class="service-title">设备维护</div>
          <div class="service-desc">话筒、投影等设备检修</div>
        </div>
        <div class="service-arrow">›</div>
      </div>
    </div>

    <!-- 服务详情弹窗 -->
    <div class="service-modal" v-if="showModal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ getServiceTitle(selectedService) }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        
        <div class="modal-body">
          <!-- 空调调温 -->
          <div v-if="selectedService === 'aircon'" class="service-form">
            <div class="form-group">
              <label>当前温度</label>
              <div class="temperature-display">{{ currentTemperature }}°C</div>
            </div>
            
            <div class="form-group">
              <label>目标温度</label>
              <div class="temperature-control">
                <button class="temp-btn" @click="adjustTemperature(-1)">-</button>
                <span class="temp-value">{{ targetTemperature }}°C</span>
                <button class="temp-btn" @click="adjustTemperature(1)">+</button>
              </div>
            </div>
            
            <div class="form-group">
              <label>风速设置</label>
              <div class="wind-speed">
                <button 
                  v-for="speed in windSpeeds" 
                  :key="speed.value"
                  class="speed-btn"
                  :class="{ active: windSpeed === speed.value }"
                  @click="windSpeed = speed.value"
                >
                  {{ speed.label }}
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <label>备注说明</label>
              <textarea 
                v-model="serviceNote" 
                placeholder="请描述具体需求..."
                class="note-input"
              ></textarea>
            </div>
          </div>
          
          <!-- 茶水服务 -->
          <div v-if="selectedService === 'tea'" class="service-form">
            <div class="form-group">
              <label>服务类型</label>
              <div class="tea-options">
                <button 
                  v-for="option in teaOptions" 
                  :key="option.value"
                  class="option-btn"
                  :class="{ active: teaType === option.value }"
                  @click="teaType = option.value"
                >
                  <span class="option-icon">{{ option.icon }}</span>
                  <span class="option-text">{{ option.label }}</span>
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <label>饮品种类</label>
              <div class="drink-options">
                <label v-for="drink in drinkOptions" :key="drink.value" class="drink-option">
                  <input 
                    type="checkbox" 
                    :value="drink.value" 
                    v-model="selectedDrinks"
                  >
                  <span class="drink-icon">{{ drink.icon }}</span>
                  <span class="drink-name">{{ drink.label }}</span>
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label>人数</label>
              <div class="people-count">
                <button class="count-btn" @click="adjustPeopleCount(-1)">-</button>
                <span class="count-value">{{ peopleCount }}人</span>
                <button class="count-btn" @click="adjustPeopleCount(1)">+</button>
              </div>
            </div>
            
            <div class="form-group">
              <label>备注说明</label>
              <textarea 
                v-model="serviceNote" 
                placeholder="请描述具体需求..."
                class="note-input"
              ></textarea>
            </div>
          </div>
          
          <!-- 设备维护 -->
          <div v-if="selectedService === 'equipment'" class="service-form">
            <div class="form-group">
              <label>设备类型</label>
              <div class="equipment-options">
                <label v-for="equipment in equipmentOptions" :key="equipment.value" class="equipment-option">
                  <input 
                    type="checkbox" 
                    :value="equipment.value" 
                    v-model="selectedEquipment"
                  >
                  <span class="equipment-icon">{{ equipment.icon }}</span>
                  <span class="equipment-name">{{ equipment.label }}</span>
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label>问题描述</label>
              <div class="problem-options">
                <button 
                  v-for="problem in problemOptions" 
                  :key="problem.value"
                  class="problem-btn"
                  :class="{ active: problemType === problem.value }"
                  @click="problemType = problem.value"
                >
                  {{ problem.label }}
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <label>紧急程度</label>
              <div class="urgency-options">
                <button 
                  v-for="urgency in urgencyOptions" 
                  :key="urgency.value"
                  class="urgency-btn"
                  :class="[urgency.value, { active: urgencyLevel === urgency.value }]"
                  @click="urgencyLevel = urgency.value"
                >
                  {{ urgency.label }}
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <label>详细说明</label>
              <textarea 
                v-model="serviceNote" 
                placeholder="请详细描述设备问题..."
                class="note-input"
              ></textarea>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="contact-info">
            <div class="contact-item">
              <span class="contact-icon">👤</span>
              <input 
                v-model="requesterName" 
                placeholder="您的姓名" 
                class="contact-input"
              >
            </div>
            <div class="contact-item">
              <span class="contact-icon">📞</span>
              <input 
                v-model="requesterPhone" 
                placeholder="联系电话" 
                class="contact-input"
              >
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="btn btn-outline" @click="closeModal">取消</button>
            <button class="btn btn-primary" @click="submitService" :disabled="!canSubmit">
              提交服务请求
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 提交成功提示 -->
    <div class="success-modal" v-if="showSuccess" @click="closeSuccess">
      <div class="success-content">
        <div class="success-icon">✅</div>
        <h3>服务请求已提交</h3>
        <p>我们将尽快为您安排服务人员</p>
        <div class="service-id">服务单号：#{{ serviceId }}</div>
        <button class="btn btn-primary" @click="closeSuccess">确定</button>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="footer-info">
      <div class="service-time">
        <span class="time-icon">⏰</span>
        <span>服务时间：8:00 - 22:00</span>
      </div>
      <div class="contact-service">
        <span class="phone-icon">📞</span>
        <span>紧急联系：400-123-4567</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useServiceStore } from '@/stores/service'
import { getMeetingRoomById } from '@/utils/common'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const serviceStore = useServiceStore()

// 响应式数据
const showModal = ref(false)
const showSuccess = ref(false)
const selectedService = ref('')
const serviceId = ref('')

// 会议室信息
const currentRoom = ref(null)

// 空调调温相关
const currentTemperature = ref(24)
const targetTemperature = ref(24)
const windSpeed = ref('auto')
const windSpeeds = [
  { value: 'low', label: '低速' },
  { value: 'medium', label: '中速' },
  { value: 'high', label: '高速' },
  { value: 'auto', label: '自动' }
]

// 茶水服务相关
const teaType = ref('refill')
const teaOptions = [
  { value: 'refill', label: '茶水更换', icon: '🔄' },
  { value: 'add', label: '茶水添加', icon: '➕' },
  { value: 'clean', label: '茶具清洁', icon: '🧽' }
]

const selectedDrinks = ref([])
const drinkOptions = [
  { value: 'tea', label: '茶水', icon: '🍵' },
  { value: 'coffee', label: '咖啡', icon: '☕' },
  { value: 'water', label: '矿泉水', icon: '💧' },
  { value: 'juice', label: '果汁', icon: '🧃' }
]

const peopleCount = ref(5)

// 设备维护相关
const selectedEquipment = ref([])
const equipmentOptions = [
  { value: 'microphone', label: '话筒', icon: '🎤' },
  { value: 'projector', label: '投影仪', icon: '📽️' },
  { value: 'screen', label: '投影幕布', icon: '🖥️' },
  { value: 'speaker', label: '音响', icon: '🔊' },
  { value: 'camera', label: '摄像头', icon: '📹' },
  { value: 'other', label: '其他设备', icon: '⚙️' }
]

const problemType = ref('')
const problemOptions = [
  { value: 'not_working', label: '无法使用' },
  { value: 'poor_quality', label: '效果不佳' },
  { value: 'connection_issue', label: '连接问题' },
  { value: 'maintenance', label: '定期维护' }
]

const urgencyLevel = ref('normal')
const urgencyOptions = [
  { value: 'low', label: '不紧急' },
  { value: 'normal', label: '一般' },
  { value: 'high', label: '紧急' },
  { value: 'urgent', label: '非常紧急' }
]

// 通用字段
const serviceNote = ref('')
const requesterName = ref('')
const requesterPhone = ref('')

// 计算属性
const canSubmit = computed(() => {
  return requesterName.value.trim() && requesterPhone.value.trim()
})

// 方法
const selectService = (serviceType) => {
  selectedService.value = serviceType
  showModal.value = true
  resetForm()
}

const closeModal = () => {
  showModal.value = false
  selectedService.value = ''
}

const closeSuccess = () => {
  showSuccess.value = false
  serviceId.value = ''
}

const resetForm = () => {
  // 重置所有表单数据
  targetTemperature.value = 24
  windSpeed.value = 'auto'
  teaType.value = 'refill'
  selectedDrinks.value = []
  peopleCount.value = 5
  selectedEquipment.value = []
  problemType.value = ''
  urgencyLevel.value = 'normal'
  serviceNote.value = ''
}

const getServiceTitle = (serviceType) => {
  const titles = {
    'aircon': '空调调温服务',
    'tea': '茶水服务',
    'equipment': '设备维护服务'
  }
  return titles[serviceType] || '服务请求'
}

const adjustTemperature = (delta) => {
  const newTemp = targetTemperature.value + delta
  if (newTemp >= 16 && newTemp <= 30) {
    targetTemperature.value = newTemp
  }
}

const adjustPeopleCount = (delta) => {
  const newCount = peopleCount.value + delta
  if (newCount >= 1 && newCount <= 50) {
    peopleCount.value = newCount
  }
}

const submitService = async () => {
  try {
    appStore.setLoading(true)
    
    // 构建服务请求数据
    const serviceData = {
      type: getServiceTypeValue(selectedService.value),
      meetingRoom: currentRoom.value?.id || 'B301',
      requester: requesterName.value,
      phone: requesterPhone.value,
      priority: getPriorityFromService(),
      description: buildServiceDescription(),
      details: buildServiceDetails()
    }
    
    // 提交服务请求
    const result = await serviceStore.createServiceRequest(serviceData)
    serviceId.value = result.id
    
    // 显示成功提示
    showModal.value = false
    showSuccess.value = true
    
  } catch (error) {
    console.error('提交服务请求失败:', error)
    alert('提交失败，请重试')
  } finally {
    appStore.setLoading(false)
  }
}

const getServiceTypeValue = (serviceType) => {
  const typeMap = {
    'aircon': 'maintenance',
    'tea': 'catering',
    'equipment': 'technical'
  }
  return typeMap[serviceType] || 'other'
}

const getPriorityFromService = () => {
  if (selectedService.value === 'equipment' && urgencyLevel.value === 'urgent') {
    return 'urgent'
  }
  if (selectedService.value === 'equipment' && urgencyLevel.value === 'high') {
    return 'high'
  }
  return 'normal'
}

const buildServiceDescription = () => {
  let description = getServiceTitle(selectedService.value)
  
  if (selectedService.value === 'aircon') {
    description += ` - 目标温度${targetTemperature.value}°C，风速${windSpeed.value}`
  } else if (selectedService.value === 'tea') {
    const typeText = teaOptions.find(t => t.value === teaType.value)?.label
    description += ` - ${typeText}，${peopleCount.value}人`
    if (selectedDrinks.value.length > 0) {
      const drinkNames = selectedDrinks.value.map(d => 
        drinkOptions.find(opt => opt.value === d)?.label
      ).join('、')
      description += `，需要：${drinkNames}`
    }
  } else if (selectedService.value === 'equipment') {
    if (selectedEquipment.value.length > 0) {
      const equipmentNames = selectedEquipment.value.map(e => 
        equipmentOptions.find(opt => opt.value === e)?.label
      ).join('、')
      description += ` - ${equipmentNames}`
    }
    if (problemType.value) {
      const problemText = problemOptions.find(p => p.value === problemType.value)?.label
      description += ` - ${problemText}`
    }
  }
  
  if (serviceNote.value) {
    description += ` - ${serviceNote.value}`
  }
  
  return description
}

const buildServiceDetails = () => {
  const details = {
    serviceType: selectedService.value
  }
  
  if (selectedService.value === 'aircon') {
    details.currentTemperature = currentTemperature.value
    details.targetTemperature = targetTemperature.value
    details.windSpeed = windSpeed.value
  } else if (selectedService.value === 'tea') {
    details.teaType = teaType.value
    details.selectedDrinks = selectedDrinks.value
    details.peopleCount = peopleCount.value
  } else if (selectedService.value === 'equipment') {
    details.selectedEquipment = selectedEquipment.value
    details.problemType = problemType.value
    details.urgencyLevel = urgencyLevel.value
  }
  
  details.note = serviceNote.value
  
  return details
}

// 生命周期
onMounted(() => {
  // 从URL参数获取会议室ID
  const roomId = route.query.room || 'B301'
  currentRoom.value = getMeetingRoomById(roomId)
  
  // 如果没有找到会议室，使用默认值
  if (!currentRoom.value) {
    currentRoom.value = {
      id: 'B301',
      name: 'B座301会议室',
      building: 'B',
      floor: '3'
    }
  }
})
</script>

<style scoped>
.meeting-service {
  padding: 15px;
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--background-light);
  width: 100%;
  overflow-x: hidden;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 8px;
  font-weight: 700;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.room-info {
  margin-bottom: 30px;
}

.room-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.room-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  background: var(--primary-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.room-details {
  flex: 1;
}

.room-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
}

.room-location {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.online {
  background: var(--success-light);
  color: var(--success-color);
}

.service-options h3 {
  margin-bottom: 20px;
  color: var(--text-primary);
  font-size: 1.2rem;
  text-align: center;
}

.service-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.service-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.service-card:active {
  transform: translateY(0);
}

.service-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  background: var(--primary-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-content {
  flex: 1;
}

.service-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
}

.service-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.service-arrow {
  font-size: 1.5rem;
  color: var(--text-secondary);
}

.service-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px 20px 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 0 20px;
}

.service-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.temperature-display {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
  text-align: center;
  padding: 10px;
  background: var(--primary-light);
  border-radius: 8px;
}

.temperature-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.temp-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--primary-color);
  background: white;
  color: var(--primary-color);
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.temp-btn:hover {
  background: var(--primary-color);
  color: white;
}

.temp-value {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 60px;
  text-align: center;
}

.wind-speed {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.speed-btn {
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: white;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.speed-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-light);
  color: var(--primary-color);
}

.tea-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-btn {
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: white;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-light);
  color: var(--primary-color);
}

.option-icon {
  font-size: 1.2rem;
}

.drink-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.drink-option {
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.drink-option:has(input:checked) {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.drink-option input {
  display: none;
}

.drink-icon {
  font-size: 1.1rem;
}

.drink-name {
  font-size: 0.9rem;
}

.people-count {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.count-btn {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: white;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.count-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.count-value {
  font-size: 1.1rem;
  font-weight: 500;
  min-width: 50px;
  text-align: center;
}

.equipment-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.equipment-option {
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.equipment-option:has(input:checked) {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.equipment-option input {
  display: none;
}

.equipment-icon {
  font-size: 1.1rem;
}

.equipment-name {
  font-size: 0.9rem;
}

.problem-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.problem-btn {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: white;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.problem-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-light);
  color: var(--primary-color);
}

.urgency-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.urgency-btn {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.urgency-btn.low {
  color: var(--success-color);
}

.urgency-btn.normal {
  color: var(--info-color);
}

.urgency-btn.high {
  color: var(--warning-color);
}

.urgency-btn.urgent {
  color: var(--error-color);
}

.urgency-btn.active.low {
  border-color: var(--success-color);
  background: var(--success-light);
}

.urgency-btn.active.normal {
  border-color: var(--info-color);
  background: var(--info-light);
}

.urgency-btn.active.high {
  border-color: var(--warning-color);
  background: var(--warning-light);
}

.urgency-btn.active.urgent {
  border-color: var(--error-color);
  background: var(--error-light);
}

.note-input {
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.note-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid var(--border-color);
  margin-top: 20px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.contact-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.contact-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.9rem;
}

.contact-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 20px;
}

.success-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.success-content h3 {
  color: var(--text-primary);
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.success-content p {
  color: var(--text-secondary);
  margin-bottom: 15px;
  line-height: 1.4;
}

.service-id {
  background: var(--primary-light);
  color: var(--primary-color);
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 500;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.footer-info {
  margin-top: 40px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.service-time,
.contact-service {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.service-time:last-child,
.contact-service:last-child {
  margin-bottom: 0;
}

.time-icon,
.phone-icon {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .meeting-service {
    padding: 10px;
  }
  
  .page-title {
    font-size: 1.6rem;
  }
  
  .page-subtitle {
    font-size: 0.9rem;
  }
  
  .service-card {
    padding: 15px;
    margin-bottom: 12px;
  }
  
  .service-icon {
    width: 50px;
    height: 50px;
    font-size: 2rem;
  }
  
  .service-title {
    font-size: 1.1rem;
  }
  
  .service-desc {
    font-size: 0.85rem;
  }
  
  .modal-content {
    margin: 10px;
    max-height: 85vh;
    border-radius: 8px;
  }
  
  .modal-header {
    padding: 15px 15px 0 15px;
  }
  
  .modal-body {
    padding: 0 15px;
  }
  
  .modal-footer {
    padding: 15px;
  }
  
  .wind-speed {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  
  .drink-options,
  .equipment-options {
    grid-template-columns: 1fr;
  }
  
  .problem-options,
  .urgency-options {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .contact-info {
    gap: 8px;
  }
  
  .contact-input {
    padding: 8px 10px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .meeting-service {
    padding: 8px;
  }
  
  .page-header {
    margin-bottom: 20px;
  }
  
  .page-title {
    font-size: 1.4rem;
  }
  
  .room-card {
    padding: 12px;
  }
  
  .room-icon {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
  
  .room-name {
    font-size: 1rem;
  }
  
  .room-location {
    font-size: 0.8rem;
  }
  
  .service-options h3 {
    font-size: 1.1rem;
    margin-bottom: 15px;
  }
  
  .service-card {
    padding: 12px;
    margin-bottom: 10px;
    gap: 12px;
  }
  
  .service-icon {
    width: 45px;
    height: 45px;
    font-size: 1.8rem;
  }
  
  .service-title {
    font-size: 1rem;
  }
  
  .service-desc {
    font-size: 0.8rem;
  }
  
  .service-arrow {
    font-size: 1.2rem;
  }
  
  .modal-content {
    margin: 5px;
    max-height: 90vh;
  }
  
  .modal-header {
    padding: 12px 12px 0 12px;
  }
  
  .modal-header h3 {
    font-size: 1.1rem;
  }
  
  .modal-body {
    padding: 0 12px;
  }
  
  .modal-footer {
    padding: 12px;
  }
  
  .temperature-control {
    gap: 12px;
  }
  
  .temp-btn {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
  
  .temp-value {
    font-size: 1.1rem;
    min-width: 50px;
  }
  
  .people-count {
    gap: 12px;
  }
  
  .count-btn {
    width: 30px;
    height: 30px;
  }
  
  .form-group {
    gap: 8px;
  }
  
  .form-group label {
    font-size: 0.9rem;
  }
  
  .note-input {
    min-height: 60px;
    padding: 10px;
    font-size: 0.85rem;
  }
  
  .contact-input {
    padding: 6px 8px;
    font-size: 0.85rem;
  }
  
  .btn {
    padding: 8px 16px;
    font-size: 0.9rem;
    min-height: 36px;
  }
  
  .footer-info {
    margin-top: 20px;
    padding: 15px;
  }
  
  .service-time,
  .contact-service {
    font-size: 0.8rem;
  }
}
</style>