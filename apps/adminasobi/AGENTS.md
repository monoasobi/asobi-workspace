# ADMINASOBI 작업 지침

- 단계·보존 계약·승인·커밋은 루트 `../../AGENT.md`를 따릅니다.
- 기존 두 관리자의 인증·폼·서버 로직을 이관하며 전면 재개발하지 않습니다. 현재 범위는 3단계입니다.
- 공통 shadcn·브랜드·DB 패키지를 사용합니다. 가사/콜 편집기는 5단계, 나머지 콘텐츠 관리는 6단계입니다.
- 조회마다 세션, 쓰기마다 관리자 역할·동일 출처·입력 검증을 확인합니다. 비공개 응답은 no-store입니다.
- 코드 변경 후 관련 lint·typecheck를 실행하고 세부 작업별 간결한 한글 한 줄 커밋을 남깁니다. 빌드·푸시·운영 작업은 별도 승인 범위입니다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
