// Cloudflare Bindings
export type Bindings = {
  DB: D1Database;
}

// 질문 답변 인터페이스
export interface PurchaseQuestions {
  q1_necessity: number; // 0-5: 없으면 불편함 정도
  q2_has_similar: '예' | '아니오'; // 비슷한 물건 보유
  q3_future_use: number; // 0-5: 3개월 후 사용 빈도
  q4_budget_burden: number; // 0-5: 예산 부담
  q5_emotional_state: '평온' | '스트레스' | '우울' | '텐션 업'; // 감정 상태
  q6_purchase_trigger: '실제 필요' | '지인 추천' | '광고·SNS 보고' | '그냥 눈에 띄어서'; // 구매 계기
  q7_can_wait: '예' | '아니오'; // 1-2주 후 구매 가능 여부
  q8_maintenance_cost: '예' | '아니오' | '잘 모르겠음'; // 추가 유지비
}

// 새 소비 판단 요청 인터페이스
export interface NewPurchaseRequest extends PurchaseQuestions {
  item_name: string;
  price: number;
  category: '필수' | '업무' | '취미' | '기타';
}

// 점수 계산 결과
export interface ScoreResult {
  necessity_score: number; // 필요성 점수 (N)
  regret_risk: number; // 후회 위험 (R)
  budget_burden: number; // 예산 부담 (B)
  duplicate_cost: number; // 중복/유지비 (D)
  total_score: number; // 총점 (T)
  conclusion: '구매 OK' | '48시간 보류' | '구매 비추천';
  comments: string[];
}

// 소비 판단 기록
export interface PurchaseDecision extends NewPurchaseRequest, ScoreResult {
  id: number;
  created_at: string;
  updated_at: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 통계 데이터 타입
export interface Statistics {
  summary: {
    total_decisions: number;
    purchased: number; // 구매 OK
    pending: number; // 48시간 보류
    rejected: number; // 구매 비추천
    total_amount: number; // 전체 금액
    saved_amount: number; // 절약한 금액
  };
  by_category: {
    category: string;
    count: number;
    total_amount: number;
    avg_score: number;
  }[];
  by_month: {
    month: string;
    count: number;
    purchased: number;
    pending: number;
    rejected: number;
    total_amount: number;
    saved_amount: number;
  }[];
  recent_trends: {
    last_7_days: number;
    last_30_days: number;
    avg_decision_time: number; // 평균 판단 소요 시간 (초)
  };
}
