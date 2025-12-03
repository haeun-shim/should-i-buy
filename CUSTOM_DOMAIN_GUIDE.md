# 커스텀 도메인 연결 가이드 🌐

"Should I Buy?" 앱에 나만의 도메인(예: `shouldibuy.com`)을 연결하는 방법입니다.

---

## 🎯 왜 커스텀 도메인을 사용하나요?

### 장점
- ✅ **기억하기 쉬운 주소**: `should-i-buy.pages.dev` → `shouldibuy.com`
- ✅ **전문적인 이미지**: 브랜드 가치 상승
- ✅ **SEO 개선**: 검색 엔진 최적화
- ✅ **공유하기 좋음**: 짧고 명확한 URL

---

## 📋 사전 준비

### 1. 도메인 구매

도메인을 아직 구매하지 않으셨다면:

**추천 도메인 등록 업체:**
- **Cloudflare Registrar** (추천!) - 가장 저렴, Cloudflare와 통합
- **가비아** (Gabia) - 한국 업체
- **후이즈** (Whois) - 한국 업체  
- **GoDaddy** - 글로벌 업체
- **Namecheap** - 글로벌 업체

**도메인 이름 추천:**
- `shouldibuy.com` / `shouldibuy.kr`
- `salkkamalkka.com` (살까말까)
- `buyornot.com`
- `spendwise.com`

**가격:**
- `.com` 도메인: 연간 $10-15
- `.kr` 도메인: 연간 ₩15,000-20,000

---

## 🔧 Cloudflare Pages에 커스텀 도메인 연결

### 방법 1: Cloudflare Registrar에서 구매한 경우 (가장 간단)

1. **Cloudflare 대시보드** 접속
2. **Pages** → **should-i-buy** 프로젝트 선택
3. **Custom domains** 탭 클릭
4. **Set up a custom domain** 클릭
5. 도메인 입력 (예: `shouldibuy.com`)
6. **Activate domain** 클릭
7. **완료!** DNS가 자동 설정됩니다 ✅

### 방법 2: 다른 업체에서 구매한 경우

#### 2-1. Cloudflare에 도메인 추가

1. **Cloudflare 대시보드** → **Add a site**
2. 도메인 입력 (예: `shouldibuy.com`)
3. **Free 플랜** 선택
4. **Cloudflare 네임서버** 확인 (예시):
   ```
   isaac.ns.cloudflare.com
   zara.ns.cloudflare.com
   ```

#### 2-2. 도메인 등록업체에서 네임서버 변경

**가비아 (Gabia):**
1. [가비아 관리콘솔](https://www.gabia.com/) 로그인
2. **My가비아** → **서비스 관리**
3. 도메인 선택 → **관리도구** → **네임서버 설정**
4. **네임서버 변경** 선택
5. Cloudflare 네임서버 2개 입력
6. **확인** 클릭

**후이즈 (Whois):**
1. [후이즈](https://www.whois.co.kr/) 로그인
2. **도메인 관리** → 도메인 선택
3. **네임서버 관리** 클릭
4. Cloudflare 네임서버 입력
5. **저장**

**GoDaddy / Namecheap:**
1. 계정 로그인
2. **My Products** / **Domain List**
3. 도메인 선택 → **DNS** 또는 **Nameservers**
4. **Change** 또는 **Custom**
5. Cloudflare 네임서버 입력
6. **Save**

#### 2-3. Cloudflare Pages에 커스텀 도메인 추가

1. **Cloudflare 대시보드** → **Pages** → **should-i-buy**
2. **Custom domains** → **Set up a custom domain**
3. 도메인 입력 (예: `shouldibuy.com`)
4. **Begin CNAME setup** 또는 **Activate domain**
5. DNS 레코드가 자동 생성됩니다

---

## 🔒 HTTPS/SSL 설정

Cloudflare Pages는 **자동으로 SSL 인증서를 발급**합니다!

### 확인 방법
1. **Cloudflare 대시보드** → **SSL/TLS**
2. **Encryption mode**: **Full (strict)** 권장
3. **Always Use HTTPS**: 활성화 권장

**대기 시간:**
- SSL 인증서 발급: 5-10분
- 전체 DNS 전파: 24-48시간 (보통 1-2시간)

---

## 🌐 www 서브도메인 설정

`www.shouldibuy.com`도 작동하게 하려면:

### Cloudflare Pages에서:
1. **Custom domains** → **Set up a custom domain**
2. `www.yourdomain.com` 입력
3. **Activate domain**

### 리다이렉트 설정 (선택사항):
- `www.shouldibuy.com` → `shouldibuy.com` 리다이렉트
- 또는 그 반대

---

## 📱 서브도메인 추가 (선택사항)

개발/스테이징 환경을 위한 서브도메인:

### 예시:
- `app.shouldibuy.com` - 메인 앱
- `dev.shouldibuy.com` - 개발 환경
- `staging.shouldibuy.com` - 스테이징 환경

### 설정 방법:
1. **Pages** → **should-i-buy** → **Custom domains**
2. 서브도메인 입력 (예: `dev.shouldibuy.com`)
3. **Branch** 선택 (예: `develop` 브랜치)
4. **Activate**

---

## ✅ 설정 확인

### 1. DNS 전파 확인
```bash
# 터미널에서
nslookup shouldibuy.com
dig shouldibuy.com

# 또는 온라인 도구:
# https://www.whatsmydns.net/
```

### 2. SSL 인증서 확인
```
https://yourdomain.com
```
브라우저 주소창에 🔒 자물쇠 아이콘이 표시되어야 합니다.

### 3. 페이지 로드 확인
- 메인 페이지: `https://yourdomain.com`
- API: `https://yourdomain.com/api/decisions`
- 통계: `https://yourdomain.com/stats`

---

## 🚀 SEO 최적화 (선택사항)

커스텀 도메인 연결 후 SEO 개선:

### 1. Google Search Console 등록
1. https://search.google.com/search-console
2. **속성 추가** → 도메인 입력
3. **DNS 인증** (Cloudflare DNS에 TXT 레코드 추가)
4. **사이트맵 제출**: `https://yourdomain.com/sitemap.xml`

### 2. 메타 태그 최적화
`src/index.tsx`의 HTML `<head>`에 추가:
```html
<meta name="description" content="살까말까 10초 안에 결론 내주는 소비 판단기">
<meta property="og:title" content="Should I Buy?">
<meta property="og:description" content="AI 기반 합리적 소비 판단 도구">
<meta property="og:image" content="https://yourdomain.com/og-image.png">
<meta property="og:url" content="https://yourdomain.com">
<meta name="twitter:card" content="summary_large_image">
```

### 3. 구조화된 데이터 추가
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Should I Buy?",
  "description": "살까말까 판단기",
  "url": "https://yourdomain.com",
  "applicationCategory": "FinanceApplication"
}
</script>
```

---

## 📧 이메일 설정 (선택사항)

도메인으로 이메일 받기:

### 무료 옵션:
- **Cloudflare Email Routing** (추천, 무료)
- **Gmail (G Suite)** - 개인용 무료, 비즈니스는 유료

### Cloudflare Email Routing 설정:
1. **Cloudflare 대시보드** → 도메인 선택
2. **Email** → **Email Routing**
3. **Enable Email Routing**
4. 라우팅 규칙 추가:
   - `hello@yourdomain.com` → 개인 이메일

---

## ⚡ 성능 최적화

Cloudflare를 통한 성능 개선:

### 1. 캐싱 설정
- **Cloudflare 대시보드** → **Caching** → **Configuration**
- **Browser Cache TTL**: 4 hours 이상

### 2. 자동 최적화
- **Auto Minify**: HTML, CSS, JS 활성화
- **Brotli 압축**: 활성화

### 3. Cloudflare Workers (고급)
- 엣지에서 동적 콘텐츠 캐싱
- A/B 테스트 구현
- 지역별 콘텐츠 제공

---

## 🛡️ 보안 설정

### 1. Firewall Rules
불필요한 트래픽 차단:
- Bot 공격 방어
- 특정 국가 차단 (선택사항)

### 2. Rate Limiting
API 호출 제한:
- 1분에 60회 이하
- DDoS 방어

### 3. Security Level
- **Medium** 또는 **High** 권장

---

## 💰 비용 정리

| 항목 | 비용 |
|------|------|
| 도메인 (.com) | $10-15/년 |
| Cloudflare Pages | 무료 |
| Cloudflare SSL | 무료 |
| Cloudflare CDN | 무료 |
| **총 비용** | **$10-15/년** |

### 추가 비용 (선택사항):
- 프리미엄 도메인: $수백-수천
- Cloudflare Pro: $20/월 (더 빠른 CDN, 더 많은 기능)
- 비즈니스 이메일 (G Suite): $6/월/사용자

---

## 🆘 문제 해결

### 문제 1: "DNS_PROBE_FINISHED_NXDOMAIN" 오류
**원인**: DNS가 아직 전파되지 않음  
**해결**: 24-48시간 대기 (보통 1-2시간이면 충분)

### 문제 2: "ERR_CERT_AUTHORITY_INVALID" SSL 오류
**원인**: SSL 인증서가 아직 발급되지 않음  
**해결**: 5-10분 대기 후 캐시 삭제 (Ctrl+Shift+R)

### 문제 3: 페이지가 로드되지 않음
**원인**: Cloudflare Pages 설정 오류  
**해결**: 
1. Pages 대시보드에서 **Custom domains** 확인
2. DNS 레코드 확인
3. 배포 상태 확인

### 문제 4: 일부 링크만 작동
**원인**: SPA 라우팅 문제  
**해결**: `_redirects` 파일 추가 (Cloudflare Pages는 자동 처리)

---

## 📚 추가 자료

- **Cloudflare Pages 문서**: https://developers.cloudflare.com/pages/
- **DNS 전파 확인**: https://www.whatsmydns.net/
- **SSL 테스트**: https://www.ssllabs.com/ssltest/
- **도메인 가격 비교**: https://tld-list.com/

---

## ✅ 체크리스트

- [ ] 도메인 구매 완료
- [ ] Cloudflare에 사이트 추가
- [ ] 네임서버 변경 (외부 등록업체 사용 시)
- [ ] Cloudflare Pages에 커스텀 도메인 추가
- [ ] DNS 전파 확인
- [ ] HTTPS 작동 확인
- [ ] www 서브도메인 설정 (선택사항)
- [ ] Google Search Console 등록 (선택사항)
- [ ] 이메일 라우팅 설정 (선택사항)

---

**축하합니다! 커스텀 도메인 연결이 완료되었습니다!** 🎉

이제 전문적인 도메인으로 앱을 공유할 수 있습니다.
