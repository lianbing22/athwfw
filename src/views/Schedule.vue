<template>
  <div class="schedule-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">值班安排</h1>
      <p class="page-subtitle">查看服务员排班信息</p>
    </div>

    <!-- 日期选择和筛选 -->
    <div class="schedule-controls">
      <div class="date-controls">
        <button class="btn btn-outline btn-sm" @click="previousMonth">
          ← 上月
        </button>
        <div class="current-month">
          <h2>{{ currentYear }}年{{ currentMonth }}月</h2>
        </div>
        <button class="btn btn-outline btn-sm" @click="nextMonth">
          下月 →
        </button>
      </div>
      
      <div class="filter-controls">
        <div class="filter-group">
          <label class="filter-label">楼栋筛选</label>
          <select v-model="selectedBuilding" class="filter-select">
            <option value="">全部楼栋</option>
            <option value="A">A座</option>
            <option value="B">B座</option>
          </select>
        </div>
        
        <button class="btn btn-primary btn-sm" @click="goToToday">
          回到今天
        </button>
      </div>
    </div>

    <!-- 排班统计 -->
    <div class="schedule-stats">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-number">{{ totalStaffCount }}</div>
            <div class="stat-label">总服务员数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <div class="stat-number">{{ scheduledDaysCount }}</div>
            <div class="stat-label">已排班天数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <div class="stat-number">{{ todayScheduleCount }}</div>
            <div class="stat-label">今日值班人数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏢</div>
          <div class="stat-content">
            <div class="stat-number">{{ buildingCoverage }}</div>
            <div class="stat-label">楼栋覆盖率</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 日历视图 -->
    <div class="calendar-section">
      <div class="calendar-header">
        <h3>排班日历</h3>
        <div class="view-controls">
          <button 
            class="btn btn-sm"
            :class="{ 'btn-primary': viewMode === 'calendar', 'btn-outline': viewMode !== 'calendar' }"
            @click="viewMode = 'calendar'"
          >
            日历视图
          </button>
          <button 
            class="btn btn-sm"
            :class="{ 'btn-primary': viewMode === 'list', 'btn-outline': viewMode !== 'list' }"
            @click="viewMode = 'list'"
          >
            列表视图
          </button>
        </div>
      </div>

      <!-- 日历视图 -->
      <div class="calendar-view" v-if="viewMode === 'calendar'">
        <div class="calendar-grid">
          <!-- 星期标题 -->
          <div class="calendar-weekdays">
            <div class="weekday" v-for="day in weekdays" :key="day">
              {{ day }}
            </div>
          </div>
          
          <!-- 日期格子 -->
          <div class="calendar-days">
            <div 
              v-for="day in calendarDays" 
              :key="day.date"
              class="calendar-day"
              :class="{
                'other-month': !day.isCurrentMonth,
                'today': day.isToday,
                'has-schedule': day.schedules.length > 0
              }"
              @click="selectDate(day.date)"
            >
              <div class="day-number">{{ day.dayNumber }}</div>
              <div class="day-schedules">
                <div 
                  v-for="schedule in day.schedules.slice(0, 3)" 
                  :key="schedule.id"
                  class="schedule-item"
                  :class="`building-${schedule.building.toLowerCase()}`"
                >
                  <span class="schedule-building">{{ schedule.building }}座</span>
                  <span class="schedule-shifts">
                    {{ getShiftSummary(schedule) }}
                  </span>
                </div>
                <div v-if="day.schedules.length > 3" class="more-schedules">
                  +{{ day.schedules.length - 3 }}个
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div class="list-view" v-else>
        <div class="schedule-list">
          <div 
            v-for="schedule in filteredSchedules" 
            :key="schedule.id"
            class="schedule-card"
            :class="`building-${schedule.building.toLowerCase()}`"
          >
            <div class="schedule-header">
              <div class="schedule-date">
                <span class="date-text">{{ formatDate(schedule.date) }}</span>
                <span class="weekday-text">{{ getWeekday(schedule.date) }}</span>
              </div>
              <div class="schedule-building">
                <span class="building-badge">{{ schedule.building }}座</span>
              </div>
            </div>
            
            <div class="schedule-content">
              <div class="shifts-grid">
                <div class="shift-item" v-if="schedule.morningShift">
                  <div class="shift-time">早班 (8:00-12:00)</div>
                  <div class="shift-staff">{{ schedule.morningShift }}</div>
                </div>
                <div class="shift-item" v-if="schedule.afternoonShift">
                  <div class="shift-time">午班 (12:00-18:00)</div>
                  <div class="shift-staff">{{ schedule.afternoonShift }}</div>
                </div>
                <div class="shift-item" v-if="schedule.eveningShift">
                  <div class="shift-time">晚班 (18:00-22:00)</div>
                  <div class="shift-staff">{{ schedule.eveningShift }}</div>
                </div>
              </div>
              
              <div class="schedule-notes" v-if="schedule.notes">
                <span class="notes-label">备注:</span>
                <span class="notes-text">{{ schedule.notes }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div class="empty-state" v-if="filteredSchedules.length === 0">
          <div class="empty-icon">📅</div>
          <h3>暂无排班信息</h3>
          <p>当前月份暂无排班安排</p>
        </div>
      </div>
    </div>

    <!-- 今日值班详情 -->
    <div class="today-schedule" v-if="todaySchedules.length > 0">
      <h3>今日值班</h3>
      <div class="today-grid">
        <div 
          v-for="schedule in todaySchedules" 
          :key="schedule.id"
          class="today-card"
          :class="`building-${schedule.building.toLowerCase()}`"
        >
          <div class="today-header">
            <span class="today-building">{{ schedule.building }}座</span>
            <span class="today-date">{{ formatDate(schedule.date) }}</span>
          </div>
          
          <div class="today-shifts">
            <div class="today-shift" v-if="schedule.morningShift">
              <div class="shift-period">早班</div>
              <div class="shift-time">8:00-12:00</div>
              <div class="shift-person">{{ schedule.morningShift }}</div>
            </div>
            <div class="today-shift" v-if="schedule.afternoonShift">
              <div class="shift-period">午班</div>
              <div class="shift-time">12:00-18:00</div>
              <div class="shift-person">{{ schedule.afternoonShift }}</div>
            </div>
            <div class="today-shift" v-if="schedule.eveningShift">
              <div class="shift-period">晚班</div>
              <div class="shift-time">18:00-22:00</div>
              <div class="shift-person">{{ schedule.eveningShift }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 服务员列表 -->
    <div class="staff-section">
      <h3>服务员列表</h3>
      <div class="staff-grid">
        <div 
          v-for="staff in staffList" 
          :key="staff.id"
          class="staff-card"
        >
          <div class="staff-avatar">
            {{ staff.name.charAt(0) }}
          </div>
          <div class="staff-info">
            <div class="staff-name">{{ staff.name }}</div>
            <div class="staff-stats">
              <span class="stat-item">本月值班: {{ getStaffMonthlyShifts(staff.id) }}次</span>
            </div>
          </div>
          <div class="staff-status">
            <span 
              class="status-badge"
              :class="getStaffTodayStatus(staff.id)"
            >
              {{ getStaffTodayStatusText(staff.id) }}
            </span>
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
import { useScheduleStore } from '@/stores/schedule'
import { formatTime } from '@/utils/common'

const router = useRouter()
const appStore = useAppStore()
const scheduleStore = useScheduleStore()

// 响应式数据
const viewMode = ref('calendar') // 'calendar' | 'list'
const selectedBuilding = ref('')
const selectedDate = ref(null)

// 星期标题
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// 计算属性
const currentYear = computed(() => scheduleStore.currentYear)
const currentMonth = computed(() => scheduleStore.currentMonth)

const filteredSchedules = computed(() => {
  let schedules = scheduleStore.currentMonthSchedules
  
  if (selectedBuilding.value) {
    schedules = schedules.filter(schedule => schedule.building === selectedBuilding.value)
  }
  
  return schedules.sort((a, b) => new Date(a.date) - new Date(b.date))
})

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const dateStr = date.toISOString().split('T')[0]
    const daySchedules = filteredSchedules.value.filter(s => s.date === dateStr)
    
    days.push({
      date: dateStr,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month - 1,
      isToday: date.toDateString() === today.toDateString(),
      schedules: daySchedules
    })
  }
  
  return days
})

const todaySchedules = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return scheduleStore.currentMonthSchedules.filter(schedule => schedule.date === today)
})

const staffList = computed(() => {
  return scheduleStore.staff
})

const totalStaffCount = computed(() => {
  return staffList.value.length
})

const scheduledDaysCount = computed(() => {
  return new Set(scheduleStore.currentMonthSchedules.map(s => s.date)).size
})

const todayScheduleCount = computed(() => {
  return todaySchedules.value.reduce((count, schedule) => {
    let shifts = 0
    if (schedule.morningShift) shifts++
    if (schedule.afternoonShift) shifts++
    if (schedule.eveningShift) shifts++
    return count + shifts
  }, 0)
})

const buildingCoverage = computed(() => {
  const buildings = new Set(scheduleStore.currentMonthSchedules.map(s => s.building))
  return `${buildings.size}/2`
})

// 方法
const previousMonth = () => {
  if (currentMonth.value === 1) {
    scheduleStore.setCurrentMonth(currentYear.value - 1, 12)
  } else {
    scheduleStore.setCurrentMonth(currentYear.value, currentMonth.value - 1)
  }
  loadSchedules()
}

const nextMonth = () => {
  if (currentMonth.value === 12) {
    scheduleStore.setCurrentMonth(currentYear.value + 1, 1)
  } else {
    scheduleStore.setCurrentMonth(currentYear.value, currentMonth.value + 1)
  }
  loadSchedules()
}

const goToToday = () => {
  const today = new Date()
  scheduleStore.setCurrentMonth(today.getFullYear(), today.getMonth() + 1)
  loadSchedules()
}

const selectDate = (date) => {
  selectedDate.value = date
  // TODO: 显示该日期的详细排班信息
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const getWeekday = (dateStr) => {
  const date = new Date(dateStr)
  return weekdays[date.getDay()]
}

const getShiftSummary = (schedule) => {
  const shifts = []
  if (schedule.morningShift) shifts.push('早')
  if (schedule.afternoonShift) shifts.push('午')
  if (schedule.eveningShift) shifts.push('晚')
  return shifts.join('/')
}

const getStaffMonthlyShifts = (staffId) => {
  const staffName = staffList.value.find(s => s.id === staffId)?.name
  if (!staffName) return 0
  
  return scheduleStore.currentMonthSchedules.reduce((count, schedule) => {
    let shifts = 0
    if (schedule.morningShift === staffName) shifts++
    if (schedule.afternoonShift === staffName) shifts++
    if (schedule.eveningShift === staffName) shifts++
    return count + shifts
  }, 0)
}

const getStaffTodayStatus = (staffId) => {
  const staffName = staffList.value.find(s => s.id === staffId)?.name
  if (!staffName) return 'off'
  
  const today = new Date().toISOString().split('T')[0]
  const todaySchedule = scheduleStore.currentMonthSchedules.find(schedule => 
    schedule.date === today && (
      schedule.morningShift === staffName ||
      schedule.afternoonShift === staffName ||
      schedule.eveningShift === staffName
    )
  )
  
  return todaySchedule ? 'on-duty' : 'off'
}

const getStaffTodayStatusText = (staffId) => {
  const status = getStaffTodayStatus(staffId)
  return status === 'on-duty' ? '值班中' : '休息'
}

const loadSchedules = async () => {
  try {
    appStore.setLoading(true)
    await scheduleStore.loadSchedules(currentYear.value, currentMonth.value)
  } catch (error) {
    console.error('加载排班数据失败:', error)
  } finally {
    appStore.setLoading(false)
  }
}

// 生命周期
onMounted(async () => {
  try {
    appStore.setLoading(true)
    await Promise.all([
      scheduleStore.loadSchedules(currentYear.value, currentMonth.value),
      scheduleStore.loadStaff()
    ])
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    appStore.setLoading(false)
  }
})
</script>

<style scoped>
.schedule-page {
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

.schedule-controls {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.date-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.current-month h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.3rem;
}

.filter-controls {
  display: flex;
  align-items: end;
  gap: 15px;
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

.schedule-stats {
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
  font-size: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
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

.calendar-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.calendar-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.3rem;
}

.view-controls {
  display: flex;
  gap: 5px;
}

.calendar-grid {
  width: 100%;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 1px;
}

.weekday {
  padding: 10px;
  text-align: center;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--background-light);
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.calendar-day {
  min-height: 100px;
  padding: 8px;
  background: white;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.calendar-day:hover {
  background: var(--primary-light);
}

.calendar-day.other-month {
  opacity: 0.3;
}

.calendar-day.today {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.calendar-day.has-schedule {
  background: var(--success-light);
}

.day-number {
  font-weight: 600;
  margin-bottom: 5px;
  color: var(--text-primary);
}

.day-schedules {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.schedule-item {
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.7rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.schedule-item.building-a {
  background: var(--primary-light);
  color: var(--primary-color);
}

.schedule-item.building-b {
  background: var(--success-light);
  color: var(--success-color);
}

.schedule-building {
  font-weight: 600;
}

.schedule-shifts {
  font-size: 0.6rem;
}

.more-schedules {
  font-size: 0.6rem;
  color: var(--text-secondary);
  text-align: center;
  margin-top: 2px;
}

.list-view {
  max-height: 600px;
  overflow-y: auto;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.schedule-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 15px;
  border-left: 4px solid var(--border-color);
}

.schedule-card.building-a {
  border-left-color: var(--primary-color);
}

.schedule-card.building-b {
  border-left-color: var(--success-color);
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.date-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.weekday-text {
  color: var(--text-secondary);
  margin-left: 8px;
}

.building-badge {
  background: var(--primary-light);
  color: var(--primary-color);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.shifts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

.shift-item {
  background: var(--background-light);
  padding: 10px;
  border-radius: 6px;
}

.shift-time {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 5px;
}

.shift-staff {
  font-weight: 600;
  color: var(--text-primary);
}

.schedule-notes {
  display: flex;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
}

.notes-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.notes-text {
  color: var(--text-primary);
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
  margin: 0;
}

.today-schedule {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.today-schedule h3 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
  font-size: 1.3rem;
}

.today-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.today-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 15px;
  border-left: 4px solid var(--border-color);
}

.today-card.building-a {
  border-left-color: var(--primary-color);
}

.today-card.building-b {
  border-left-color: var(--success-color);
}

.today-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.today-building {
  font-weight: 600;
  color: var(--text-primary);
}

.today-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.today-shifts {
  display: flex;
  gap: 15px;
}

.today-shift {
  flex: 1;
  text-align: center;
  padding: 10px;
  background: var(--background-light);
  border-radius: 6px;
}

.shift-period {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
}

.shift-time {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 5px;
}

.shift-person {
  font-size: 0.9rem;
  color: var(--primary-color);
  font-weight: 500;
}

.staff-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.staff-section h3 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
  font-size: 1.3rem;
}

.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.staff-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.staff-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.staff-info {
  flex: 1;
}

.staff-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
}

.staff-stats {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.on-duty {
  background: var(--success-light);
  color: var(--success-color);
}

.status-badge.off {
  background: var(--border-color);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .schedule-page {
    padding: 15px;
  }
  
  .schedule-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .date-controls {
    justify-content: center;
  }
  
  .filter-controls {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .calendar-day {
    min-height: 80px;
    padding: 5px;
  }
  
  .shifts-grid {
    grid-template-columns: 1fr;
  }
  
  .today-grid {
    grid-template-columns: 1fr;
  }
  
  .today-shifts {
    flex-direction: column;
    gap: 10px;
  }
  
  .staff-grid {
    grid-template-columns: 1fr;
  }
  
  .calendar-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .view-controls {
    justify-content: center;
  }
}
</style>