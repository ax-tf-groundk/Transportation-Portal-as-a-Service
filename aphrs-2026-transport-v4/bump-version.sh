#!/usr/bin/env bash
# ============================================================
# APHRS 2026 Transport Portal — 버전 범프 스크립트
# 사용법: bash bump-version.sh [새버전]
#   예)   bash bump-version.sh 2026.06.28.1
#
# 버전 형식: YYYY.MM.DD.N  (날짜 + 당일 패치 번호)
# 실행 위치: aphrs-2026-transport/ 폴더 안에서 실행
# ============================================================

set -e

# ── 1. 새 버전 입력 받기 ─────────────────────────────────────
if [ -z "$1" ]; then
  TODAY=$(date +%Y.%m.%d)
  NEW_VER="${TODAY}.1"
  echo "버전 미지정 → 오늘 날짜 기반 자동: $NEW_VER"
else
  NEW_VER="$1"
fi

# ── 2. 현재 버전 탐지 ────────────────────────────────────────
OLD_VER=$(grep -h "SITE_VERSION" assets/app.js | grep -oP "'\K[^']+" | head -1)
if [ -z "$OLD_VER" ]; then
  OLD_VER=$(grep -rh "?v=" index.html | grep -oP "v=\K[0-9.]+" | head -1)
fi

echo "현재 버전: $OLD_VER"
echo "새 버전  : $NEW_VER"
echo ""

# ── 3. 확인 ─────────────────────────────────────────────────
read -rp "계속하시겠습니까? (y/N) " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "취소됨."
  exit 0
fi

# ── 4. 일괄 치환 (HTML + JS + CSS) ──────────────────────────
FILES=$(grep -rl "$OLD_VER" . --include="*.html" --include="*.js" --include="*.css" 2>/dev/null)
COUNT=0
for f in $FILES; do
  sed -i "s/$OLD_VER/$NEW_VER/g" "$f"
  echo "  ✅ $f"
  COUNT=$((COUNT + 1))
done

echo ""
echo "완료: $COUNT개 파일 → $NEW_VER"
echo ""
echo "▶ 다음 단계:"
echo "  1) 브라우저 강력 새로고침(Ctrl+Shift+R)으로 버전 확인"
echo "  2) git add -A && git commit -m \"build: bump version to $NEW_VER\""
echo "  3) git push origin main  (GitHub Pages 자동 배포)"
