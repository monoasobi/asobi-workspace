# ADMINASOBI 작업 지침

- 단계·보존 계약·승인·커밋은 루트 `../../AGENT.md`를 따릅니다.
- 기존 두 관리자의 인증·폼·서버 로직을 이관하며 전면 재개발하지 않습니다. 현재 진행 단계와 미완료 범위는 루트 `docs/migration-status.md`에서 확인합니다.
- 공통 shadcn·브랜드·DB 패키지를 사용합니다. 가사/콜 독립 페이지는 5단계에서 연결하고 로컬 검증했습니다. 6단계 콘텐츠·추천 관리도 이관하고 로컬 검증했습니다. 화면·실제 콘텐츠·R2 통합 QA는 남아 있습니다.
- 7단계에서 잔여 가사 타임라인/패널 CSS Modules를 Tailwind로 옮겼습니다. 공통 패널은 `@asobi/ui/components/resizable`, 일반 타이포그래피는 공통 `type-*` 역할을 사용합니다. CSS Modules를 새로 복제하지 않습니다.
- 공통 편집 조작은 `src/components/editors/shared`, 공개와 동일한 콜 미리보기는 `@asobi/loudasobi-view`를 사용합니다. 단축키 리스너나 이력·확대 로직을 다시 복제하지 않습니다. 가사/콜의 시간 정밀도·스냅·서로 다른 재생 제어는 유지합니다. 자세한 계약과 미검증 항목은 루트 `docs/editor-migration.md`를 읽습니다.
- 콘텐츠 필드·payload는 `components/content/editorConfigs`, 추천 편집은 `SidebarOrderEditor`를 재사용합니다. 기능/보존/동시 편집 한계는 루트 `docs/content-migration.md`를 읽습니다. 사용자 QA·검토사항은 별도 진행 중이므로 결정이 모이면 반영합니다.
- 조회마다 세션, 쓰기마다 관리자 역할·동일 출처·입력 검증을 확인합니다. 비공개 응답은 no-store입니다.
- 코드 변경 후 관련 lint·typecheck를 실행하고 세부 작업별 간결한 영어 한 줄 커밋을 남깁니다. 빌드·푸시·운영 작업은 별도 승인 범위입니다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
