import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getMeetingRooms, getUrlParams } from '@/utils/common'

export const useAppStore = defineStore('app', () => {
  // 状态
  const isAuthenticated = ref(false)
  const userRole = ref('') // 'admin' | 'staff' | ''
  const currentUser = ref(null)
  const currentMeetingRoom = ref('')
  const loading = ref(false)
  
  // 计算属性
  const isAdmin = computed(() => userRole.value === 'admin')
  const isStaff = computed(() => userRole.value === 'staff')
  
  // 方法
  const initApp = () => {
    // 从URL参数获取会议室信息
    const params = getUrlParams()
    if (params.room) {
      currentMeetingRoom.value = params.room
    }
    
    // 从localStorage恢复用户状态
    const savedUser = localStorage.getItem('meeting_room_user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        currentUser.value = user
        userRole.value = user.role
        isAuthenticated.value = true
      } catch (error) {
        console.error('恢复用户状态失败:', error)
        logout()
      }
    }
  }
  
  const login = (user) => {
    currentUser.value = user
    userRole.value = user.role
    isAuthenticated.value = true
    
    // 保存到localStorage
    localStorage.setItem('meeting_room_user', JSON.stringify(user))
  }
  
  const logout = () => {
    currentUser.value = null
    userRole.value = ''
    isAuthenticated.value = false
    
    // 清除localStorage
    localStorage.removeItem('meeting_room_user')
  }
  
  const setLoading = (value) => {
    loading.value = value
  }
  
  const setCurrentMeetingRoom = (room) => {
    currentMeetingRoom.value = room
  }
  
  return {
    // 状态
    isAuthenticated,
    userRole,
    currentUser,
    currentMeetingRoom,
    loading,
    
    // 计算属性
    isAdmin,
    isStaff,
    
    // 方法
    initApp,
    login,
    logout,
    setLoading,
    setCurrentMeetingRoom
  }
})