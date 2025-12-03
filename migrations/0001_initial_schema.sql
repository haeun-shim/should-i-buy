-- Purchase Decisions Table
-- 소비 판단 기록 테이블
CREATE TABLE IF NOT EXISTS purchase_decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- 기본 정보
  item_name TEXT NOT NULL,
  price REAL NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('필수', '업무', '취미', '기타')),
  
  -- 질문 답변들 (Q1~Q8)
  q1_necessity INTEGER NOT NULL CHECK(q1_necessity >= 0 AND q1_necessity <= 5), -- 없으면 불편함 정도
  q2_has_similar TEXT NOT NULL CHECK(q2_has_similar IN ('예', '아니오')), -- 비슷한 물건 보유
  q3_future_use INTEGER NOT NULL CHECK(q3_future_use >= 0 AND q3_future_use <= 5), -- 3개월 후 사용 빈도
  q4_budget_burden INTEGER NOT NULL CHECK(q4_budget_burden >= 0 AND q4_budget_burden <= 5), -- 예산 부담
  q5_emotional_state TEXT NOT NULL CHECK(q5_emotional_state IN ('평온', '스트레스', '우울', '텐션 업')), -- 감정 상태
  q6_purchase_trigger TEXT NOT NULL CHECK(q6_purchase_trigger IN ('실제 필요', '지인 추천', '광고·SNS 보고', '그냥 눈에 띄어서')), -- 구매 계기
  q7_can_wait TEXT NOT NULL CHECK(q7_can_wait IN ('예', '아니오')), -- 1-2주 후 구매 가능 여부
  q8_maintenance_cost TEXT NOT NULL CHECK(q8_maintenance_cost IN ('예', '아니오', '잘 모르겠음')), -- 추가 유지비
  
  -- 계산된 점수들
  necessity_score REAL NOT NULL, -- 필요성 점수 (N)
  regret_risk REAL NOT NULL, -- 후회 위험 (R)
  budget_burden REAL NOT NULL, -- 예산 부담 (B)
  duplicate_cost REAL NOT NULL, -- 중복/유지비 (D)
  total_score REAL NOT NULL, -- 총점 (T)
  
  -- 결론
  conclusion TEXT NOT NULL CHECK(conclusion IN ('구매 OK', '48시간 보류', '구매 비추천')),
  comments TEXT, -- AI 코멘트
  
  -- 타임스탬프
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 날짜 기반 검색을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_created_at ON purchase_decisions(created_at DESC);

-- 결론별 검색을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_conclusion ON purchase_decisions(conclusion);

-- 카테고리별 검색을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_category ON purchase_decisions(category);
