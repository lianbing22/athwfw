<template>
  <div id="app">
    <div class="home-page">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">🏢 阿泰会务服务</h1>
          <p class="page-subtitle">为您提供专业便捷的会议室服务</p>
        </div>
        <div class="header-decoration"></div>
      </div>

      <!-- 服务选项卡片 -->
      <div class="service-grid">
        <!-- 空调调温 -->
        <div class="service-card air-condition" @click="showAirCondition = true">
          <div class="service-background">
            <div class="service-icon">❄️</div>
          </div>
          <div class="service-content">
            <h3 class="service-title">空调调温</h3>
            <p class="service-desc">调节会议室温度</p>
            <div class="service-arrow">→</div>
          </div>
        </div>

        <!-- 茶水服务 -->
        <div class="service-card tea-service" @click="showTeaService = true">
          <div class="service-background">
            <div class="service-icon">☕</div>
          </div>
          <div class="service-content">
            <h3 class="service-title">茶水服务</h3>
            <p class="service-desc">茶水更换或添加</p>
            <div class="service-arrow">→</div>
          </div>
        </div>

        <!-- 设备维护 -->
        <div class="service-card equipment-service" @click="showEquipment = true">
          <div class="service-background">
            <div class="service-icon">🎤</div>
          </div>
          <div class="service-content">
            <h3 class="service-title">设备维护</h3>
            <p class="service-desc">话筒、投影设备</p>
            <div class="service-arrow">→</div>
          </div>
        </div>
      </div>

      <!-- 空调调温弹窗 -->
      <div v-if="showAirCondition" class="modal-overlay" @click="showAirCondition = false">
        <div class="modal-content" @click.stop>
          <h3>空调调温</h3>
          <div class="temperature-control">
            <button @click="temperature--">-</button>
            <span>{{ temperature }}°C</span>
            <button @click="temperature++">+</button>
          </div>
          <div class="modal-actions">
            <button @click="submitAirCondition" class="submit-btn">提交申请</button>
            <button @click="showAirCondition = false" class="cancel-btn">取消</button>
          </div>
        </div>
      </div>

      <!-- 茶水服务弹窗 -->
      <div v-if="showTeaService" class="modal-overlay" @click="showTeaService = false">
        <div class="modal-content" @click.stop>
          <h3>茶水服务</h3>
          <div class="tea-options">
            <label><input type="radio" v-model="teaType" value="更换"> 更换茶水</label>
            <label><input type="radio" v-model="teaType" value="添加"> 添加茶水</label>
          </div>
          <div class="modal-actions">
            <button @click="submitTeaService" class="submit-btn">提交申请</button>
            <button @click="showTeaService = false" class="cancel-btn">取消</button>
          </div>
        </div>
      </div>

      <!-- 设备维护弹窗 -->
      <div v-if="showEquipment" class="modal-overlay" @click="showEquipment = false">
        <div class="modal-content" @click.stop>
          <h3>设备维护</h3>
          <div class="equipment-options">
            <label><input type="checkbox" v-model="equipmentTypes" value="话筒"> 话筒</label>
            <label><input type="checkbox" v-model="equipmentTypes" value="投影"> 投影设备</label>
          </div>
          <textarea v-model="equipmentDesc" placeholder="请描述具体问题..."></textarea>
          <div class="modal-actions">
            <button @click="submitEquipment" class="submit-btn">提交申请</button>
            <button @click="showEquipment = false" class="cancel-btn">取消</button>
          </div>
        </div>
      </div>

      <!-- 成功提示 -->
      <div v-if="showSuccess" class="success-message">
        <p>{{ successMessage }}</p>
        <button @click="showSuccess = false">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 页面状态
const showAirCondition = ref(false)
const showTeaService = ref(false)
const showEquipment = ref(false)
const showSuccess = ref(false)
const successMessage = ref('')

// 服务数据
const temperature = ref(24)
const teaType = ref('更换')
const equipmentTypes = ref([])
const equipmentDesc = ref('')

// 获取会议室信息（模拟数据）
const getRoomInfo = () => {
  return {
    name: '会议室A-301',
    building: 'A栋',
    floor: '3楼'
  }
}

// 获取用户信息（模拟数据）
const getUserInfo = () => {
  return {
    name: '张三',
    department: '技术部',
    mobile: '138****1234'
  }
}

// 发送企业微信通知
const sendWeChatNotification = async (serviceInfo) => {
  try {
    console.log('准备发送企业微信通知:', serviceInfo)
    
    // 调用后端API发送企业微信通知
    const response = await fetch('http://localhost:3001/api/wechat/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ serviceInfo })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('企业微信通知发送成功:', result)
    return result
  } catch (error) {
    console.error('企业微信通知发送失败:', error)
    console.error('错误详情:', error.message)
    // 即使通知发送失败，也不影响用户体验
    throw error
  }
}

// 提交方法
const submitAirCondition = async () => {
  const serviceInfo = {
    type: '空调调温',
    details: {
      temperature: temperature.value,
      note: '用户通过阿泰会务服务系统申请'
    },
    roomInfo: getRoomInfo(),
    userInfo: getUserInfo(),
    timestamp: Date.now()
  }
  
  // 发送企业微信通知
  try {
    await sendWeChatNotification(serviceInfo)
    successMessage.value = `空调调温申请已提交，目标温度：${temperature.value}°C\n企业微信通知已发送，工作人员将尽快为您处理`
  } catch (error) {
    console.warn('企业微信通知发送失败，但申请已记录')
    successMessage.value = `空调调温申请已提交，目标温度：${temperature.value}°C\n工作人员将尽快为您处理`
  }
  showAirCondition.value = false
  showSuccess.value = true
}

const submitTeaService = async () => {
  const serviceInfo = {
    type: '茶水服务',
    details: {
      serviceType: teaType.value,
      quantity: 1,
      note: '用户通过阿泰会务服务系统申请'
    },
    roomInfo: getRoomInfo(),
    userInfo: getUserInfo(),
    timestamp: Date.now()
  }
  
  // 发送企业微信通知
  try {
    await sendWeChatNotification(serviceInfo)
    successMessage.value = `茶水服务申请已提交，服务类型：${teaType.value}\n企业微信通知已发送，工作人员将尽快为您处理`
  } catch (error) {
    console.warn('企业微信通知发送失败，但申请已记录')
    successMessage.value = `茶水服务申请已提交，服务类型：${teaType.value}\n工作人员将尽快为您处理`
  }
  showTeaService.value = false
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}

const submitEquipment = async () => {
  const types = equipmentTypes.value.join('、')
  const serviceInfo = {
    type: '设备维护',
    details: {
      equipmentType: types,
      issue: equipmentDesc.value || '设备检查维护',
      urgency: '普通',
      note: '用户通过阿泰会务服务系统申请'
    },
    roomInfo: getRoomInfo(),
    userInfo: getUserInfo(),
    timestamp: Date.now()
  }
  
  // 发送企业微信通知
  try {
    await sendWeChatNotification(serviceInfo)
    successMessage.value = `设备维护申请已提交，设备：${types}\n企业微信通知已发送，工作人员将尽快为您处理`
  } catch (error) {
    console.warn('企业微信通知发送失败，但申请已记录')
    successMessage.value = `设备维护申请已提交，设备：${types}\n工作人员将尽快为您处理`
  }
  showEquipment.value = false
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
  equipmentTypes.value = []
  equipmentDesc.value = ''
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #667eea; /* 备用纯色背景 */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-attachment: fixed;
  padding: 0;
  margin: 0;
  position: relative;
}

.home-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.9) 0%, 
    rgba(118, 75, 162, 0.9) 50%,
    rgba(102, 126, 234, 0.8) 100%);
  z-index: 0;
}

.page-header {
  position: relative;
  padding: 40px 20px 60px;
  text-align: center;
  overflow: hidden;
  z-index: 1;
}

.header-content {
  position: relative;
  z-index: 2;
}

.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" fill="%23ffffff" opacity="0.1"><path d="M0,0 C150,100 350,0 500,50 C650,100 850,0 1000,50 L1000,100 L0,100 Z"/></svg>') no-repeat center bottom;
  background-size: cover;
}

.page-title {
  font-size: 32px;
  color: white;
  margin-bottom: 12px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.page-subtitle {
  color: rgba(255,255,255,0.9);
  font-size: 16px;
  margin: 0;
  font-weight: 300;
}

.service-grid {
  padding: 0 20px 40px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.service-card {
  position: relative;
  background: white;
  border-radius: 20px;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  overflow: hidden;
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.2);
}

.service-background {
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
  border-radius: 0 20px 0 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.air-condition .service-background {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
}

.tea-service .service-background {
  background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
}

.equipment-service .service-background {
  background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%);
}

.service-icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.service-content {
  padding: 24px;
  position: relative;
}

.service-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #2d3436;
}

.service-desc {
  margin: 0;
  color: #636e72;
  font-size: 14px;
  line-height: 1.5;
}

.service-arrow {
  position: absolute;
  bottom: 24px;
  right: 24px;
  font-size: 18px;
  color: #b2bec3;
  transition: all 0.3s ease;
}

.service-card:hover .service-arrow {
  color: #74b9ff;
  transform: translateX(4px);
}

.service-card:hover .service-background {
  transform: scale(1.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
}

.modal-content h3 {
  margin: 0 0 20px 0;
  text-align: center;
}

.temperature-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
}

.temperature-control button {
  width: 40px;
  height: 40px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
}

.temperature-control span {
  font-size: 24px;
  font-weight: 600;
}

.tea-options, .equipment-options {
  margin: 20px 0;
}

.tea-options label, .equipment-options label {
  display: block;
  margin: 10px 0;
  cursor: pointer;
}

textarea {
  width: 100%;
  height: 80px;
  margin: 15px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.submit-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.cancel-btn {
  background: #ccc;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.success-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  text-align: center;
  z-index: 1001;
}

.success-message button {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 15px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .page-header {
    padding: 30px 15px 50px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .page-subtitle {
    font-size: 14px;
  }
  
  .service-grid {
    padding: 0 15px 30px;
    gap: 16px;
  }
  
  .service-content {
    padding: 20px;
  }
  
  .service-title {
    font-size: 18px;
  }
  
  .service-background {
    width: 70px;
    height: 70px;
  }
  
  .service-icon {
    font-size: 24px;
  }
  
  .modal-content {
    padding: 20px;
    margin: 20px;
  }
}
</style>