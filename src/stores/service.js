import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { githubApi } from '@/utils/github'
import { wechatBot } from '@/utils/wechat'

export const useServiceStore = defineStore('service', () => {
  // 状态
  const services = ref([])
  const currentService = ref(null)
  const serviceTypes = ref([
    { id: 'tea', name: '茶水服务', icon: '☕', estimatedTime: 5 },
    { id: 'clean', name: '清洁服务', icon: '🧹', estimatedTime: 15 },
    { id: 'tech', name: '技术支持', icon: '💻', estimatedTime: 10 },
    { id: 'maintenance', name: '设备维护', icon: '🔧', estimatedTime: 20 },
    { id: 'other', name: '其他服务', icon: '📋', estimatedTime: 10 }
  ])
  
  // 计算属性
  const pendingServices = computed(() => 
    services.value.filter(s => s.status === 'pending')
  )
  
  const processingServices = computed(() => 
    services.value.filter(s => s.status === 'processing')
  )
  
  const completedServices = computed(() => 
    services.value.filter(s => s.status === 'completed')
  )
  
  // 方法
  const createServiceRequest = async (requestData) => {
    try {
      const serviceId = `service_${Date.now()}`
      const service = {
        id: serviceId,
        meetingRoom: requestData.meetingRoom,
        serviceType: requestData.serviceType,
        description: requestData.description,
        priority: requestData.priority || 'normal',
        status: 'pending',
        requestTime: new Date().toISOString(),
        requester: requestData.requester || '匿名用户',
        assignedStaff: null,
        startTime: null,
        completedTime: null,
        estimatedTime: getServiceTypeById(requestData.serviceType)?.estimatedTime || 10
      }
      
      // 保存到GitHub Issues
      await githubApi.createServiceIssue(service)
      
      // 发送企业微信通知
      await wechatBot.sendServiceRequest(service)
      
      // 更新本地状态
      services.value.unshift(service)
      currentService.value = service
      
      return service
    } catch (error) {
      console.error('创建服务请求失败:', error)
      throw error
    }
  }
  
  const updateServiceStatus = async (serviceId, status, staffInfo = null) => {
    try {
      const service = services.value.find(s => s.id === serviceId)
      if (!service) {
        throw new Error('服务请求不存在')
      }
      
      const updateData = {
        status,
        updatedTime: new Date().toISOString()
      }
      
      if (status === 'processing' && staffInfo) {
        updateData.assignedStaff = staffInfo
        updateData.startTime = new Date().toISOString()
      } else if (status === 'completed') {
        updateData.completedTime = new Date().toISOString()
      }
      
      // 更新GitHub Issues
      await githubApi.updateServiceIssue(serviceId, updateData)
      
      // 发送企业微信通知
      await wechatBot.sendServiceStatusUpdate({
        ...service,
        ...updateData
      })
      
      // 更新本地状态
      Object.assign(service, updateData)
      
      return service
    } catch (error) {
      console.error('更新服务状态失败:', error)
      throw error
    }
  }
  
  const loadServices = async (filters = {}) => {
    try {
      const data = await githubApi.getServiceIssues(filters)
      services.value = data
      return data
    } catch (error) {
      console.error('加载服务列表失败:', error)
      throw error
    }
  }
  
  const getServiceById = (id) => {
    return services.value.find(s => s.id === id)
  }
  
  const getServiceTypeById = (id) => {
    return serviceTypes.value.find(t => t.id === id)
  }
  
  const transferService = async (serviceId, newStaffInfo) => {
    try {
      const service = services.value.find(s => s.id === serviceId)
      if (!service) {
        throw new Error('服务请求不存在')
      }
      
      const updateData = {
        assignedStaff: newStaffInfo,
        transferTime: new Date().toISOString(),
        transferReason: '服务转接'
      }
      
      // 更新GitHub Issues
      await githubApi.updateServiceIssue(serviceId, updateData)
      
      // 发送企业微信通知
      await wechatBot.sendServiceTransfer({
        ...service,
        ...updateData
      })
      
      // 更新本地状态
      Object.assign(service, updateData)
      
      return service
    } catch (error) {
      console.error('转接服务失败:', error)
      throw error
    }
  }
  
  return {
    // 状态
    services,
    currentService,
    serviceTypes,
    
    // 计算属性
    pendingServices,
    processingServices,
    completedServices,
    
    // 方法
    createServiceRequest,
    updateServiceStatus,
    loadServices,
    getServiceById,
    getServiceTypeById,
    transferService
  }
})