// Result JavaScript
// 결과 페이지 로직

// 결론별 설정
const CONCLUSION_CONFIG = {
  '구매 OK': {
    icon: 'fas fa-check-circle',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    emoji: '✅'
  },
  '48시간 보류': {
    icon: 'fas fa-clock',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-500',
    emoji: '⏳'
  },
  '구매 비추천': {
    icon: 'fas fa-times-circle',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    emoji: '❌'
  }
}

// 숫자 포맷팅
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

// 점수 바 렌더링
function renderScoreBar(label, value, isPositive = true) {
  const color = isPositive ? 'bg-green-500' : 'bg-red-500'
  const percentage = Math.min(Math.abs(value) * 10, 100)
  
  return `
    <div class="mb-4">
      <div class="flex justify-between items-center mb-1">
        <span class="text-sm font-medium text-gray-700">${label}</span>
        <span class="text-sm font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}">
          ${isPositive ? '+' : '-'}${Math.abs(value).toFixed(1)}
        </span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3">
        <div class="${color} h-3 rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
      </div>
    </div>
  `
}

// 결과 페이지 렌더링
function renderResult(decision) {
  const config = CONCLUSION_CONFIG[decision.conclusion]
  const comments = decision.comments ? decision.comments.split(/(?<=[.!?])\s+/) : []
  
  return `
    <!-- 헤더 -->
    <header class="text-center mb-8">
      <a href="/" class="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4">
        <i class="fas fa-arrow-left mr-2"></i>
        대시보드로 돌아가기
      </a>
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        <i class="fas fa-chart-line mr-2 text-purple-600"></i>
        판단 결과
      </h1>
      <p class="text-gray-600">${formatDate(decision.created_at)}</p>
    </header>

    <!-- 결론 카드 -->
    <div class="bg-white rounded-lg shadow-lg p-8 mb-6 border-4 ${config.borderColor}">
      <div class="text-center mb-6">
        <div class="text-8xl mb-4">${config.emoji}</div>
        <h2 class="text-4xl font-bold ${config.color} mb-2">
          ${decision.conclusion}
        </h2>
        <p class="text-xl text-gray-700 font-medium">${decision.item_name}</p>
        <p class="text-3xl text-purple-600 font-bold mt-2">₩${formatPrice(decision.price)}</p>
        <span class="inline-block mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">
          ${decision.category}
        </span>
      </div>
    </div>

    <!-- 점수 상세 -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <i class="fas fa-calculator mr-2 text-blue-600"></i>
        점수 상세
      </h3>
      
      <div class="mb-6">
        ${renderScoreBar('필요성 (N)', decision.necessity_score, true)}
        ${renderScoreBar('후회 위험 (R)', decision.regret_risk, false)}
        ${renderScoreBar('예산 부담 (B)', decision.budget_burden, false)}
        ${renderScoreBar('중복/유지비 (D)', decision.duplicate_cost, false)}
      </div>

      <div class="border-t-2 pt-4">
        <div class="flex justify-between items-center">
          <span class="text-lg font-bold text-gray-800">총점 (T)</span>
          <span class="text-3xl font-bold ${decision.total_score >= 5 ? 'text-green-600' : decision.total_score >= 0 ? 'text-yellow-600' : 'text-red-600'}">
            ${decision.total_score.toFixed(1)}
          </span>
        </div>
      </div>
    </div>

    <!-- 코멘트 -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <i class="fas fa-comment-dots mr-2 text-purple-600"></i>
        AI 분석 코멘트
      </h3>
      <ul class="space-y-3">
        ${comments.map(comment => `
          <li class="flex items-start">
            <i class="fas fa-chevron-right text-purple-600 mt-1 mr-2"></i>
            <span class="text-gray-700">${comment}</span>
          </li>
        `).join('')}
      </ul>
    </div>

    <!-- 액션 버튼 -->
    <div class="flex gap-4 justify-center">
      <a href="/" class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
        <i class="fas fa-home mr-2"></i>
        대시보드
      </a>
      <a href="/new" class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
        <i class="fas fa-plus-circle mr-2"></i>
        새로 판단하기
      </a>
      <button onclick="deleteDecision(${decision.id})" class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
        <i class="fas fa-trash mr-2"></i>
        삭제
      </button>
    </div>
  `
}

// 결과 로드
async function loadResult() {
  const resultContainer = document.getElementById('result-content')
  const pathParts = window.location.pathname.split('/')
  const decisionId = pathParts[pathParts.length - 1]

  try {
    const response = await axios.get(`/api/decisions/${decisionId}`)

    if (response.data.success) {
      resultContainer.innerHTML = renderResult(response.data.data)
    } else {
      resultContainer.innerHTML = `
        <div class="text-center py-12">
          <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">결과를 찾을 수 없습니다</h2>
          <p class="text-gray-600 mb-6">${response.data.error}</p>
          <a href="/" class="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <i class="fas fa-home mr-2"></i>
            대시보드로 돌아가기
          </a>
        </div>
      `
    }
  } catch (error) {
    console.error('Error loading result:', error)
    resultContainer.innerHTML = `
      <div class="text-center py-12">
        <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">오류 발생</h2>
        <p class="text-gray-600 mb-6">결과를 불러오는데 실패했습니다</p>
        <button onclick="loadResult()" class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <i class="fas fa-redo mr-2"></i>
          다시 시도
        </button>
      </div>
    `
  }
}

// 삭제 기능
async function deleteDecision(id) {
  if (!confirm('정말 이 판단 기록을 삭제하시겠습니까?')) {
    return
  }

  try {
    const response = await axios.delete(`/api/decisions/${id}`)

    if (response.data.success) {
      alert('삭제되었습니다')
      window.location.href = '/'
    } else {
      alert('삭제에 실패했습니다: ' + response.data.error)
    }
  } catch (error) {
    console.error('Error deleting decision:', error)
    alert('삭제에 실패했습니다')
  }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
  loadResult()
})
