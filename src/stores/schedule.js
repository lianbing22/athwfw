import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { githubApi } from '@/utils/github'

export const useScheduleStore = defineStore('schedule', () => {
  // 状态
  const schedules = ref([])
  const staff = ref([])
  const currentMonth = ref(new Date().getMonth() + 1)
  const currentYear = ref(new Date().getFullYear())
  
  // 计算属性
  const currentMonthSchedules = computed(() => {
    return schedules.value.filter(schedule => {
      const date = new Date(schedule.date)
      return date.getMonth() + 1 === currentMonth.value && 
             date.getFullYear() === currentYear.value
    })
  })
  
  const staffMap = computed(() => {
    const map = {}
    staff.value.forEach(s => {
      map[s.id] = s
    })
    return map
  })
  
  // 方法
  const loadSchedules = async (year, month) => {
    try {
      const data = await githubApi.getScheduleIssues(year, month)
      schedules.value = data
      return data
    } catch (error) {
      console.error('加载排班数据失败:', error)
      throw error
    }
  }
  
  const loadStaff = async () => {
    try {
      const data = await githubApi.getStaffIssues()
      staff.value = data
      return data
    } catch (error) {
      console.error('加载服务员数据失败:', error)
      throw error
    }
  }
  
  const createSchedule = async (scheduleData) => {
    try {
      const schedule = {
        id: `schedule_${Date.now()}`,
        date: scheduleData.date,
        building: scheduleData.building,
        morningShift: scheduleData.morningShift,
        afternoonShift: scheduleData.afternoonShift,
        eveningShift: scheduleData.eveningShift,
        notes: scheduleData.notes || '',
        createdTime: new Date().toISOString(),
        updatedTime: new Date().toISOString()
      }
      
      // 保存到GitHub Issues
      await githubApi.createScheduleIssue(schedule)
      
      // 更新本地状态
      schedules.value.push(schedule)
      
      return schedule
    } catch (error) {
      console.error('创建排班失败:', error)
      throw error
    }
  }
  
  const updateSchedule = async (scheduleId, updateData) => {
    try {
      const schedule = schedules.value.find(s => s.id === scheduleId)
      if (!schedule) {
        throw new Error('排班记录不存在')
      }
      
      const data = {
        ...updateData,
        updatedTime: new Date().toISOString()
      }
      
      // 更新GitHub Issues
      await githubApi.updateScheduleIssue(scheduleId, data)
      
      // 更新本地状态
      Object.assign(schedule, data)
      
      return schedule
    } catch (error) {
      console.error('更新排班失败:', error)
      throw error
    }
  }
  
  const deleteSchedule = async (scheduleId) => {
    try {
      // 删除GitHub Issues
      await githubApi.deleteScheduleIssue(scheduleId)
      
      // 更新本地状态
      const index = schedules.value.findIndex(s => s.id === scheduleId)
      if (index > -1) {
        schedules.value.splice(index, 1)
      }
    } catch (error) {
      console.error('删除排班失败:', error)
      throw error
    }
  }
  
  const batchCreateSchedules = async (schedulesData) => {
    try {
      const results = []
      for (const scheduleData of schedulesData) {
        const schedule = await createSchedule(scheduleData)
        results.push(schedule)
      }
      return results
    } catch (error) {
      console.error('批量创建排班失败:', error)
      throw error
    }
  }
  
  const copyPreviousMonthSchedules = async (targetYear, targetMonth) => {
    try {
      // 计算上个月
      let prevYear = targetYear
      let prevMonth = targetMonth - 1
      if (prevMonth === 0) {
        prevMonth = 12
        prevYear -= 1
      }
      
      // 获取上个月的排班数据
      const prevSchedules = await githubApi.getScheduleIssues(prevYear, prevMonth)
      
      // 生成本月的排班数据
      const newSchedules = []
      const daysInMonth = new Date(targetYear, targetMonth, 0).getDate()
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const dayOfWeek = new Date(targetYear, targetMonth - 1, day).getDay()
        
        // 查找上个月同一天的排班（按星期几匹配）
        const prevSchedule = prevSchedules.find(s => {
          const prevDate = new Date(s.date)
          return prevDate.getDay() === dayOfWeek
        })
        
        if (prevSchedule) {
          newSchedules.push({
            date,
            building: prevSchedule.building,
            morningShift: prevSchedule.morningShift,
            afternoonShift: prevSchedule.afternoonShift,
            eveningShift: prevSchedule.eveningShift,
            notes: `复制自${prevYear}年${prevMonth}月排班`
          })
        }
      }
      
      // 批量创建排班
      return await batchCreateSchedules(newSchedules)
    } catch (error) {
      console.error('复制上月排班失败:', error)
      throw error
    }
  }
  
  const getScheduleByDate = (date, building = null) => {
    return schedules.value.find(s => {
      return s.date === date && (building ? s.building === building : true)
    })
  }
  
  const getStaffSchedules = (staffId, year, month) => {
    return schedules.value.filter(schedule => {
      const scheduleDate = new Date(schedule.date)
      const isTargetMonth = scheduleDate.getMonth() + 1 === month && 
                           scheduleDate.getFullYear() === year
      
      return isTargetMonth && (
        schedule.morningShift === staffId ||
        schedule.afternoonShift === staffId ||
        schedule.eveningShift === staffId
      )
    })
  }
  
  const setCurrentMonth = (year, month) => {
    currentYear.value = year
    currentMonth.value = month
  }
  
  return {
    // 状态
    schedules,
    staff,
    currentMonth,
    currentYear,
    
    // 计算属性
    currentMonthSchedules,
    staffMap,
    
    // 方法
    loadSchedules,
    loadStaff,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    batchCreateSchedules,
    copyPreviousMonthSchedules,
    getScheduleByDate,
    getStaffSchedules,
    setCurrentMonth
  }
})