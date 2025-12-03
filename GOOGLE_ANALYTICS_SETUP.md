# Google Analytics 설정 가이드 📊

Google Analytics를 통해 "Should I Buy?" 앱의 사용 통계를 추적할 수 있습니다.

---

## 📋 사전 준비

### 1. Google Analytics 계정 생성

1. **Google Analytics 접속**: https://analytics.google.com/
2. **계정 만들기** 클릭
3. **계정 이름** 입력 (예: "Should I Buy")
4. **속성 만들기**:
   - 속성 이름: "Should I Buy - Production"
   - 시간대: "대한민국"
   - 통화: "대한민국 원 (₩)"
5. **데이터 스트림 생성**:
   - 플랫폼: **웹**
   - 웹사이트 URL: `https://your-app.pages.dev`
   - 스트림 이름: "Should I Buy Web"

### 2. 측정 ID 확인

데이터 스트림 생성 후 **측정 ID**를 확인하세요.
- 형식: `G-XXXXXXXXXX` (GA4)

---

## 🔧 설정 방법

### 방법 1: 수동 설정 (간단)

1. **`public/static/analytics.js` 파일 열기**

2. **3번째 줄의 추적 ID 수정**:
   ```javascript
   // 변경 전:
   const GA_TRACKING_ID = 'YOUR_GA_TRACKING_ID'
   
   // 변경 후:
   const GA_TRACKING_ID = 'G-XXXXXXXXXX'  // 여기에 실제 ID 입력
   ```

3. **Git 커밋 & 배포**:
   ```bash
   cd /home/user/webapp
   git add public/static/analytics.js
   git commit -m "Add Google Analytics tracking ID"
   git push origin main
   npm run deploy
   ```

4. **완료!** 🎉

### 방법 2: 환경 변수 사용 (고급)

프로덕션과 개발 환경을 분리하려면 환경 변수를 사용하세요.

1. **`.dev.vars` 파일 생성** (로컬 개발용):
   ```
   GA_TRACKING_ID=G-DEVELOPMENT-ID
   ```

2. **Cloudflare Pages 환경 변수 설정** (프로덕션용):
   ```bash
   npx wrangler pages secret put GA_TRACKING_ID --project-name should-i-buy
   # 프롬프트에서 G-PRODUCTION-ID 입력
   ```

---

## 📊 추적되는 이벤트

앱에서 자동으로 추적되는 이벤트들:

### 1. 페이지 뷰 (Page Views)
- `/` - 메인 대시보드
- `/new` - 새 소비 판단 페이지
- `/result/:id` - 결과 페이지
- `/stats` - 통계 페이지

### 2. 커스텀 이벤트

#### `purchase_decision` - 소비 판단 생성
```javascript
{
  item_name: "맥북 프로 M3",
  value: 2500000,
  category: "업무",
  conclusion: "구매 OK"
}
```

#### `share` - 소셜 공유
```javascript
{
  method: "twitter",  // 또는 "facebook", "kakao", "link"
  content_type: "purchase_decision"
}
```

#### `view_statistics` - 통계 페이지 방문

---

## 🎯 커스텀 이벤트 추가하기

새로운 이벤트를 추적하고 싶다면:

```javascript
// analytics.js의 trackEvent 함수 사용
trackEvent('custom_event_name', {
  param1: 'value1',
  param2: 'value2'
})
```

예시:
```javascript
// 삭제 버튼 클릭 추적
trackEvent('delete_decision', {
  decision_id: 123,
  item_name: '맥북 프로 M3'
})
```

---

## 📈 Google Analytics 대시보드 확인

### 실시간 데이터 확인

1. Google Analytics 대시보드 접속
2. 왼쪽 메뉴에서 **보고서 → 실시간** 클릭
3. 현재 접속자, 페이지 뷰, 이벤트 확인

### 주요 지표 확인

1. **사용자 수**: 앱을 방문한 총 사용자
2. **페이지 뷰**: 각 페이지별 조회수
3. **이벤트 수**: 소비 판단 생성, 공유 등
4. **세션 지속 시간**: 평균 사용 시간
5. **이탈률**: 사용자 이탈 비율

---

## 🔍 유용한 맞춤 보고서

### 1. 소비 판단 분석
- **이벤트 이름**: `purchase_decision`
- **측정기준**: `conclusion` (결론)
- **측정항목**: 이벤트 수, 총 가치

### 2. 카테고리별 분석
- **이벤트 이름**: `purchase_decision`
- **측정기준**: `category`
- **측정항목**: 이벤트 수

### 3. 소셜 공유 분석
- **이벤트 이름**: `share`
- **측정기준**: `method`
- **측정항목**: 이벤트 수

---

## ⚙️ 고급 설정

### 맞춤 측정기준 추가

Google Analytics 대시보드에서:
1. **관리 → 데이터 표시 → 맞춤 정의 → 맞춤 측정기준**
2. 다음 측정기준 추가:
   - `item_name` (항목 이름)
   - `category` (카테고리)
   - `conclusion` (결론)
   - `share_method` (공유 방법)

### 전환 이벤트 설정

중요한 행동을 전환으로 표시:
1. **관리 → 데이터 표시 → 이벤트**
2. `purchase_decision` 이벤트를 **전환으로 표시**
3. 목표 달성 추적 가능

---

## 🛡️ 개인정보 보호

### GDPR 준수

사용자의 개인정보를 보호하기 위해:
1. **IP 익명화 활성화**
2. **데이터 보존 기간 설정**
3. **개인정보 처리방침 업데이트**

### 쿠키 동의 배너 (선택사항)

법적 요구사항에 따라 쿠키 동의 배너를 추가할 수 있습니다.

추천 라이브러리:
- Cookie Consent by Osano
- GDPR Cookie Consent

---

## 📱 모바일 앱 추적 (향후)

React Native 앱을 만들 경우:
- Firebase Analytics 사용
- GA4와 자동 연동

---

## 🆘 문제 해결

### 데이터가 표시되지 않는 경우

1. **측정 ID 확인**: `analytics.js` 파일의 ID가 정확한지 확인
2. **브라우저 콘솔 확인**: 
   ```javascript
   console.log('GA 초기화:', window.gtag)
   ```
3. **광고 차단기 확인**: 광고 차단 플러그인이 GA를 차단할 수 있음
4. **실시간 보고서 확인**: 데이터가 즉시 표시되는지 확인

### 이벤트가 추적되지 않는 경우

1. **네트워크 탭 확인**: `www.google-analytics.com`으로 요청 전송 확인
2. **이벤트 매개변수 확인**: 올바른 형식인지 확인
3. **gtag 함수 확인**: 
   ```javascript
   console.log('gtag 사용 가능:', typeof window.gtag === 'function')
   ```

---

## 📚 추가 자료

- **Google Analytics 4 문서**: https://support.google.com/analytics/answer/9304153
- **GA4 이벤트 참조**: https://developers.google.com/analytics/devguides/collection/ga4/events
- **gtag.js 참조**: https://developers.google.com/tag-platform/gtagjs

---

## ✅ 체크리스트

설정 완료 후 확인:
- [ ] Google Analytics 계정 생성
- [ ] 측정 ID 발급
- [ ] `analytics.js`에 ID 입력
- [ ] 코드 배포 완료
- [ ] 실시간 보고서에서 데이터 확인
- [ ] 이벤트 추적 테스트
- [ ] 맞춤 보고서 설정 (선택사항)

---

**축하합니다! Google Analytics 설정이 완료되었습니다!** 🎉

이제 사용자 행동을 분석하고 앱을 개선할 수 있습니다.
