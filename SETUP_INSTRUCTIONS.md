# 하은님을 위한 배포 가이드 🚀

안녕하세요 하은님! 이 문서는 "Should I Buy?" 앱을 GitHub과 Cloudflare Pages에 배포하는 **초보자 친화적인 가이드**입니다.

---

## 📋 전체 흐름 미리보기

```
1. GitHub 연동 (5분) → 코드 저장소 생성
2. Cloudflare 설정 (10분) → 호스팅 준비
3. D1 데이터베이스 생성 (5분) → 데이터 저장소
4. 배포 실행 (2분) → 앱 공개
5. 테스트 (3분) → 정상 작동 확인
```

**총 소요 시간: 약 25분** ⏰

---

## ✅ 1단계: GitHub 저장소 생성 (5분)

### 왜 필요한가요?
- 코드를 안전하게 백업
- 버전 관리 (언제든 이전 버전으로 되돌릴 수 있음)
- 다른 기기에서도 접근 가능

### 설정 방법

#### 방법 A: Code Sandbox에서 자동 연동 (권장 ⭐)

1. **Code Sandbox 화면 상단의 `#github` 탭 클릭**
2. **"Connect GitHub" 또는 "GitHub 연동" 버튼 클릭**
3. **GitHub 계정으로 로그인**
4. **권한 승인**:
   - "GenSpark"가 GitHub에 접근하도록 허용
   - Public/Private 저장소 읽기/쓰기 권한
5. **완료!** ✅

이제 다시 채팅창으로 돌아와서 "GitHub 연동 완료했어"라고 말씀해주세요!

#### 방법 B: 터미널에서 직접 (고급 사용자)

```bash
# GitHub CLI로 저장소 생성 및 푸시
gh repo create should-i-buy --public --source=. --remote=origin --push
```

---

## ☁️ 2단계: Cloudflare 설정 (10분)

### 왜 Cloudflare인가요?
- **완전 무료** (트래픽 제한 거의 없음)
- **빠른 속도** (전 세계 300+ 데이터센터)
- **간편한 배포** (Git 푸시만으로 자동 배포)
- **서버리스** (서버 관리 불필요)

### 설정 방법

#### 2-1. Cloudflare 계정 만들기

1. **https://dash.cloudflare.com/sign-up** 접속
2. **이메일 주소와 비밀번호로 가입**
3. **이메일 인증 완료**

#### 2-2. API Token 생성

1. **Cloudflare 대시보드 로그인**
2. **오른쪽 위 프로필 아이콘 클릭 → "API Tokens"**
3. **"Create Token" 버튼 클릭**
4. **"Edit Cloudflare Workers" 템플릿 선택**
5. **"Continue to summary" → "Create Token"**
6. **생성된 토큰 복사** (⚠️ 다시 볼 수 없으니 안전한 곳에 저장!)

#### 2-3. Code Sandbox에 토큰 입력

1. **Code Sandbox 화면 상단의 `Deploy` 탭 클릭**
2. **"Cloudflare API Token" 입력란에 붙여넣기**
3. **"Save" 또는 "저장" 클릭**
4. **완료!** ✅

이제 다시 채팅창으로 돌아와서 "Cloudflare 설정 완료했어"라고 말씀해주세요!

---

## 🗄️ 3단계: D1 데이터베이스 생성 (5분)

데이터베이스는 소비 판단 기록을 저장하는 곳입니다.

### 자동 실행 (권장)

채팅창에서 제가 다음 명령어를 실행해드리겠습니다:

```bash
npx wrangler d1 create webapp-production
```

### 또는 직접 실행

터미널에서:

```bash
cd /home/user/webapp
npx wrangler d1 create webapp-production
```

출력에서 `database_id`를 복사하고, 제가 `wrangler.jsonc` 파일을 업데이트해드리겠습니다.

---

## 🚀 4단계: 배포 실행 (2분)

모든 설정이 완료되었다면, 이제 배포만 하면 됩니다!

### 방법 A: 자동 배포 스크립트 (권장 ⭐)

터미널에서:

```bash
cd /home/user/webapp
./deploy.sh
```

스크립트가 다음을 자동으로 처리합니다:
1. Git 커밋
2. GitHub 푸시
3. 프로젝트 빌드
4. Cloudflare Pages 배포

### 방법 B: 수동 배포

```bash
# 1. 빌드
npm run build

# 2. 배포
npx wrangler pages deploy dist --project-name should-i-buy
```

배포가 완료되면 다음과 같은 URL을 받게 됩니다:

```
✅ Success! Uploaded 0 files (5 already uploaded) (0.89 sec)

✨  Deployment complete! Take a peek over at
   https://should-i-buy.pages.dev
```

---

## 🎯 5단계: 테스트 (3분)

### 5-1. 웹사이트 접속

브라우저에서 `https://should-i-buy.pages.dev` 접속

예상 화면:
- 보라색 그라데이션 배경
- "Should I Buy?" 제목
- "새 소비 판단하기" 버튼
- 최근 판단 내역 (샘플 데이터 5개)

### 5-2. API 테스트

터미널에서:

```bash
curl https://should-i-buy.pages.dev/api/decisions
```

JSON 응답이 나오면 성공! ✅

### 5-3. 새 판단 만들어보기

1. "새 소비 판단하기" 버튼 클릭
2. 물건 정보 입력 (예: "에어팟 프로", 300000원, "기타")
3. 8가지 질문에 답변
4. "판단하기" 클릭
5. 결과 페이지 확인!

---

## 🎉 배포 완료 체크리스트

- [ ] GitHub 저장소 생성 완료
- [ ] Cloudflare 계정 생성 및 API Token 설정 완료
- [ ] D1 데이터베이스 생성 완료
- [ ] wrangler.jsonc 파일에 database_id 입력 완료
- [ ] 배포 성공 (URL 받음)
- [ ] 웹사이트 접속 가능
- [ ] API 정상 응답
- [ ] 새 판단 생성 테스트 성공

---

## 🆘 문제 해결

### 문제 1: "Authentication required" 오류

**원인**: Cloudflare 로그인이 필요합니다.

**해결**:
```bash
npx wrangler login
```
브라우저가 열리면 Cloudflare 계정으로 로그인하세요.

### 문제 2: "Project not found" 오류

**원인**: Cloudflare Pages 프로젝트가 없습니다.

**해결**:
```bash
npx wrangler pages project create should-i-buy
```

### 문제 3: 웹사이트는 열리는데 API가 작동하지 않음

**원인**: D1 데이터베이스 마이그레이션이 안 됐을 수 있습니다.

**해결**:
```bash
npm run db:migrate:prod
```

### 문제 4: GitHub 푸시 실패

**원인**: GitHub 인증이 안 됐거나 원격 저장소가 없습니다.

**해결**:
```bash
# GitHub 상태 확인
gh auth status

# 문제 있으면 다시 로그인
gh auth login

# 원격 저장소 생성
gh repo create should-i-buy --public --source=. --remote=origin --push
```

---

## 📱 배포 후 할 일

### 즉시
1. ✅ 프로덕션 URL을 즐겨찾기에 추가
2. ✅ 친구들에게 공유
3. ✅ 실제로 사용해보기

### 나중에 (선택사항)
1. 커스텀 도메인 연결 (예: `shouldibuy.com`)
2. Google Analytics 추가
3. 사용자 통계 대시보드 만들기
4. 모바일 앱 버전 개발

---

## 💡 유용한 팁

### 코드 수정 후 재배포

```bash
# 간단한 방법
./deploy.sh

# 또는 수동
git add .
git commit -m "Update features"
git push origin main
npm run deploy
```

### 프로덕션 데이터베이스 확인

```bash
# 데이터 조회
npx wrangler d1 execute webapp-production \
  --command="SELECT * FROM purchase_decisions LIMIT 10"

# 테이블 구조 확인
npx wrangler d1 execute webapp-production \
  --command="SELECT sql FROM sqlite_master WHERE type='table'"
```

### 배포 로그 실시간 확인

```bash
npx wrangler pages deployment tail --project-name should-i-buy
```

---

## 🎊 축하합니다!

하은님의 "Should I Buy?" 앱이 전 세계에 공개되었습니다! 🌍

이제 언제 어디서든 접속 가능하고, 친구들과도 공유할 수 있습니다.

**앱 URL**: https://should-i-buy.pages.dev

질문이나 문제가 있으면 언제든 채팅으로 물어보세요! 😊

---

**만든 사람**: 하은님 💜  
**만든 날짜**: 2025-12-03  
**버전**: 1.0  
**기술 스택**: Hono + Cloudflare Pages + D1 + Tailwind CSS
