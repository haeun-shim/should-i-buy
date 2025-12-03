# 🚀 빠른 시작 가이드

하은님, 딱 **3단계**만 따라하시면 앱이 배포됩니다!

---

## 📋 체크리스트

배포 전에 다음 2가지만 확인하세요:

- [ ] **GitHub 연동**: Code Sandbox 상단 `#github` 탭에서 연동
- [ ] **Cloudflare API Token**: Code Sandbox 상단 `Deploy` 탭에서 토큰 입력

✅ **둘 다 완료되었나요?** 그럼 채팅창에 "설정 완료!"라고 말씀해주세요!

---

## 🎯 3단계 배포

### 1️⃣ GitHub 저장소 생성 (30초)

```bash
gh repo create should-i-buy --public --source=. --remote=origin --push
```

### 2️⃣ Cloudflare D1 데이터베이스 생성 (1분)

```bash
npx wrangler d1 create webapp-production
```

출력된 `database_id`를 복사한 후, `wrangler.jsonc` 파일에서 수정:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "webapp-production",
    "database_id": "여기에-복사한-id-붙여넣기"  // ← 이 부분 수정
  }
]
```

### 3️⃣ 배포 실행 (30초)

```bash
./deploy.sh
```

또는 수동:

```bash
npm run build
npx wrangler pages deploy dist --project-name should-i-buy
```

---

## ✅ 완료!

배포가 완료되면 다음과 같은 URL을 받습니다:

```
✨ https://should-i-buy.pages.dev
```

브라우저에서 열어보세요! 🎉

---

## 🆘 문제 발생?

- **인증 오류**: `npx wrangler login` 실행
- **프로젝트 없음**: `npx wrangler pages project create should-i-buy` 실행
- **API 작동 안 함**: `npm run db:migrate:prod` 실행

자세한 내용은 `SETUP_INSTRUCTIONS.md` 참고하세요!
