<template>
  <div id="app">
    <div class="home-page">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1 class="page-title">阿泰会务服务</h1>
        <p class="page-subtitle">为您提供专业的会议室服务</p>
      </div>

      <!-- 快速操作区域 -->
      <div class="quick-actions">
        <div class="action-card primary" @click="showMeetingService = true">
          <div class="action-icon">📱</div>
          <div class="action-content">
            <div class="action-title">会中扫码服务</div>
            <div class="action-desc">空调调温 · 茶水服务 · 设备维护</div>
          </div>
          <div class="action-badge">MVP</div>
        </div>
      </div>

      <!-- 会中扫码服务页面 -->
      <div v-if="showMeetingService" class="meeting-service">
        <div class="service-header">
          <button @click="showMeetingService = false" class="back-btn">← 返回</button>
          <h2>会中扫码服务</h2>
        </div>

        <!-- 服务选项 -->
        <div class="service-options">
          <!-- 空调调温 -->
          <div class="service-card" @click="showAirCondition = true">
            <div class="service-icon">❄️</div>
            <div class="service-info">
              <h3>空调调温</h3>
              <p>调节会议室温度</p>
            </div>
          </div>

          <!-- 茶水服务 -->
          <div class="service-card" @click="showTeaService = true">
            <div class="service-icon">☕</div>
            <div class="service-info">
              <h3>茶水服务</h3>
              <p>茶水更换或添加</p>
            </div>
          </div>

          <!-- 设备维护 -->
          <div class="service-card" @click="showEquipment = true">
            <div class="service-icon">🎤</div>
            <div class="service-info">
              <h3>设备维护</h3>
              <p>话筒、投影设备</p>
            </div>
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
import wechatBot from './utils/wechatBot.js'

// 页面状态
const showMeetingService = ref(false)
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
    await wechatBot.sendServiceRequest(serviceInfo)
    console.log('企业微信通知发送成功')
  } catch (error) {
    console.error('企业微信通知发送失败:', error)
    // 即使通知发送失败，也不影响用户体验
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
  await sendWeChatNotification(serviceInfo)
  
  successMessage.value = `空调调温申请已提交，目标温度：${temperature.value}°C\n工作人员将尽快为您处理`
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
  await sendWeChatNotification(serviceInfo)
  
  successMessage.value = `茶水服务申请已提交，服务类型：${teaType.value}\n工作人员将尽快为您处理`
  showTeaService.value = false
  showSuccess.value = true
}

const submitEquipment = async () => {
  const types = equipmentTypes.value.join('、')
  const serviceInfo = {
    type: '设备维护',
    details: {
      equipmentType: types,
      issue: equipmentDesc.value || '设备检查维护',
      urgency: '普通'
    },
    roomInfo: getRoomInfo(),
    userInfo: getUserInfo(),
    timestamp: Date.now()
  }
  
  // 发送企业微信通知
  await sendWeChatNotification(serviceInfo)
  
  successMessage.value = `设备维护申请已提交，设备：${types}\n工作人员将尽快为您处理`
  showEquipment.value = false
  showSuccess.value = true
  equipmentTypes.value = []
  equipmentDesc.value = ''
}
</script>

<style scoped>
.home-page {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.page-subtitle {
  color: #666;
  font-size: 14px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.action-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
}

.action-card:hover {
  transform: translateY(-2px);
}

.action-card.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-icon {
  font-size: 32px;
  margin-right: 15px;
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 14px;
  opacity: 0.8;
}

.action-badge {
  background: rgba(255,255,255,0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.meeting-service {
  margin-top: 30px;
}

.service-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  margin-right: 10px;
}

.service-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.service-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.service-card:hover {
  transform: translateY(-2px);
}

.service-icon {
  font-size: 32px;
  margin-right: 15px;
}

.service-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.service-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
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
  .home-page {
    padding: 15px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .action-card {
    padding: 15px;
  }
  
  .action-icon {
    font-size: 28px;
  }
  
  .modal-content {
    padding: 20px;
  }
}
</style>