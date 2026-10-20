# 0단계 원본 소스 목록

확인 시각: 2026-10-20 09:56 KST. 파일 목록은 각 원본의 Git 추적 파일을 기준으로 작성했습니다. 실제 비밀값은 읽거나 기록하지 않았습니다. 실행 기준과 재사용 위치는 [migration-status.md](migration-status.md), [reuse-map.md](reuse-map.md)를 봅니다.

Next가 내부 생성하는 `_next` 경로는 아래 제품 route 목록에 포함하지 않습니다. 경로 표기는 현재 원본 기준이며 새 관리자 최종 URL과는 다릅니다.

## MONOASOBI

- 원본: `/Users/nine/Documents/work/monoasobi-react-ts-web`.
- 기준 HEAD: `2241c2efa0af20c9f43660c732527aa5ef7cd5ec` / `main`.
- 추적 파일 319개. page 10개, API route 24개. 메타데이터 파일은 별도입니다.
- 추적 파일 경로와 파일별 SHA-256을 정렬한 JSON의 SHA-256: `904b2d1c9cf9a56f89cc95484b0e432856dfa0ba981c45b5e5f201888755d727`. 감사 시작/종료 내용 대조용이며 배포 산출물 해시가 아닙니다.

### 전체 페이지

| 현재 URL | 원본 파일 | 이관 방향 |
| --- | --- | --- |
| `/admin/lyrics/[musicId]/timeline` | `src/app/admin/lyrics/[musicId]/timeline/page.tsx` | 초기 앱 안에 보존 → 관리자 기능별 전환 뒤 새 관리자 진입으로 정리 |
| `/admin` | `src/app/admin/page.tsx` | 초기 앱 안에 보존 → 관리자 기능별 전환 뒤 새 관리자 진입으로 정리 |
| `/comic/[id]` | `src/app/comic/[id]/page.tsx` | 공개 앱에 URL/기능 유지 |
| `/guide` | `src/app/guide/page.tsx` | 공개 앱에 URL/기능 유지 |
| `/heartbeat` | `src/app/heartbeat/page.tsx` | 공개 앱에 URL/기능 유지 |
| `/novel/[id]` | `src/app/novel/[id]/page.tsx` | 공개 앱에 URL/기능 유지 |
| `/onthestage` | `src/app/onthestage/page.tsx` | 공개 앱에 URL/기능 유지 |
| `/` | `src/app/page.tsx` | 공개 앱에 URL/기능 유지 |
| `/players` | `src/app/players/page.tsx` | 공개 앱에 URL/기능 유지 |
| `/private` | `src/app/private/page.tsx` | 공개 앱에 URL/기능 유지 |

### 전체 API

| HTTP | 현재 URL | 이관 방향 |
| --- | --- | --- |
| POST | `/api/admin/auth/login` | 초기 보존 → 새 관리자 서버/API로 기능 이관 후 이전 쓰기 종료 |
| POST | `/api/admin/auth/logout` | 초기 보존 → 새 관리자 서버/API로 기능 이관 후 이전 쓰기 종료 |
| PUT, DELETE | `/api/admin/books/[id]` | 초기 보존 → 새 관리자 서버/API로 기능 이관 후 이전 쓰기 종료 |
| POST | `/api/admin/books` | 초기 보존 → 새 관리자 서버/API로 기능 이관 후 이전 쓰기 종료 |
| PUT, DELETE | `/api/admin/comics/[id]` | 초기 보존 → 새 관리자 서버/API로 기능 이관 후 이전 쓰기 종료 |
| POST | `/api/admin/comics` | 초기 보존 → 새 관리자 서버/API로 기능 이관 후 이전 쓰기 종료 |
| PUT, DELETE | `/api/admin/lyric-tracks/[musicId]` | 초기 보존 → 새 관리자 서버/API로 기능 이관 후 이전 쓰기 종료 |
| POST | `/api/admin/lyric-tracks` | 초기 보존 → 새 관리자 서버/API로 기능 이관 후 이전 쓰기 종료 |
| PUT | `/api/admin/musics/[id]/album-art` | 초기 보존 → 새 관리자 서버/API로 기능 이관 후 이전 쓰기 종료 |
| PUT, DELETE | `/api/admin/musics/[id]` | 초기 보존 → 새 관리자 서버/API로 기능 이관 후 이전 쓰기 종료 |
| POST | `/api/admin/musics` | 초기 보존 → 새 관리자 서버/API로 기능 이관 후 이전 쓰기 종료 |
| PUT, DELETE | `/api/admin/novels/[id]` | 초기 보존 → 새 관리자 서버/API로 기능 이관 후 이전 쓰기 종료 |
| POST | `/api/admin/novels` | 초기 보존 → 새 관리자 서버/API로 기능 이관 후 이전 쓰기 종료 |
| GET | `/api/agent/catalog` | Mono 공개 앱의 Bearer 인증 읽기 API 유지 |
| GET | `/api/agent/musics/[id]` | Mono 공개 앱의 Bearer 인증 읽기 API 유지 |
| GET | `/api/agent/musics` | Mono 공개 앱의 Bearer 인증 읽기 API 유지 |
| GET | `/api/agent/musics/search` | Mono 공개 앱의 Bearer 인증 읽기 API 유지 |
| GET | `/api/content/albumart/[id]/[file]` | 독립 assets 전환 확인까지 공개 앱의 호환 경로 유지 |
| GET | `/api/content/comic-file/[...key]` | Mono 공개 앱의 콘텐츠 읽기/기존 접근 조건 유지 |
| GET | `/api/content/comics/[id]` | Mono 공개 앱의 콘텐츠 읽기/기존 접근 조건 유지 |
| GET | `/api/content/novels/[id]` | Mono 공개 앱의 콘텐츠 읽기/기존 접근 조건 유지 |
| POST | `/api/private-reader/auth/login` | Mono 공개 앱의 독자 세션 유지 |
| POST | `/api/private-reader/auth/logout` | Mono 공개 앱의 독자 세션 유지 |
| GET | `/api/private-reader/auth/session` | Mono 공개 앱의 독자 세션 유지 |

API 파일은 각 URL에 대응하는 `src/app{URL}/route.ts`입니다. 원본의 export function/const 선언에서 HTTP 메서드를 대조했습니다.

### 서버 모듈

| 영역 | 원본 파일 |
| --- | --- |
| auth | `src/server/auth/admin.ts`<br>`src/server/auth/agent.ts`<br>`src/server/auth/private-reader.ts` |
| queries | `src/server/queries/activeMusic.ts`<br>`src/server/queries/admin.ts`<br>`src/server/queries/agent.ts`<br>`src/server/queries/book.ts`<br>`src/server/queries/comic.ts`<br>`src/server/queries/lyric.ts`<br>`src/server/queries/mapper.ts`<br>`src/server/queries/music.ts`<br>`src/server/queries/novel.ts`<br>`src/server/queries/publicCatalog.ts`<br>`src/server/queries/sidebar.ts` |
| mutations | `src/server/mutations/admin.ts`<br>`src/server/mutations/albumArt.ts` |
| schemas | `src/server/schemas/admin.schema.ts` |

### DB 정의와 이력

| TypeScript export | 실제 테이블 |
| --- | --- |
| `musics` | `musics` |
| `books` | `books` |
| `novels` | `novels` |
| `comics` | `comics` |
| `bookNovels` | `book_novels` |
| `bookPurchaseLinks` | `book_purchase_links` |
| `lyricTracks` | `lyric_tracks` |
| `loudasobiSidebarSettings` | `loudasobi_sidebar_settings` |
| `loudasobiMusicSettings` | `loudasobi_music_settings` |
| `loudasobiLyricTracks` | `loudasobi_lyric_tracks` |
| `loudasobiCallGuides` | `loudasobi_call_guides` |

정식 마이그레이션 소유자는 현재 MONOASOBI입니다. 아래 SQL과 `drizzle/meta/_journal.json`, 0000~0008 snapshot을 함께 보존합니다. 이번에 DB 접속/실행하지 않았습니다.

- `drizzle/0000_third_maelstrom.sql`
- `drizzle/0001_famous_tombstone.sql`
- `drizzle/0002_crazy_scarecrow.sql`
- `drizzle/0003_nullable_youtube_id.sql`
- `drizzle/0004_loudasobi_foundation.sql`
- `drizzle/0005_shared_lyrics.sql`
- `drizzle/0006_loudasobi_bpm.sql`
- `drizzle/0007_loudasobi_sidebar.sql`
- `drizzle/0008_album_art.sql`

### 환경변수 이름

소스의 `process.env` 참조를 기준으로 하며 값은 포함하지 않습니다. 실제 파일의 값·접속 대상·권한·배포 환경 매핑은 미확인입니다. `NODE_ENV`는 런타임 제공 값입니다.

| 이름 | 주 용도/경계 |
| --- | --- |
| `ADMIN_PASSWORD` | 관리자 인증/역할/세션. 서버 전용 |
| `ADMIN_SESSION_SECRET` | 관리자 인증/역할/세션. 서버 전용 |
| `ADMIN_VIEWER_PASSWORDS` | 관리자 인증/역할/세션. 서버 전용 |
| `AGENT_API_TOKEN` | Agent API 읽기 인증. 서버 전용 |
| `ALBUM_ART_TEST_URL` | 기존 API 점검 도구 대상 주소. 자동 실행하지 않음 |
| `NODE_ENV` | 런타임 구분 |
| `PRIVATE_READER_PASSWORD` | 독자 인증. Mono 공개 앱 서버에 유지 |
| `PRIVATE_READER_SESSION_SECRET` | 독자 인증. Mono 공개 앱 서버에 유지 |
| `PRIVATE_READER_TOKEN` | 독자 인증. Mono 공개 앱 서버에 유지 |
| `R2_ACCESS_KEY_ID` | 서버 파일 저장소. endpoint 두 표기는 기존 호환 처리 |
| `R2_ACCOUNT_ID` | 서버 파일 저장소. endpoint 두 표기는 기존 호환 처리 |
| `R2_BUCKET_NAME` | 서버 파일 저장소. endpoint 두 표기는 기존 호환 처리 |
| `R2_ENDPOINT` | 서버 파일 저장소. endpoint 두 표기는 기존 호환 처리 |
| `R2_END_POINT` | 서버 파일 저장소. endpoint 두 표기는 기존 호환 처리 |
| `R2_SECRET_ACCESS_KEY` | 서버 파일 저장소. endpoint 두 표기는 기존 호환 처리 |
| `TURSO_AUTH_TOKEN` | 서버 DB 연결/운영 도구. 읽기·쓰기 권한 실제 확인 필요 |
| `TURSO_DATABASE_URL` | 서버 DB 연결/운영 도구. 읽기·쓰기 권한 실제 확인 필요 |

### 정적 자산·메타데이터·글꼴

- `public/assets/logo.svg`: 1개.
- `public/fonts/KoPubBatang-Medium.woff2`: 1개.
- `public/images/albumart/`: 36개.
- `public/images/assets/`: 9개.
- `public/images/books/`: 3개.
- `public/images/gallery/`: 4개.
- `public/images/opengraph.png`: 1개.
- `public/manifest.json`: 1개.
- 앱 메타데이터 파일: `src/app/apple-icon.png`, `src/app/favicon.ico`, `src/app/icon.png`.
- 로컬 `KoPubBatang-Medium.woff2`, 외부 Pretendard JP CSS, 로고·책·갤러리·특수 페이지 이미지를 기존 공개 URL로 보존합니다. 앨범아트 36개는 35개 WebP와 empty.svg입니다.
- `public/manifest.json`과 metadata.ts의 앱 URL/제목을 보존합니다. 책·갤러리 이미지를 앨범아트 CDN 전환에 섞지 않습니다.

### 설정·스크립트·CI/배포

- 현재 npm scripts: `dev`: `next dev`, `build`: `next build`, `start`: `next start`, `lint`: `eslint`, `db:generate`: `drizzle-kit generate`, `db:migrate`: `drizzle-kit migrate`, `db:seed`: `tsx src/server/db/seed.ts`, `db:studio`: `drizzle-kit studio`.
- 설정 파일: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.gitignore`, `drizzle.config.ts`.
- 기존 집중 검사는 이번 단계에서 실행하지 않았습니다. DB/파일 작업 도구는 승인 없이 실행하지 않습니다.

  - `scripts/activeLyric.test.mjs`: 순수/기존 집중 검사.
  - `scripts/adminWorkspace.test.mjs`: 순수/기존 집중 검사.
  - `scripts/albumArt.test.ts`: 순수/기존 집중 검사.
  - `scripts/albumArtMigration.mjs`: DB/R2/콘텐츠 운영 도구 — 자동 실행 금지.
  - `scripts/backfillLyricIds.mjs`: DB/R2/콘텐츠 운영 도구 — 자동 실행 금지.
  - `scripts/checkAlbumArtApi.mjs`: 서버/API 점검 도구.
  - `scripts/englishLyrics.mjs`: DB/R2/콘텐츠 운영 도구 — 자동 실행 금지.
  - `scripts/loudasobiFoundation.mjs`: DB/R2/콘텐츠 운영 도구 — 자동 실행 금지.
  - `scripts/playerFullscreen.test.mjs`: 순수/기존 집중 검사.
  - `scripts/timelineSnap.test.mjs`: 순수/기존 집중 검사.
- Git 추적 `.github` workflow / `vercel.json` / `.vercel` 설정: 없음. 실제 Vercel 프로젝트·도메인·배포 훅은 로컬 소스만으로 확인되지 않습니다.
- package-lock.json을 보유합니다. 새 workspace 루트의 단일 lockfile로 통합할 예정이며 이번에는 변경하지 않았습니다.
- `.nvmrc`는 22.18.0, `.vscode/extensions.json`은 에디터 보조 설정입니다.
- `.env.example`은 추적됨. `.env`는 ignore됨. seed/seed-data는 추적되지만 install/dev와 별개이며 이관을 위해 재실행하지 않습니다.

### 로컬 제외 항목

- Git ignored 항목(파일명/폴더만 확인): `.DS_Store`, `.backups/`, `.env`, `.next/`, `next-env.d.ts`, `node_modules/`, `public/.DS_Store`, `public/novel/`, `src/.DS_Store`, `tsconfig.tsbuildinfo`.
- `.git/` 자체도 앱 소스로 복사하지 않습니다. Git 이력은 별도 승인된 방식으로 새 저장소에 연결합니다.

## LOUDASOBI

- 원본: `/Users/nine/Documents/work/loudasobi`.
- 기준 HEAD: `a9ade435c0232c485cd5ab0962d842cc881879e4` / `main`.
- 추적 파일 222개. page 4개, API route 7개. 메타데이터 파일은 별도입니다.
- 추적 파일 경로와 파일별 SHA-256을 정렬한 JSON의 SHA-256: `272f16697425a7d7f0ffe8b8b2dad9efbb00d43dee5a50621be4291245a19c5e`. 감사 시작/종료 내용 대조용이며 배포 산출물 해시가 아닙니다.

### 전체 페이지

| 현재 URL | 원본 파일 | 이관 방향 |
| --- | --- | --- |
| `/admin/musics/[id]/guide` | `src/app/admin/musics/[id]/guide/page.tsx` | 초기 앱 안에 보존 → 관리자 기능별 전환 뒤 새 관리자 진입으로 정리 |
| `/admin` | `src/app/admin/page.tsx` | 초기 앱 안에 보존 → 관리자 기능별 전환 뒤 새 관리자 진입으로 정리 |
| `/admin/sidebar` | `src/app/admin/sidebar/page.tsx` | 초기 앱 안에 보존 → 관리자 기능별 전환 뒤 새 관리자 진입으로 정리 |
| `/` | `src/app/page.tsx` | 공개 앱에 URL/기능 유지 |

### 전체 API

| HTTP | 현재 URL | 이관 방향 |
| --- | --- | --- |
| POST | `/api/admin/auth/login` | 초기 보존 → 새 관리자 서버/API로 기능 이관 후 이전 쓰기 종료 |
| POST | `/api/admin/auth/logout` | 초기 보존 → 새 관리자 서버/API로 기능 이관 후 이전 쓰기 종료 |
| GET | `/api/admin/auth/session` | 초기 보존 → 새 관리자 서버/API로 기능 이관 후 이전 쓰기 종료 |
| GET, PUT | `/api/admin/musics/[id]/guide` | 초기 보존 → 새 관리자 서버/API로 기능 이관 후 이전 쓰기 종료 |
| PUT | `/api/admin/musics/[id]` | 초기 보존 → 새 관리자 서버/API로 기능 이관 후 이전 쓰기 종료 |
| GET | `/api/admin/musics` | 초기 보존 → 새 관리자 서버/API로 기능 이관 후 이전 쓰기 종료 |
| GET, PUT | `/api/admin/sidebar` | 초기 보존 → 새 관리자 서버/API로 기능 이관 후 이전 쓰기 종료 |

API 파일은 각 URL에 대응하는 `src/app{URL}/route.ts`입니다. 원본의 export function/const 선언에서 HTTP 메서드를 대조했습니다.

### 서버 모듈

| 영역 | 원본 파일 |
| --- | --- |
| auth | `src/server/auth/access.ts`<br>`src/server/auth/admin.ts`<br>`src/server/auth/request.ts` |
| queries | `src/server/queries/admin.ts`<br>`src/server/queries/catalog.ts`<br>`src/server/queries/guide.ts`<br>`src/server/queries/music.ts`<br>`src/server/queries/sidebar.ts` |
| mutations | `src/server/mutations/guide.ts`<br>`src/server/mutations/music.ts`<br>`src/server/mutations/sidebar.ts` |
| schemas | `src/server/schemas/music.ts` |

### DB 정의와 이력

| TypeScript export | 실제 테이블 |
| --- | --- |
| `sidebarSettings` | `loudasobi_sidebar_settings` |
| `musics` | `musics` |
| `musicSettings` | `loudasobi_music_settings` |
| `lyricTracks` | `lyric_tracks` |
| `callGuides` | `loudasobi_call_guides` |

LOUDASOBI에는 정식 migration 디렉터리/config가 없습니다. schema는 런타임 부분 매핑이며 이 앱에서 공유 DB migration을 실행하지 않습니다.

### 환경변수 이름

소스의 `process.env` 참조를 기준으로 하며 값은 포함하지 않습니다. 실제 파일의 값·접속 대상·권한·배포 환경 매핑은 미확인입니다. `NODE_ENV`는 런타임 제공 값입니다.

| 이름 | 주 용도/경계 |
| --- | --- |
| `ADMIN_PASSWORD` | 관리자 인증/역할/세션. 서버 전용 |
| `ADMIN_SESSION_SECRET` | 관리자 인증/역할/세션. 서버 전용 |
| `ADMIN_VIEWER_PASSWORDS` | 관리자 인증/역할/세션. 서버 전용 |
| `NEXT_PUBLIC_MONOASOBI_URL` | 공개 URL 설정. 브라우저 노출 가능 값, 빌드 전 주입 |
| `NEXT_PUBLIC_SITE_URL` | 공개 URL 설정. 브라우저 노출 가능 값, 빌드 전 주입 |
| `NODE_ENV` | 런타임 구분 |
| `TURSO_AUTH_TOKEN` | 서버 DB 연결/운영 도구. 읽기·쓰기 권한 실제 확인 필요 |
| `TURSO_DATABASE_URL` | 서버 DB 연결/운영 도구. 읽기·쓰기 권한 실제 확인 필요 |

### 정적 자산·메타데이터·글꼴

- `public/assets/logo.svg`: 1개.
- `public/images/albumart/`: 35개.
- 앱 메타데이터 파일: `src/app/apple-icon.tsx`, `src/app/icon.svg`, `src/app/opengraph-image.tsx`.
- 외부 Pretendard JP CSS를 사용합니다. 별도 추적 로컬 폰트는 없습니다.
- 로컬 앨범아트 35개는 추적 중이지만 현재 AlbumArtwork는 Mono API 또는 디스크 아이콘을 사용합니다. 새 정적 fallback으로 연결하지 않습니다.

### 설정·스크립트·CI/배포

- 현재 npm scripts: `dev`: `next dev`, `build`: `next build`, `start`: `next start`, `lint`: `eslint`, `typecheck`: `next typegen && tsc --noEmit`, `format`: `prettier --write .`, `format:check`: `prettier --check .`.
- 설정 파일: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.gitignore`, `components.json`, `postcss.config.mjs`.
- 별도 scripts 디렉터리나 추적 집중 검사 파일은 없습니다. 새 테스트 프레임워크를 추가하지 않습니다.
- Git 추적 `.github` workflow / `vercel.json` / `.vercel` 설정: 없음. 실제 Vercel 프로젝트·도메인·배포 훅은 로컬 소스만으로 확인되지 않습니다.
- package-lock.json을 보유합니다. 새 workspace 루트의 단일 lockfile로 통합할 예정이며 이번에는 변경하지 않았습니다.
- `.prettierrc.json`, `.prettierignore` 유지. `.env.example`은 없고 `.env.local`은 ignore됨.
- `CLAUDE.md`, `PROJECT_PLAN.md`, admin-setup/ux-review/work-checkpoints 등 문서는 최신 코드와 새 루트 지침에 맞춰 정합화합니다.

### 로컬 제외 항목

- Git ignored 항목(파일명/폴더만 확인): `.DS_Store`, `.env.local`, `.next/`, `next-env.d.ts`, `node_modules/`, `src/.DS_Store`, `tsconfig.tsbuildinfo`.
- `.git/` 자체도 앱 소스로 복사하지 않습니다. Git 이력은 별도 승인된 방식으로 새 저장소에 연결합니다.

## 0단계 이후 목록 갱신 규칙

1. 다음 단계 시작 직전 원본 HEAD와 미추적 포함 status를 재확인합니다.
2. 새 route·API·필드·자산이 생겼다면 이 목록과 reuse-map에 반영합니다.
3. 기존 관리자 종료 때 페이지/API/서버 모듈 목록과 새 관리자 기능을 대조합니다.
4. 이 목록은 구현 존재와 이관 범위의 근거입니다. 브라우저·저장·권한·배포 동작 확인을 대신하지 않습니다.
