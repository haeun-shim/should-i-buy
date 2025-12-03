import type { NewPurchaseRequest, ScoreResult } from '../types'

/**
 * 소비 판단 점수 계산 엔진
 * 
 * 알고리즘:
 * - 필요성 점수 (N) = Q1 * 2 + Q3 * 1.5 + (Q2=="아니오" ? 3 : 0)
 * - 후회 위험 (R) = 감정상태 가중치 + 구매계기 가중치 + (Q7=="아니오" ? -2 : 2)
 * - 예산 부담 (B) = Q4 * 2
 * - 중복/유지비 (D) = (Q2=="예" ? 3 : 0) + (Q8=="예" ? 2 : "잘 모르겠음" ? 1 : 0)
 * - 총점 (T) = N - R - B - D
 * 
 * 결론:
 * - T >= 5 → ✅ 구매 OK
 * - 0 <= T < 5 → ⏳ 48시간 보류
 * - T < 0 → ❌ 구매 비추천
 */

// 감정 상태 가중치
const EMOTIONAL_WEIGHTS = {
  '평온': 0,
  '스트레스': 3,
  '우울': 4,
  '텐션 업': 3
}

// 구매 계기 가중치
const TRIGGER_WEIGHTS = {
  '실제 필요': 0,
  '지인 추천': 1,
  '광고·SNS 보고': 3,
  '그냥 눈에 띄어서': 4
}

export function calculatePurchaseScore(request: NewPurchaseRequest): ScoreResult {
  const comments: string[] = []

  // 1. 필요성 점수 계산 (N)
  const hasSimilarBonus = request.q2_has_similar === '아니오' ? 3 : 0
  const necessity_score = request.q1_necessity * 2 + request.q3_future_use * 1.5 + hasSimilarBonus

  if (request.q1_necessity >= 4) {
    comments.push('이 물건이 없으면 일상에 상당한 불편을 느낄 것 같습니다.')
  }
  if (request.q3_future_use >= 4) {
    comments.push('장기적으로 자주 사용할 것으로 예상됩니다.')
  }

  // 2. 후회 위험 계산 (R)
  const emotionalWeight = EMOTIONAL_WEIGHTS[request.q5_emotional_state]
  const triggerWeight = TRIGGER_WEIGHTS[request.q6_purchase_trigger]
  const waitPenalty = request.q7_can_wait === '아니오' ? -2 : 2
  const regret_risk = emotionalWeight + triggerWeight + waitPenalty

  if (emotionalWeight >= 3) {
    comments.push(`현재 감정 상태(${request.q5_emotional_state})가 소비 욕구를 높이고 있습니다.`)
  }
  if (triggerWeight >= 3) {
    comments.push('충동적인 구매 동기가 있어 보입니다.')
  }
  if (request.q7_can_wait === '예') {
    comments.push('조금 더 시간을 두고 신중하게 고민해볼 여유가 있습니다.')
  }

  // 3. 예산 부담 계산 (B)
  const budget_burden = request.q4_budget_burden * 2

  if (request.q4_budget_burden >= 4) {
    comments.push('이번 달 예산 대비 상당한 부담이 됩니다.')
  }

  // 4. 중복/유지비 계산 (D)
  const hasSimilarPenalty = request.q2_has_similar === '예' ? 3 : 0
  const maintenancePenalty = 
    request.q8_maintenance_cost === '예' ? 2 : 
    request.q8_maintenance_cost === '잘 모르겠음' ? 1 : 0
  const duplicate_cost = hasSimilarPenalty + maintenancePenalty

  if (request.q2_has_similar === '예') {
    comments.push('비슷한 기능의 물건을 이미 가지고 있습니다.')
  }
  if (request.q8_maintenance_cost === '예') {
    comments.push('추가 유지비나 구독료가 발생할 수 있습니다.')
  } else if (request.q8_maintenance_cost === '잘 모르겠음') {
    comments.push('추가 비용이 발생할 가능성을 확인해보세요.')
  }

  // 5. 총점 계산 (T)
  const total_score = necessity_score - regret_risk - budget_burden - duplicate_cost

  // 6. 결론 도출
  let conclusion: '구매 OK' | '48시간 보류' | '구매 비추천'
  
  if (total_score >= 5) {
    conclusion = '구매 OK'
    comments.unshift('합리적인 소비로 판단됩니다.')
  } else if (total_score >= 0) {
    conclusion = '48시간 보류'
    comments.unshift('48시간 후 다시 생각해보시는 것을 추천합니다.')
  } else {
    conclusion = '구매 비추천'
    comments.unshift('후회할 가능성이 높습니다.')
  }

  return {
    necessity_score: Math.round(necessity_score * 10) / 10,
    regret_risk: Math.round(regret_risk * 10) / 10,
    budget_burden: Math.round(budget_burden * 10) / 10,
    duplicate_cost: Math.round(duplicate_cost * 10) / 10,
    total_score: Math.round(total_score * 10) / 10,
    conclusion,
    comments
  }
}
