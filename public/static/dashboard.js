// Dashboard JavaScript
// 대시보드 페이지 로직

// 결론별 아이콘과 색상
const CONCLUSION_CONFIG = {
  '구매 OK': {
    icon: 'fas fa-check-circle',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  '48시간 보류': {
    icon: 'fas fa-clock',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  '구매 비추천': {
    icon: 'fas fa-times-circle',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  }
}

// 숫자 포맷팅 (천단위 콤마)
function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR').format(price)
}

// 날짜 포맷팅
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 판단 기록 렌더링
function renderDecision(decision) {
  const config = CONCLUSION_CONFIG[decision.conclusion]
  
  return `
    <div class="border-2 ${config.borderColor} ${config.bgColor} rounded-lg p-4 hover:shadow-md transition cursor-pointer"
         onclick="window.location.href='/result/${decision.id}'">
      <div class="flex justify-between items-start mb-2">
        <div class="flex-1">
          <h3 class="text-lg font-bold text-gray-800 mb-1">${decision.item_name}</h3>
          <p class="text-2xl font-bold text-purple-600">₩${formatPrice(decision.price)}</p>
        </div>
        <div class="text-right">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${config.color} ${config.bgColor}">
            <i class="${config.icon} mr-1"></i>
            ${decision.conclusion}
          </span>
          <p class="text-xs text-gray-500 mt-2">${formatDate(decision.created_at)}</p>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-2 mt-3 text-sm">
        <div class="bg-white rounded px-3 py-2">
          <span class="text-gray-600">카테고리:</span>
          <span class="font-semibold text-gray-800 ml-1">${decision.category}</span>
        </div>
        <div class="bg-white rounded px-3 py-2">
          <span class="text-gray-600">총점:</span>
          <span class="font-semibold ${decision.total_score >= 5 ? 'text-green-600' : decision.total_score >= 0 ? 'text-yellow-600' : 'text-red-600'} ml-1">
            ${decision.total_score.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  `
}

// 판단 기록 목록 로드
async function loadDecisions() {
  const listContainer = document.getElementById('decisions-list')
  
  try {
    const response = await axios.get('/api/decisions')
    
    if (response.data.success && response.data.data.length > 0) {
      const decisions = response.data.data
      listContainer.innerHTML = decisions.map(renderDecision).join('')
    } else {
      listContainer.innerHTML = `
        <div class="text-center py-12">
          <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-500 text-lg mb-4">아직 판단 기록이 없습니다</p>
          <a href="/new" class="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition">
            <i class="fas fa-plus-circle mr-2"></i>
            첫 번째 판단 시작하기
          </a>
        </div>
      `
    }
  } catch (error) {
    console.error('Error loading decisions:', error)
    listContainer.innerHTML = `
      <div class="text-center py-8">
        <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-2"></i>
        <p class="text-red-600">데이터를 불러오는데 실패했습니다</p>
        <button onclick="loadDecisions()" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          다시 시도
        </button>
      </div>
    `
  }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
  loadDecisions()
})
