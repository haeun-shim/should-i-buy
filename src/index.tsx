import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import type { Bindings, NewPurchaseRequest, PurchaseDecision, ApiResponse } from './types'
import { calculatePurchaseScore } from './utils/scoreCalculator'

const app = new Hono<{ Bindings: Bindings }>()

// CORS 설정
app.use('/api/*', cors())

// 정적 파일 제공
app.use('/static/*', serveStatic({ root: './public' }))

// =====================
// API Routes
// =====================

/**
 * GET /api/decisions
 * 모든 소비 판단 기록 조회
 */
app.get('/api/decisions', async (c) => {
  try {
    const { env } = c
    const result = await env.DB.prepare(`
      SELECT * FROM purchase_decisions 
      ORDER BY created_at DESC
    `).all()

    const response: ApiResponse<PurchaseDecision[]> = {
      success: true,
      data: result.results as PurchaseDecision[]
    }

    return c.json(response)
  } catch (error) {
    console.error('Error fetching decisions:', error)
    const response: ApiResponse<null> = {
      success: false,
      error: '데이터를 불러오는데 실패했습니다.'
    }
    return c.json(response, 500)
  }
})

/**
 * GET /api/decisions/:id
 * 특정 소비 판단 기록 상세 조회
 */
app.get('/api/decisions/:id', async (c) => {
  try {
    const { env } = c
    const id = c.req.param('id')

    const result = await env.DB.prepare(`
      SELECT * FROM purchase_decisions 
      WHERE id = ?
    `).bind(id).first()

    if (!result) {
      const response: ApiResponse<null> = {
        success: false,
        error: '해당 기록을 찾을 수 없습니다.'
      }
      return c.json(response, 404)
    }

    const response: ApiResponse<PurchaseDecision> = {
      success: true,
      data: result as PurchaseDecision
    }

    return c.json(response)
  } catch (error) {
    console.error('Error fetching decision:', error)
    const response: ApiResponse<null> = {
      success: false,
      error: '데이터를 불러오는데 실패했습니다.'
    }
    return c.json(response, 500)
  }
})

/**
 * POST /api/decisions
 * 새로운 소비 판단 생성
 */
app.post('/api/decisions', async (c) => {
  try {
    const { env } = c
    const body: NewPurchaseRequest = await c.req.json()

    // 입력 검증
    if (!body.item_name || !body.price || !body.category) {
      const response: ApiResponse<null> = {
        success: false,
        error: '필수 정보가 누락되었습니다.'
      }
      return c.json(response, 400)
    }

    // 점수 계산
    const scores = calculatePurchaseScore(body)
    const commentsString = scores.comments.join(' ')

    // 데이터베이스에 저장
    const result = await env.DB.prepare(`
      INSERT INTO purchase_decisions (
        item_name, price, category,
        q1_necessity, q2_has_similar, q3_future_use, q4_budget_burden,
        q5_emotional_state, q6_purchase_trigger, q7_can_wait, q8_maintenance_cost,
        necessity_score, regret_risk, budget_burden, duplicate_cost, total_score,
        conclusion, comments
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.item_name,
      body.price,
      body.category,
      body.q1_necessity,
      body.q2_has_similar,
      body.q3_future_use,
      body.q4_budget_burden,
      body.q5_emotional_state,
      body.q6_purchase_trigger,
      body.q7_can_wait,
      body.q8_maintenance_cost,
      scores.necessity_score,
      scores.regret_risk,
      scores.budget_burden,
      scores.duplicate_cost,
      scores.total_score,
      scores.conclusion,
      commentsString
    ).run()

    // 생성된 기록 조회
    const newDecision = await env.DB.prepare(`
      SELECT * FROM purchase_decisions 
      WHERE id = ?
    `).bind(result.meta.last_row_id).first()

    const response: ApiResponse<PurchaseDecision> = {
      success: true,
      data: newDecision as PurchaseDecision
    }

    return c.json(response)
  } catch (error) {
    console.error('Error creating decision:', error)
    const response: ApiResponse<null> = {
      success: false,
      error: '소비 판단을 생성하는데 실패했습니다.'
    }
    return c.json(response, 500)
  }
})

/**
 * DELETE /api/decisions/:id
 * 소비 판단 기록 삭제
 */
app.delete('/api/decisions/:id', async (c) => {
  try {
    const { env } = c
    const id = c.req.param('id')

    await env.DB.prepare(`
      DELETE FROM purchase_decisions 
      WHERE id = ?
    `).bind(id).run()

    const response: ApiResponse<null> = {
      success: true
    }

    return c.json(response)
  } catch (error) {
    console.error('Error deleting decision:', error)
    const response: ApiResponse<null> = {
      success: false,
      error: '삭제에 실패했습니다.'
    }
    return c.json(response, 500)
  }
})

/**
 * GET /api/statistics
 * 통계 데이터 조회
 */
app.get('/api/statistics', async (c) => {
  try {
    const { env } = c

    // 1. 전체 요약 통계
    const summary = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_decisions,
        SUM(CASE WHEN conclusion = '구매 OK' THEN 1 ELSE 0 END) as purchased,
        SUM(CASE WHEN conclusion = '48시간 보류' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN conclusion = '구매 비추천' THEN 1 ELSE 0 END) as rejected,
        SUM(price) as total_amount,
        SUM(CASE WHEN conclusion != '구매 OK' THEN price ELSE 0 END) as saved_amount
      FROM purchase_decisions
    `).first()

    // 2. 카테고리별 통계
    const byCategory = await env.DB.prepare(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(price) as total_amount,
        AVG(total_score) as avg_score
      FROM purchase_decisions
      GROUP BY category
      ORDER BY count DESC
    `).all()

    // 3. 월별 통계
    const byMonth = await env.DB.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as count,
        SUM(CASE WHEN conclusion = '구매 OK' THEN 1 ELSE 0 END) as purchased,
        SUM(CASE WHEN conclusion = '48시간 보류' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN conclusion = '구매 비추천' THEN 1 ELSE 0 END) as rejected,
        SUM(price) as total_amount,
        SUM(CASE WHEN conclusion != '구매 OK' THEN price ELSE 0 END) as saved_amount
      FROM purchase_decisions
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
      LIMIT 12
    `).all()

    // 4. 최근 트렌드
    const last7Days = await env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM purchase_decisions
      WHERE created_at >= datetime('now', '-7 days')
    `).first()

    const last30Days = await env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM purchase_decisions
      WHERE created_at >= datetime('now', '-30 days')
    `).first()

    const statistics = {
      summary: summary || {
        total_decisions: 0,
        purchased: 0,
        pending: 0,
        rejected: 0,
        total_amount: 0,
        saved_amount: 0
      },
      by_category: byCategory.results || [],
      by_month: byMonth.results || [],
      recent_trends: {
        last_7_days: last7Days?.count || 0,
        last_30_days: last30Days?.count || 0,
        avg_decision_time: 0
      }
    }

    const response: ApiResponse<typeof statistics> = {
      success: true,
      data: statistics
    }

    return c.json(response)
  } catch (error) {
    console.error('Error fetching statistics:', error)
    const response: ApiResponse<null> = {
      success: false,
      error: '통계 데이터를 불러오는데 실패했습니다.'
    }
    return c.json(response, 500)
  }
})

// =====================
// Frontend Routes (HTML)
// =====================

/**
 * GET /
 * 메인 대시보드
 */
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Should I Buy? - 살까말까 판단기</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/style.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
        <div id="app" class="container mx-auto px-4 py-8">
            <!-- 헤더 -->
            <header class="text-center mb-8">
                <h1 class="text-4xl font-bold text-gray-800 mb-2">
                    <i class="fas fa-shopping-cart mr-2 text-purple-600"></i>
                    Should I Buy?
                </h1>
                <p class="text-gray-600">10초 안에 결론 내주는 소비 판단기</p>
            </header>

            <!-- 버튼들 -->
            <div class="text-center mb-8 flex gap-4 justify-center flex-wrap">
                <a href="/new" class="inline-flex items-center px-8 py-4 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transform hover:scale-105 transition duration-200">
                    <i class="fas fa-plus-circle mr-2"></i>
                    새 소비 판단하기
                </a>
                <a href="/stats" class="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transform hover:scale-105 transition duration-200">
                    <i class="fas fa-chart-bar mr-2"></i>
                    통계 보기
                </a>
            </div>

            <!-- 최근 판단 내역 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-history mr-2 text-blue-600"></i>
                    최근 판단 내역
                </h2>
                <div id="decisions-list" class="space-y-4">
                    <div class="text-center py-8">
                        <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-2"></i>
                        <p class="text-gray-500">불러오는 중...</p>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/dashboard.js"></script>
    </body>
    </html>
  `)
})

/**
 * GET /new
 * 새 소비 판단 페이지
 */
app.get('/new', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>새 소비 판단 - Should I Buy?</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/style.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
        <div class="container mx-auto px-4 py-8 max-w-3xl">
            <!-- 헤더 -->
            <header class="text-center mb-8">
                <a href="/" class="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4">
                    <i class="fas fa-arrow-left mr-2"></i>
                    돌아가기
                </a>
                <h1 class="text-3xl font-bold text-gray-800 mb-2">
                    <i class="fas fa-clipboard-check mr-2 text-purple-600"></i>
                    새 소비 판단
                </h1>
                <p class="text-gray-600">8가지 질문에 답하면 10초 안에 결론을 알려드려요</p>
            </header>

            <!-- 폼 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <form id="purchase-form">
                    <!-- 기본 정보 섹션 -->
                    <div class="mb-8">
                        <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <span class="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">1</span>
                            기본 정보
                        </h2>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-gray-700 font-medium mb-2">항목 이름 *</label>
                                <input type="text" id="item_name" required 
                                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                       placeholder="예: 맥북 프로 M3">
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 font-medium mb-2">가격 (원) *</label>
                                <input type="number" id="price" required min="0" 
                                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                       placeholder="예: 2500000">
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 font-medium mb-2">카테고리 *</label>
                                <select id="category" required 
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                                    <option value="">선택하세요</option>
                                    <option value="필수">필수</option>
                                    <option value="업무">업무</option>
                                    <option value="취미">취미</option>
                                    <option value="기타">기타</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- 질문 섹션 -->
                    <div class="mb-8">
                        <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <span class="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">2</span>
                            질문 (Q1~Q8)
                        </h2>
                        
                        <div id="questions" class="space-y-6"></div>
                    </div>

                    <!-- 제출 버튼 -->
                    <div class="text-center">
                        <button type="submit" 
                                class="px-8 py-4 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transform hover:scale-105 transition duration-200 font-bold text-lg">
                            <i class="fas fa-calculator mr-2"></i>
                            판단하기
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/new-decision.js"></script>
    </body>
    </html>
  `)
})

/**
 * GET /result/:id
 * 결과 페이지
 */
app.get('/result/:id', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>판단 결과 - Should I Buy?</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/style.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
        <div class="container mx-auto px-4 py-8 max-w-3xl">
            <div id="result-content">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-2"></i>
                    <p class="text-gray-500">결과를 불러오는 중...</p>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/result.js"></script>
    </body>
    </html>
  `)
})

/**
 * GET /stats
 * 통계 페이지
 */
app.get('/stats', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>통계 - Should I Buy?</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/style.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </head>
    <body class="bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
        <div class="container mx-auto px-4 py-8">
            <!-- 헤더 -->
            <header class="text-center mb-8">
                <a href="/" class="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4">
                    <i class="fas fa-arrow-left mr-2"></i>
                    대시보드로 돌아가기
                </a>
                <h1 class="text-4xl font-bold text-gray-800 mb-2">
                    <i class="fas fa-chart-bar mr-2 text-blue-600"></i>
                    소비 통계
                </h1>
                <p class="text-gray-600">당신의 소비 패턴을 한눈에 확인하세요</p>
            </header>

            <div id="stats-content">
                <div class="text-center py-12">
                    <i class="fas fa-spinner fa-spin text-5xl text-gray-400 mb-4"></i>
                    <p class="text-gray-500 text-lg">통계를 불러오는 중...</p>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/stats.js"></script>
    </body>
    </html>
  `)
})

export default app
