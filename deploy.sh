#!/bin/bash

# Should I Buy - Automated Deployment Script
# 이 스크립트는 GitHub 푸시와 Cloudflare Pages 배포를 자동화합니다

set -e  # 오류 발생 시 중단

echo "🚀 Should I Buy 배포 스크립트 시작"
echo "=================================="
echo ""

# 1. Git 상태 확인
echo "📝 1단계: Git 변경사항 확인..."
if [[ -n $(git status -s) ]]; then
    echo "✅ 변경사항이 있습니다. 커밋을 진행합니다."
    git add .
    
    # 커밋 메시지 입력 받기
    read -p "커밋 메시지를 입력하세요 (기본: Update deployment): " commit_msg
    commit_msg=${commit_msg:-"Update deployment"}
    
    git commit -m "$commit_msg"
    echo "✅ 커밋 완료: $commit_msg"
else
    echo "ℹ️  변경사항이 없습니다."
fi
echo ""

# 2. GitHub 푸시 (선택사항)
echo "📤 2단계: GitHub 푸시..."
read -p "GitHub에 푸시하시겠습니까? (y/N): " push_github
if [[ $push_github == "y" || $push_github == "Y" ]]; then
    if git remote | grep -q "origin"; then
        echo "✅ GitHub에 푸시 중..."
        git push origin main
        echo "✅ GitHub 푸시 완료"
    else
        echo "⚠️  GitHub 원격 저장소가 설정되지 않았습니다."
        echo "   다음 명령어로 저장소를 생성하세요:"
        echo "   gh repo create should-i-buy --public --source=. --remote=origin --push"
    fi
else
    echo "ℹ️  GitHub 푸시를 건너뜁니다."
fi
echo ""

# 3. 빌드
echo "🔨 3단계: 프로젝트 빌드..."
npm run build
echo "✅ 빌드 완료"
echo ""

# 4. Cloudflare Pages 배포
echo "☁️  4단계: Cloudflare Pages 배포..."
read -p "Cloudflare Pages에 배포하시겠습니까? (y/N): " deploy_cf
if [[ $deploy_cf == "y" || $deploy_cf == "Y" ]]; then
    # 프로젝트 이름 입력
    read -p "프로젝트 이름을 입력하세요 (기본: should-i-buy): " project_name
    project_name=${project_name:-"should-i-buy"}
    
    echo "✅ Cloudflare Pages에 배포 중..."
    npx wrangler pages deploy dist --project-name "$project_name"
    
    echo ""
    echo "🎉 배포 완료!"
    echo "=================================="
    echo "프로덕션 URL: https://$project_name.pages.dev"
    echo ""
    echo "다음 단계:"
    echo "1. 위 URL로 접속하여 앱이 정상 작동하는지 확인"
    echo "2. API 테스트: curl https://$project_name.pages.dev/api/decisions"
    echo "3. 문제가 있다면 로그 확인: npx wrangler pages deployment tail"
else
    echo "ℹ️  Cloudflare Pages 배포를 건너뜁니다."
fi
echo ""

echo "✅ 배포 스크립트 완료!"
