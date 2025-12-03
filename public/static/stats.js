// Statistics Page JavaScript
// 통계 페이지 로직

// 숫자 포맷팅 (천단위 콤마)
function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR').format(price)
}

// 통계 카드 렌더링
function renderStatCard(icon, title, value, subtitle, color = 'purple') {
  const colorClasses = {
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    green: 'bg-green-50 text-green-700 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200'
  }

  return `
    <div class="bg-white rounded-lg shadow-md p-6 border-2 ${colorClasses[color]}">
      <div class="flex items-center justify-between mb-2">
        <i class="fas ${icon} text-3xl"></i>
        <span class="text-sm text-gray-600">${subtitle}</span>
      </div>
      <h3 class="text-2xl font-bold mb-1">${value}</h3>
      <p class="text-sm font-medium">${title}</p>
    </div>
  `
}

// 카테고리별 통계 렌더링
function renderCategoryStats(categories) {
  if (categories.length === 0) {
    return '<p class="text-gray-500 text-center py-8">아직 데이터가 없습니다</p>'
  }

  return categories.map(cat => `
    <div class="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition">
      <div class="flex justify-between items-center mb-2">
        <h4 class="font-bold text-lg text-gray-800">${cat.category}</h4>
        <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
          ${cat.count}건
        </span>
      </div>
      <div class="space-y-1">
        <p class="text-sm text-gray-600">
          총 금액: <span class="font-semibold text-gray-800">₩${formatPrice(cat.total_amount)}</span>
        </p>
        <p class="text-sm text-gray-600">
          평균 점수: <span class="font-semibold text-gray-800">${cat.avg_score.toFixed(1)}</span>
        </p>
      </div>
    </div>
  `).join('')
}

// 월별 통계 렌더링
function renderMonthlyStats(months) {
  if (months.length === 0) {
    return '<p class="text-gray-500 text-center py-8">아직 데이터가 없습니다</p>'
  }

  return months.map(month => {
    const date = new Date(month.month + '-01')
    const monthName = date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
    
    return `
      <div class="bg-white rounded-lg p-5 shadow-md hover:shadow-lg transition">
        <div class="flex justify-between items-center mb-3">
          <h4 class="font-bold text-lg text-gray-800">${monthName}</h4>
          <span class="text-sm text-gray-500">${month.count}건</span>
        </div>
        
        <div class="grid grid-cols-3 gap-2 mb-3">
          <div class="text-center p-2 bg-green-50 rounded">
            <p class="text-xs text-green-700 font-medium">구매 OK</p>
            <p class="text-lg font-bold text-green-700">${month.purchased}</p>
          </div>
          <div class="text-center p-2 bg-yellow-50 rounded">
            <p class="text-xs text-yellow-700 font-medium">보류</p>
            <p class="text-lg font-bold text-yellow-700">${month.pending}</p>
          </div>
          <div class="text-center p-2 bg-red-50 rounded">
            <p class="text-xs text-red-700 font-medium">비추천</p>
            <p class="text-lg font-bold text-red-700">${month.rejected}</p>
          </div>
        </div>
        
        <div class="border-t pt-3 space-y-1">
          <p class="text-sm text-gray-600">
            총 금액: <span class="font-semibold text-gray-800">₩${formatPrice(month.total_amount)}</span>
          </p>
          <p class="text-sm text-green-600">
            절약 금액: <span class="font-semibold">₩${formatPrice(month.saved_amount)}</span>
          </p>
        </div>
      </div>
    `
  }).join('')
}

// 차트 생성
function createChart(stats) {
  const ctx = document.getElementById('conclusionChart')
  if (!ctx) return

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['구매 OK', '48시간 보류', '구매 비추천'],
      datasets: [{
        data: [
          stats.summary.purchased,
          stats.summary.pending,
          stats.summary.rejected
        ],
        backgroundColor: [
          '#10b981',
          '#f59e0b',
          '#ef4444'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: {
              size: 14,
              family: "'Arial', sans-serif"
            },
            padding: 20
          }
        },
        title: {
          display: true,
          text: '결론 분포',
          font: {
            size: 18,
            weight: 'bold'
          },
          padding: {
            bottom: 20
          }
        }
      }
    }
  })
}

// 통계 페이지 렌더링
function renderStats(stats) {
  const content = `
    <!-- 요약 카드들 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      ${renderStatCard('fa-list-check', '총 판단 횟수', `${stats.summary.total_decisions}건`, '전체', 'purple')}
      ${renderStatCard('fa-check-circle', '구매 완료', `${stats.summary.purchased}건`, '구매 OK', 'green')}
      ${renderStatCard('fa-clock', '보류중', `${stats.summary.pending}건`, '48시간', 'yellow')}
      ${renderStatCard('fa-times-circle', '막은 횟수', `${stats.summary.rejected}건`, '비추천', 'red')}
    </div>

    <!-- 금액 통계 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-lg p-8 border-2 border-purple-200">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-800">
            <i class="fas fa-wallet mr-2 text-purple-600"></i>
            총 고려 금액
          </h3>
        </div>
        <p class="text-4xl font-bold text-purple-600 mb-2">
          ₩${formatPrice(stats.summary.total_amount)}
        </p>
        <p class="text-sm text-gray-600">판단한 모든 물건의 총액</p>
      </div>

      <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-lg p-8 border-2 border-green-200">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-800">
            <i class="fas fa-piggy-bank mr-2 text-green-600"></i>
            절약한 금액
          </h3>
          <i class="fas fa-award text-3xl text-green-600"></i>
        </div>
        <p class="text-4xl font-bold text-green-600 mb-2">
          ₩${formatPrice(stats.summary.saved_amount)}
        </p>
        <p class="text-sm text-gray-600">
          보류 & 비추천으로 막은 금액 
          <span class="font-semibold">(${stats.summary.pending + stats.summary.rejected}건)</span>
        </p>
        <div class="mt-4 p-3 bg-white rounded-lg">
          <p class="text-xs text-gray-500 mb-1">절약률</p>
          <div class="flex items-center">
            <div class="flex-1 bg-gray-200 rounded-full h-3 mr-3">
              <div class="bg-green-600 h-3 rounded-full" style="width: ${stats.summary.total_amount > 0 ? (stats.summary.saved_amount / stats.summary.total_amount * 100).toFixed(1) : 0}%"></div>
            </div>
            <span class="font-bold text-green-600">
              ${stats.summary.total_amount > 0 ? (stats.summary.saved_amount / stats.summary.total_amount * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 차트와 최근 트렌드 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- 결론 분포 차트 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div style="height: 300px;">
          <canvas id="conclusionChart"></canvas>
        </div>
      </div>

      <!-- 최근 트렌드 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">
          <i class="fas fa-trending-up mr-2 text-blue-600"></i>
          최근 활동
        </h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
            <div>
              <p class="text-sm text-gray-600">최근 7일</p>
              <p class="text-2xl font-bold text-blue-600">${stats.recent_trends.last_7_days}건</p>
            </div>
            <i class="fas fa-calendar-week text-3xl text-blue-400"></i>
          </div>
          <div class="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
            <div>
              <p class="text-sm text-gray-600">최근 30일</p>
              <p class="text-2xl font-bold text-purple-600">${stats.recent_trends.last_30_days}건</p>
            </div>
            <i class="fas fa-calendar-alt text-3xl text-purple-400"></i>
          </div>
          <div class="p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
            <p class="text-sm text-gray-700 mb-2">
              <i class="fas fa-lightbulb mr-2 text-yellow-600"></i>
              <strong>Tip:</strong> 꾸준히 판단 기록을 쌓으면 더 정확한 소비 패턴 분석이 가능해요!
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 카테고리별 통계 -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 class="text-xl font-bold text-gray-800 mb-4">
        <i class="fas fa-tags mr-2 text-purple-600"></i>
        카테고리별 분석
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        ${renderCategoryStats(stats.by_category)}
      </div>
    </div>

    <!-- 월별 통계 -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 class="text-xl font-bold text-gray-800 mb-4">
        <i class="fas fa-calendar mr-2 text-blue-600"></i>
        월별 소비 트렌드
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${renderMonthlyStats(stats.by_month)}
      </div>
    </div>

    <!-- 액션 버튼 -->
    <div class="text-center">
      <a href="/" class="inline-flex items-center px-8 py-4 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition">
        <i class="fas fa-home mr-2"></i>
        대시보드로 돌아가기
      </a>
    </div>
  `

  document.getElementById('stats-content').innerHTML = content

  // 차트 생성 (DOM이 업데이트된 후)
  setTimeout(() => createChart(stats), 100)
}

// 통계 로드
async function loadStatistics() {
  try {
    const response = await axios.get('/api/statistics')

    if (response.data.success) {
      renderStats(response.data.data)
    } else {
      throw new Error(response.data.error)
    }
  } catch (error) {
    console.error('Error loading statistics:', error)
    document.getElementById('stats-content').innerHTML = `
      <div class="text-center py-12">
        <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">통계를 불러올 수 없습니다</h2>
        <p class="text-gray-600 mb-6">${error.message || '오류가 발생했습니다'}</p>
        <button onclick="loadStatistics()" class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <i class="fas fa-redo mr-2"></i>
          다시 시도
        </button>
      </div>
    `
  }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
  loadStatistics()
})
