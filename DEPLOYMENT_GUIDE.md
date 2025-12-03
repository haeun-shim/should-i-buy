# 배포 가이드 📚

## 🔐 사전 준비

### 1. GitHub 설정
```bash
# 1) Code Sandbox의 #github 탭에서 GitHub 연동 완료
# 2) 그 다음 아래 명령어 실행:

# GitHub 환경 확인
gh auth status

# 새 저장소 생성 (원하는 이름으로 변경 가능)
gh repo create should-i-buy --public --source=. --remote=origin --push
```

### 2. Cloudflare 설정
```bash
# 1) Cloudflare 계정이 없다면 생성: https://dash.cloudflare.com/sign-up
# 2) API Token 생성: https://dash.cloudflare.com/profile/api-tokens
#    - "Edit Cloudflare Workers" 템플릿 선택
#    - 또는 Custom Token으로 다음 권한 부여:
#      • Account - Cloudflare Pages: Edit
#      • Account - D1: Edit
# 3) Code Sandbox의 Deploy 탭에 토큰 입력
# 4) 또는 로컬에서 직접 로그인:

npx wrangler login
```

---

## ☁️ Cloudflare D1 프로덕션 데이터베이스 생성

```bash
# 1. 프로덕션 D1 데이터베이스 생성
npx wrangler d1 create webapp-production

# 출력 예시:
# ✅ Successfully created DB 'webapp-production'
# 
# [[d1_databases]]
# binding = "DB"
# database_name = "webapp-production"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# 2. database_id를 복사하여 wrangler.jsonc 파일에 업데이트
# wrangler.jsonc 파일의 d1_databases 섹션에서
# "database_id": "local-database-id-placeholder" 
# 부분을 실제 database_id로 교체

# 3. 프로덕션 데이터베이스에 마이그레이션 적용
npm run db:migrate:prod

# 4. (선택사항) 프로덕션에 샘플 데이터 삽입
npx wrangler d1 execute webapp-production --file=./seed.sql
```

---

## 🚀 Cloudflare Pages 배포

### 방법 1: 간단 배포 (권장)

```bash
# 1. 빌드
npm run build

# 2. Cloudflare Pages 프로젝트 생성 및 배포 (한 번에)
npx wrangler pages deploy dist --project-name should-i-buy

# 처음 실행 시 프로젝트가 자동으로 생성되고 배포됩니다!
```

### 방법 2: 프로젝트 먼저 생성

```bash
# 1. Cloudflare Pages 프로젝트 생성
npx wrangler pages project create should-i-buy \
  --production-branch main \
  --compatibility-date 2024-01-01

# 2. 빌드
npm run build

# 3. 배포
npx wrangler pages deploy dist --project-name should-i-buy
```

---

## 🎯 배포 후 확인 사항

### 1. URL 확인
```bash
# 배포 완료 후 다음과 같은 URL들을 받게 됩니다:
# Production: https://should-i-buy.pages.dev
# 또는: https://xxxxx.should-i-buy.pages.dev
```

### 2. 데이터베이스 동작 확인
```bash
# 프로덕션 데이터베이스에 데이터가 있는지 확인
npx wrangler d1 execute webapp-production \
  --command="SELECT COUNT(*) as count FROM purchase_decisions"
```

### 3. API 테스트
```bash
# 프로덕션 URL로 API 테스트
curl https://should-i-buy.pages.dev/api/decisions
```

---

## 🔧 배포 문제 해결

### 문제 1: "Project not found" 오류
```bash
# 프로젝트가 없다는 오류 발생 시:
npx wrangler pages project create should-i-buy
```

### 문제 2: D1 database_id가 잘못된 경우
```bash
# 1. database_id 다시 확인
npx wrangler d1 list

# 2. wrangler.jsonc 파일에서 database_id 수정
# 3. 다시 배포
npm run deploy
```

### 문제 3: 로그인 필요
```bash
# Cloudflare 로그인
npx wrangler login

# 또는 API 토큰 사용
export CLOUDFLARE_API_TOKEN="your-api-token"
```

---

## 📝 환경 변수 설정 (추후 필요시)

```bash
# Cloudflare Pages에 환경 변수 추가
npx wrangler pages secret put API_KEY --project-name should-i-buy

# 환경 변수 목록 확인
npx wrangler pages secret list --project-name should-i-buy
```

---

## 🔄 업데이트 배포

코드를 수정한 후 다시 배포하는 방법:

```bash
# 1. 변경사항 커밋
git add .
git commit -m "Update features"

# 2. (GitHub 연동 시) GitHub에 푸시
git push origin main

# 3. Cloudflare Pages에 배포
npm run deploy
# 또는
npx wrangler pages deploy dist --project-name should-i-buy
```

---

## 🌐 커스텀 도메인 연결 (선택사항)

```bash
# 1. Cloudflare에 도메인 추가 (예: example.com)
# 2. 커스텀 도메인 연결
npx wrangler pages domain add example.com --project-name should-i-buy

# 3. DNS 레코드 자동 설정 확인
# Cloudflare 대시보드 → Pages → should-i-buy → Custom domains
```

---

## 📊 유용한 명령어 모음

```bash
# 프로젝트 정보 확인
npx wrangler pages project list

# 배포 히스토리 확인
npx wrangler pages deployment list --project-name should-i-buy

# 특정 배포 롤백
npx wrangler pages deployment rollback <deployment-id> --project-name should-i-buy

# D1 데이터베이스 목록
npx wrangler d1 list

# D1 데이터베이스 콘솔
npx wrangler d1 execute webapp-production --command="SELECT * FROM purchase_decisions LIMIT 5"

# Cloudflare 계정 정보
npx wrangler whoami
```

---

## ✅ 배포 체크리스트

배포 전 확인:
- [ ] `npm run build` 성공
- [ ] D1 프로덕션 데이터베이스 생성
- [ ] `wrangler.jsonc`에 올바른 database_id 입력
- [ ] D1 마이그레이션 완료
- [ ] Cloudflare 로그인 완료

배포 후 확인:
- [ ] 프로덕션 URL 접속 가능
- [ ] 대시보드 페이지 정상 로딩
- [ ] API 응답 정상 (`/api/decisions`)
- [ ] 새 소비 판단 생성 테스트
- [ ] 데이터베이스 읽기/쓰기 정상

---

## 🆘 도움이 필요하면

- Cloudflare Workers 문서: https://developers.cloudflare.com/workers/
- Cloudflare Pages 문서: https://developers.cloudflare.com/pages/
- Cloudflare D1 문서: https://developers.cloudflare.com/d1/
- Wrangler CLI 문서: https://developers.cloudflare.com/workers/wrangler/

---

**모든 준비가 완료되면 `npm run deploy` 한 번으로 배포할 수 있습니다!** 🚀
