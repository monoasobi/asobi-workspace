<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 프로젝트 작업 지침

## 모노레포 이관 범위

- 이 디렉터리는 기존 MONOASOBI를 이관한 사본입니다. 상세 단계·보존 계약·승인은 루트 `../../AGENT.md`와 `../../docs/migration-status.md`를 따릅니다.
- 공개 일반 UI는 공용 shadcn/Tailwind로 전환했습니다. 소설은 문법별 CSS Modules를 보존하고 Themes 부품을 HTML/Tailwind·공용 shadcn으로 대체합니다. 기존 관리자는 사용자 승인으로 제거했고 읽기 테마 값은 기존 Radix Theme/CSS를 사용합니다. 가사/관리자 기능은 3~6단계에 adminasobi로, 공통 UI는 2·7단계에 인계했습니다. 기존 편집기·재생 로직을 재개발하지 않습니다.
- DB 정의·연결·마이그레이션의 단일 소유자는 `packages/database`입니다. 이 앱에 스키마/마이그레이션 사본을 만들지 않습니다. 운영 migrate/seed는 별도 승인 없이 실행하지 않습니다.
- Next 문서는 이 workspace에서 실제로 resolve되는 `next/package.json` 옆 `dist/docs/`를 확인합니다. 의존성이 루트로 hoist될 수 있습니다.

## 기본 커뮤니케이션

- 항상 한국어로 답변합니다.
- 존댓말을 사용합니다.
- 직접 코드를 수정한 경우 변경사항은 최대한 간략하게 설명합니다.

## 프로젝트 개요

- 이 프로젝트는 YOASOBI의 노래와 연결된 원작 소설, 만화, 가사 콘텐츠를 감상하는 MONOASOBI 웹 앱입니다.
- Next.js 16 App Router, React 19, TypeScript를 사용합니다.
- 일반 UI는 `@asobi/ui` shadcn·Tailwind·공통 타이포그래피 역할을 사용합니다. 소설은 기존 문법 CSS Modules와 Radix 부품을 대체한 Tailwind를 함께 사용합니다. 사용자가 혼용 금지를 철회했습니다.
- 전역 UI 상태는 Jotai atom을 사용합니다.
- DB는 Turso와 Drizzle ORM을 사용합니다.
- 소설 Markdown과 만화 이미지는 Cloudflare R2에 저장하고, 앱 API를 통해 제공합니다.
- 음악·소설·만화·가사·서적 쓰기는 `../minasobi`가 소유합니다. 이 앱의 `/admin` 하위는 이전 안내만 제공하며 관리자 API와 전용 인증은 제거했습니다.
- Agent API는 외부 프로젝트에서 catalog를 읽기 위한 읽기 전용 API입니다.

## 주요 디렉터리 역할

- `src/app`: Next.js App Router 라우트, route 전용 컴포넌트, API route를 둡니다.
- `src/app/**/_components`: 특정 route에서만 쓰는 컴포넌트를 둡니다.
- `src/components`: 여러 route에서 재사용 가능한 공용 UI나 도메인 표시 컴포넌트를 둡니다.
- `src/components/common`: 영상, 가사 플레이어 등 공용 기능 UI를 둡니다.
- `src/components/content`: 소설, 만화, 구매 링크, 번역 안내 등 콘텐츠 표시 UI를 둡니다.
- `src/components/custom`: 홈, 가이드, 특수 페이지용 UI를 둡니다.
- `src/components/layout`: 앱 프레임, 헤더, 사이드바 등 레이아웃 UI를 둡니다.
- `src/components/feedback`: 로딩, 에러 같은 피드백 UI를 둡니다.
- `src/server`: 서버 전용 인증, DB, query, mutation, storage 로직을 둡니다.
- `src/server/queries`: 조회 로직을 둡니다.
- `src/server/mutations`: 쓰기 로직을 둡니다.
- `src/server/schemas`: 서버 입력 검증 스키마를 둡니다.
- `src/server/auth`: 권한별 인증 로직을 둡니다.
- `src/types`: 도메인 타입 선언을 둡니다.
- `src/atoms`: Jotai atom을 둡니다.
- `public/images`: 정적 이미지와 앨범아트를 둡니다.

## 파일명 규칙

- React 컴포넌트 파일은 `PascalCase.tsx`를 사용합니다.
  - 예: `AdminDocumentPanel.tsx`, `TimelineCanvas.tsx`
- 컴포넌트별 CSS Module은 컴포넌트명과 맞춰 `PascalCase.module.css`를 사용합니다.
  - 예: `Sidebar.module.css`, `LyricTimelineEditor.module.css`
- route 전용 보조 CSS처럼 기존 파일명이 이미 kebab-case인 경우에는 기존 주변 컨벤션을 따릅니다.
  - 예: `route-shell.module.css`
- hook 파일은 `useSomething.ts` 형식을 사용합니다.
  - 예: `useTimelineResize.ts`, `useTimelineZoom.ts`
- 순수 유틸 파일은 역할이 드러나는 camelCase 또는 짧은 명사형을 사용합니다.
  - 예: `timelineUtils.ts`, `time.ts`, `metadata.ts`
- 서버 query/mutation 파일은 도메인 단수명 또는 기능명이 드러나는 이름을 사용합니다.
  - 예: `music.ts`, `novel.ts`, `admin.ts`
- 타입 선언 파일은 도메인명 기반 `*.d.ts`를 사용합니다.
  - 예: `music.d.ts`, `lyric.d.ts`
- API route 파일명은 Next.js 규칙에 따라 `route.ts`를 사용합니다.
- Next.js page/layout/not-found 파일은 프레임워크 규칙에 따라 `page.tsx`, `layout.tsx`, `not-found.tsx`를 사용합니다.

## 코드 구조와 파일 분리

- 새 컴포넌트를 만들거나 기존 컴포넌트를 확장하기 전에 코드 스플릿을 먼저 고려합니다.
- 단일 컴포넌트 파일이 과도하게 커지지 않도록 관리합니다.
- UI 렌더링, hooks, 유틸, 타입, payload 변환, config 로직이 섞이기 시작하면 역할별 파일로 분리합니다.
- 주체가 되는 컴포넌트 파일은 상위 폴더에 둡니다.
- 주체 컴포넌트의 보조 파일은 주체 컴포넌트와 같은 이름의 폴더 아래에 둡니다.

예시:

```txt
src/app/admin/_components/
  AdminDocumentPanel.tsx
  AdminDocumentPanel/
    AdminEditorForm.tsx
    AdminEditorField.tsx
    adminEditorConfig.ts
    adminSelectedDocument.ts
    types.ts
    utils.ts
```

- 특정 route의 상태, 데이터 조립, 권한, navigation, API 흐름에 묶인 컴포넌트는 `src/app/**/_components`에 둡니다.
- 여러 route에서 재사용 가능하거나 도메인 표시 단위로 독립적인 컴포넌트는 `src/components`에 둡니다.
- 상호작용 로직은 가능하면 focused hook으로 분리합니다.
- 순수 계산, 변환, format 함수는 utility 파일로 분리합니다.
- config가 도메인별로 길어지는 경우 도메인별 파일로 나눕니다.
- 파일 분리는 코드 양을 줄이기 위한 목적뿐 아니라 읽기 쉬운 책임 경계를 만들기 위한 목적입니다.

## UI 작성 기준

- 일반 공개 UI는 공용 shadcn 부품과 Tailwind를 사용합니다. 일반 제목/본문/설명/라벨은 ui의 `type-*` 역할을 우선 사용하고 색상은 공용 Loud 토큰을 사용합니다.
- 정적 Tailwind 상태/반응형 조합은 컴포넌트의 `.styles.ts`에 둘 수 있습니다. 여기에 CSS 규칙이나 런타임 스타일 엔진을 추가하지 않습니다. 반복되는 실제 공통 부품은 ui로 추출합니다.
- **소설 뷰어는 사용자 직접 조정 화면이므로 외형 변경을 금지합니다.** 사용자는 혼용 금지를 철회했습니다. NovelReader/NovelMarkdown의 기존 문법 CSS Modules는 보존하고 Themes의 Heading/Text/Flex/ScrollArea만 HTML/Tailwind·공용 shadcn으로 대체합니다. prose/Typeset 일괄 적용은 금지합니다. Markdown 문법/remark-breaks/폰트/들여쓰기/대사/인용문 등을 보존합니다.
- 소설을 위해 필요한 Radix Theme와 CSS는 legacy 레이어에 유지합니다. Tailwind preflight를 전역에 추가하지 않습니다. 기존 색상 상속은 Markdown 모듈 경계에서 명시하고 원래 읽기 배경은 viewer marker로 유지합니다.
- 새 UI의 ScrollArea는 viewportRef/viewportProps와 data-slot을 명시합니다. 소설도 동일한 viewportRef/viewportProps·data-slot 계약을 사용하며 읽던 위치 저장/복원을 보존합니다.
- 가사·콜의 읽기 위계는 일반 UI 타이포그래피와 별도입니다. 재생/시간/스냅/영상 크롭·기존 iframe 전체화면 fallback을 UI 통일 때문에 바꾸지 않습니다.
- 2026-10-21 사용자 승인으로 기존 관리자·쓰기 API·전용 인증을 제거했습니다. 이관 전 관리자를 되살리거나 공개 앱에 새 쓰기 경로를 추가하지 않습니다.
- 상세 역할과 검증 경계는 루트 `docs/ui-design-system.md`, `docs/ui-migration.md`를 읽습니다. `npm run check:ui`는 소설 원문 스타일/승인된 렌더러 보존과 공개 Themes import 제거를 점검합니다. 실제 픽셀/모바일 QA를 대신하지 않습니다.

## App Router 작업 주의

- 이 프로젝트의 Next.js는 일반적으로 알고 있는 버전과 다를 수 있습니다.
- Next.js API, file convention, deprecation이 확실하지 않으면 `node_modules/next/dist/docs/`의 관련 문서를 먼저 읽습니다.
- Server Component와 Client Component 경계를 의식합니다.
- `useState`, `useEffect`, browser API, event handler가 필요한 컴포넌트에는 `"use client"`가 필요합니다.
- 서버 전용 로직은 client component로 가져오지 않습니다.

## 검증

- 이 환경에서 일상적인 검증 용도로 `npm run build`를 실행하지 않습니다.
- 기본 검증 명령은 `npm run lint`입니다.
- 빌드 확인이 꼭 필요한 경우에는 사용자에게 먼저 확인합니다.
- 사용자가 브라우저에서 직접 동작 확인을 했다고 말한 경우에도, 코드 변경 후에는 가능한 한 `npm run lint`로 정적 검증을 수행합니다.

## 커밋

- 요청받은 단계의 세부 작업은 검증 후 로컬 커밋까지 진행합니다. 이후 요청한 단계에도 이 승인을 적용하며 매번 재확인하지 않습니다. 푸시는 별도 요청이 필요합니다.
- 메시지는 가급적 한 줄을 넘지 않는 간결한 한글로 작성합니다. 기존 원본/이관 커밋은 재작성하지 않습니다.
- 단계당 하나로 몰지 않고 작은 기능·작업 단위로 나눕니다. 한 변경에 필요한 소스·참조·설정·검사는 함께 묶습니다. 상세 기준은 루트 AGENT.md를 따릅니다.
- 사용자가 만든 것으로 보이는 무관한 변경은 커밋에 포함하지 않습니다.
- 커밋 전에는 `git status --short`와 staged diff를 확인합니다.

## 8단계 공개 데이터 반영과 환경 경계

- 사용자 결정으로 공개 화면의 실시간 갱신을 제거했습니다. Mono의 기존 `public-catalog` 서버 캐시만 관리자 저장 후 무효화하고 Loud는 요청별 DB 조회를 유지합니다. Loud 카탈로그 focus/storage 훅·새 캐시/폴링을 되살리지 않습니다.
- 재생/볼륨·읽던 위치/언어·선택곡 같은 로컬 동작은 보존합니다. 볼륨 storage와 재생 clock visibilitychange는 제거 대상이 아닙니다.
- 사용자는 환경 분리 요구를 철회하고 개발 환경에서도 운영 DB를 사용하는 기존 방식을 허용했습니다. 기존 연결 설정을 유지하며 별도 DB/R2 분리를 선행 조건으로 삼지 않습니다. 후속 명시 요청으로 세 앱은 기존 운영 Turso에 연결했습니다. 합성 fixture 검사는 운영 DB에서 실행하지 않으며 기존 local-check-client의 로컬 전용 제한을 유지합니다. 루트 `docs/cache-and-environments.md`를 따릅니다.

## 소설·만화 원문 연결과 로컬 편집

- 사용자 요청으로 기존 Mono의 비공개 콘텐츠 R2 설정을 이 앱의 무시된 `.env.local`에 연결했습니다. 기존 소설/만화 API와 독자 인증을 재사용하며 버킷 공개 설정을 바꾸지 않습니다.
- 소설 `NODE_ENV === "development"` 분기의 `/novel/{id}.md` 로컬 편집 경로를 반드시 유지합니다. 편집 파일은 `public/novel`이며 Git에서 제외합니다. 원본의 로컬 Markdown 4개를 새 위치에 복사했으며 기존 파일을 자동 덮어쓰지 않습니다.
- 운영 모드는 기존 `/api/content/novels/{id}`로 R2를 읽습니다. 소설 로컬 편집용 분기를 제거하거나 원격 읽기로 강제하지 않습니다. 본문 표시/스크롤/스타일 보존 계약도 유지합니다.
