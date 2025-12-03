-- 샘플 데이터: 테스트용 소비 판단 기록들
-- Sample Purchase Decisions for Testing

-- 1. 구매 OK 예시: 업무용 노트북
INSERT INTO purchase_decisions (
  item_name, price, category,
  q1_necessity, q2_has_similar, q3_future_use, q4_budget_burden,
  q5_emotional_state, q6_purchase_trigger, q7_can_wait, q8_maintenance_cost,
  necessity_score, regret_risk, budget_burden, duplicate_cost, total_score,
  conclusion, comments
) VALUES (
  '맥북 프로 M3', 2500000, '업무',
  5, '아니오', 5, 2,
  '평온', '실제 필요', '아니오', '아니오',
  17.5, 0, 4, 0, 13.5,
  '구매 OK',
  '실제 업무에 필요하고, 현재 감정 상태도 안정적입니다. 비슷한 기능의 물건도 없어서 합리적인 구매입니다.'
);

-- 2. 48시간 보류 예시: 스트레스로 인한 명품 가방 구매
INSERT INTO purchase_decisions (
  item_name, price, category,
  q1_necessity, q2_has_similar, q3_future_use, q4_budget_burden,
  q5_emotional_state, q6_purchase_trigger, q7_can_wait, q8_maintenance_cost,
  necessity_score, regret_risk, budget_burden, duplicate_cost, total_score,
  conclusion, comments
) VALUES (
  '구찌 숄더백', 3200000, '기타',
  2, '예', 3, 5,
  '스트레스', '광고·SNS 보고', '예', '아니오',
  8.5, 5, 10, 3, -9.5,
  '48시간 보류',
  '현재 스트레스 상태가 구매 욕구에 영향을 주고 있습니다. 비슷한 가방을 이미 가지고 있으며, 예산 부담도 큽니다. 48시간 후 다시 생각해보세요.'
);

-- 3. 구매 비추천 예시: 충동 구매 게임 콘솔
INSERT INTO purchase_decisions (
  item_name, price, category,
  q1_necessity, q2_has_similar, q3_future_use, q4_budget_burden,
  q5_emotional_state, q6_purchase_trigger, q7_can_wait, q8_maintenance_cost,
  necessity_score, regret_risk, budget_burden, duplicate_cost, total_score,
  conclusion, comments
) VALUES (
  'PlayStation 5', 650000, '취미',
  1, '예', 2, 4,
  '텐션 업', '그냥 눈에 띄어서', '예', '예',
  5.0, 6, 8, 5, -14.0,
  '구매 비추천',
  '감정이 고조된 상태에서 충동적으로 구매하려는 경향이 있습니다. 이미 비슷한 게임기를 가지고 있고, 추가 게임 구입비와 구독료가 발생합니다. 후회할 가능성이 높습니다.'
);

-- 4. 구매 OK 예시: 필수 생활용품
INSERT INTO purchase_decisions (
  item_name, price, category,
  q1_necessity, q2_has_similar, q3_future_use, q4_budget_burden,
  q5_emotional_state, q6_purchase_trigger, q7_can_wait, q8_maintenance_cost,
  necessity_score, regret_risk, budget_burden, duplicate_cost, total_score,
  conclusion, comments
) VALUES (
  '다이슨 무선청소기', 750000, '필수',
  5, '아니오', 5, 2,
  '평온', '지인 추천', '아니오', '아니오',
  17.5, 1, 4, 0, 12.5,
  '구매 OK',
  '실제 생활에 필요하고, 지인의 추천을 받아 신뢰할 수 있습니다. 비슷한 제품이 없고 장기적으로 사용할 수 있어 합리적인 선택입니다.'
);

-- 5. 48시간 보류 예시: 취미 활동 장비
INSERT INTO purchase_decisions (
  item_name, price, category,
  q1_necessity, q2_has_similar, q3_future_use, q4_budget_burden,
  q5_emotional_state, q6_purchase_trigger, q7_can_wait, q8_maintenance_cost,
  necessity_score, regret_risk, budget_burden, duplicate_cost, total_score,
  conclusion, comments
) VALUES (
  '폴댄스 홈 연습용 봉', 450000, '취미',
  3, '아니오', 4, 3,
  '평온', '실제 필요', '예', '아니오',
  12.0, 2, 6, 0, 4.0,
  '48시간 보류',
  '취미 활동에 도움이 될 수 있지만, 1-2주 기다려도 상관없는 상황입니다. 조금 더 신중하게 고민해보시는 것을 추천합니다.'
);
