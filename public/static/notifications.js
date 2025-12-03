// Browser Notifications for 48-hour Pending Items
// 48시간 보류 항목 알림 시스템

// 알림 권한 요청
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('이 브라우저는 알림을 지원하지 않습니다')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

// 알림 표시
function showNotification(title, options = {}) {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/static/icon-192.png', // 앱 아이콘 (필요시 추가)
      badge: '/static/badge-72.png', // 작은 배지 아이콘
      vibrate: [200, 100, 200],
      ...options
    })

    notification.onclick = function(event) {
      event.preventDefault()
      if (options.url) {
        window.open(options.url, '_blank')
      }
      notification.close()
    }

    return notification
  }
}

// 로컬 스토리지에 보류 항목 저장
function savePendingReminder(decision) {
  const reminders = getPendingReminders()
  
  const reminder = {
    id: decision.id,
    item_name: decision.item_name,
    price: decision.price,
    created_at: decision.created_at,
    remind_at: new Date(new Date(decision.created_at).getTime() + 48 * 60 * 60 * 1000).toISOString(),
    url: `/result/${decision.id}`
  }

  reminders.push(reminder)
  localStorage.setItem('pendingReminders', JSON.stringify(reminders))
  
  console.log('알림 저장됨:', reminder)
  return reminder
}

// 로컬 스토리지에서 보류 항목 가져오기
function getPendingReminders() {
  const stored = localStorage.getItem('pendingReminders')
  return stored ? JSON.parse(stored) : []
}

// 만료된 알림 제거
function cleanupExpiredReminders() {
  const reminders = getPendingReminders()
  const now = new Date()
  
  const active = reminders.filter(r => {
    const remindTime = new Date(r.remind_at)
    // 알림 시간이 지나고 7일이 지나지 않은 것만 유지
    const expiryTime = new Date(remindTime.getTime() + 7 * 24 * 60 * 60 * 1000)
    return now < expiryTime
  })

  localStorage.setItem('pendingReminders', JSON.stringify(active))
  return active
}

// 알림이 필요한 항목 확인
function checkPendingReminders() {
  const reminders = cleanupExpiredReminders()
  const now = new Date()
  
  reminders.forEach(reminder => {
    const remindTime = new Date(reminder.remind_at)
    const notifiedKey = `notified_${reminder.id}`
    
    // 알림 시간이 되었고, 아직 알림을 보내지 않았으면
    if (now >= remindTime && !localStorage.getItem(notifiedKey)) {
      showNotification('🔔 48시간 보류 알림', {
        body: `${reminder.item_name} (₩${formatPrice(reminder.price)})\n\n다시 한번 생각해보시겠어요?`,
        tag: `reminder_${reminder.id}`,
        requireInteraction: true,
        url: reminder.url
      })
      
      // 알림 보낸 것으로 표시
      localStorage.setItem(notifiedKey, 'true')
      console.log('알림 전송:', reminder.item_name)
    }
  })
}

// 숫자 포맷팅
function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR').format(price)
}

// 알림 배지 업데이트
function updateNotificationBadge() {
  const reminders = getPendingReminders()
  const now = new Date()
  
  const pending = reminders.filter(r => {
    const remindTime = new Date(r.remind_at)
    return now < remindTime
  }).length

  // 대시보드에 배지 표시
  const badge = document.getElementById('pending-badge')
  if (badge) {
    if (pending > 0) {
      badge.textContent = pending
      badge.classList.remove('hidden')
    } else {
      badge.classList.add('hidden')
    }
  }

  return pending
}

// 보류 항목 리스트 렌더링
function renderPendingList() {
  const container = document.getElementById('pending-list')
  if (!container) return

  const reminders = getPendingReminders()
  const now = new Date()
  
  const pending = reminders.filter(r => {
    const remindTime = new Date(r.remind_at)
    return now < remindTime
  })

  if (pending.length === 0) {
    container.innerHTML = `
      <p class="text-gray-500 text-center py-4">
        48시간 보류 중인 항목이 없습니다
      </p>
    `
    return
  }

  container.innerHTML = pending.map(r => {
    const remindTime = new Date(r.remind_at)
    const timeLeft = remindTime - now
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

    return `
      <div class="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-4 hover:shadow-md transition">
        <div class="flex justify-between items-start mb-2">
          <div class="flex-1">
            <h4 class="font-bold text-lg text-gray-800">${r.item_name}</h4>
            <p class="text-yellow-700 font-semibold">₩${formatPrice(r.price)}</p>
          </div>
          <span class="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-semibold">
            ⏳ 보류중
          </span>
        </div>
        <div class="flex justify-between items-center mt-3">
          <p class="text-sm text-gray-600">
            <i class="fas fa-clock mr-1"></i>
            ${hoursLeft}시간 ${minutesLeft}분 후 알림
          </p>
          <a href="${r.url}" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
            다시 보기
          </a>
        </div>
      </div>
    `
  }).join('')
}

// 대시보드에 보류 항목 섹션 추가
function addPendingSection() {
  const app = document.getElementById('app')
  if (!app) return

  const reminders = getPendingReminders()
  const now = new Date()
  const pending = reminders.filter(r => new Date(r.remind_at) > now)

  if (pending.length === 0) return

  const section = `
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-800">
          <i class="fas fa-clock mr-2 text-yellow-600"></i>
          48시간 보류 항목
        </h2>
        <span id="pending-badge" class="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-bold">
          ${pending.length}
        </span>
      </div>
      <div id="pending-list" class="space-y-4"></div>
    </div>
  `

  // 새 판단 버튼 다음에 삽입
  const buttonsDiv = app.querySelector('.text-center.mb-8')
  if (buttonsDiv && buttonsDiv.nextElementSibling) {
    buttonsDiv.insertAdjacentHTML('afterend', section)
    renderPendingList()
  }
}

// 알림 시스템 초기화
function initNotificationSystem() {
  // 5분마다 알림 확인
  setInterval(checkPendingReminders, 5 * 60 * 1000)
  
  // 페이지 로드 시 즉시 확인
  checkPendingReminders()
  
  // 1분마다 배지 업데이트
  setInterval(updateNotificationBadge, 60 * 1000)
  updateNotificationBadge()
  
  console.log('알림 시스템 초기화 완료')
}

// 알림 권한 요청 UI
function showNotificationPermissionPrompt() {
  if (Notification.permission === 'default') {
    const prompt = document.createElement('div')
    prompt.className = 'fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50 border-2 border-purple-200'
    prompt.innerHTML = `
      <div class="flex items-start">
        <i class="fas fa-bell text-3xl text-purple-600 mr-3 mt-1"></i>
        <div class="flex-1">
          <h3 class="font-bold text-gray-800 mb-1">알림 받기</h3>
          <p class="text-sm text-gray-600 mb-3">
            48시간 보류 항목을 알려드릴까요?
          </p>
          <div class="flex gap-2">
            <button onclick="enableNotifications()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
              허용
            </button>
            <button onclick="dismissNotificationPrompt()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm">
              나중에
            </button>
          </div>
        </div>
        <button onclick="dismissNotificationPrompt()" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `
    document.body.appendChild(prompt)
    window.notificationPrompt = prompt
  }
}

// 알림 활성화
async function enableNotifications() {
  const granted = await requestNotificationPermission()
  if (granted) {
    showNotification('✅ 알림 설정 완료!', {
      body: '48시간 보류 항목을 알려드리겠습니다.',
      tag: 'welcome'
    })
  }
  dismissNotificationPrompt()
}

// 알림 프롬프트 닫기
function dismissNotificationPrompt() {
  if (window.notificationPrompt) {
    window.notificationPrompt.remove()
  }
}

// Export functions for global use
window.savePendingReminder = savePendingReminder
window.getPendingReminders = getPendingReminders
window.checkPendingReminders = checkPendingReminders
window.requestNotificationPermission = requestNotificationPermission
window.showNotificationPermissionPrompt = showNotificationPermissionPrompt
window.enableNotifications = enableNotifications
window.dismissNotificationPrompt = dismissNotificationPrompt
window.addPendingSection = addPendingSection
window.renderPendingList = renderPendingList
window.initNotificationSystem = initNotificationSystem
