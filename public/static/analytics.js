// Google Analytics Integration
// Google Analytics 통합 스크립트

// Google Analytics 추적 ID를 여기에 입력하세요
// 예: 'G-XXXXXXXXXX' 또는 'UA-XXXXXXXXX-X'
const GA_TRACKING_ID = 'YOUR_GA_TRACKING_ID'

// Google Analytics 초기화
function initGoogleAnalytics() {
  // GA 추적 ID가 설정되지 않았으면 건너뛰기
  if (GA_TRACKING_ID === 'YOUR_GA_TRACKING_ID') {
    console.log('Google Analytics: 추적 ID가 설정되지 않았습니다.')
    return
  }

  // gtag.js 스크립트 동적 로드
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`
  document.head.appendChild(script)

  // gtag 함수 초기화
  window.dataLayer = window.dataLayer || []
  function gtag() {
    dataLayer.push(arguments)
  }
  window.gtag = gtag

  gtag('js', new Date())
  gtag('config', GA_TRACKING_ID, {
    page_path: window.location.pathname
  })

  console.log('Google Analytics 초기화 완료:', GA_TRACKING_ID)
}

// 커스텀 이벤트 추적
function trackEvent(eventName, eventParams = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams)
    console.log('GA Event:', eventName, eventParams)
  }
}

// 페이지 뷰 추적
function trackPageView(pagePath) {
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: pagePath
    })
    console.log('GA Page View:', pagePath)
  }
}

// 소비 판단 이벤트 추적
function trackPurchaseDecision(itemName, price, category, conclusion) {
  trackEvent('purchase_decision', {
    item_name: itemName,
    value: price,
    category: category,
    conclusion: conclusion
  })
}

// 소셜 공유 이벤트 추적
function trackSocialShare(method) {
  trackEvent('share', {
    method: method,
    content_type: 'purchase_decision'
  })
}

// 통계 페이지 방문 추적
function trackStatsView() {
  trackEvent('view_statistics')
}

// 페이지 로드 시 자동 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGoogleAnalytics)
} else {
  initGoogleAnalytics()
}
