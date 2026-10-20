# ASOBI

MONOASOBI와 LOUDASOBI를 함께 관리하는 npm workspace입니다. 현재는 **3단계: 통합 관리자 기본 틀과 첫 저장 흐름까지 로컬 검증을 완료**했습니다. 실제 화면 QA와 검증용 R2 업로드는 남아 있습니다.

## 현재 구조

```text
apps/
  monoasobi/       # 기존 공개 서비스와 기존 관리자
  loudasobi/       # 기존 공개 서비스와 기존 관리자
  adminasobi/      # 통합 관리자: 곡 정보·콜 설정·앨범아트 관리
packages/
  ui/             # 기존 shadcn·공통 브랜드·곡 사이드바
  content-core/   # 가사 타입·검증·콜 계산·시간·추천 정렬
  database/       # 서버 연결·정식 스키마·단일 마이그레이션 이력
  storage/        # 기존 R2 연결·Sharp 앨범아트 처리
docs/
  migration-status.md
  reuse-map.md
  source-inventory.md
package.json
package-lock.json # 전체 workspace의 단일 lockfile
```

`adminasobi`에서 로그인·곡 선택·공통 곡 정보/콜 설정 저장·앨범아트 관리와 공개 갱신 알림을 제공합니다. 기존 관리자 두 개는 기능별 전환을 확인할 때까지 유지합니다. 가사·콜 편집기는 5단계, 나머지 콘텐츠 관리는 6단계입니다. 새 앱 템플릿으로 제품을 다시 생성하지 않았으며, 기존 UI·편집·재생 구현을 공용 위치로 옮기고 import와 연결부만 수정했습니다. 정적 자산 URL은 유지합니다.

## 실행

Node.js **24.14.1**, npm **11.11.0**을 기준으로 확인했습니다. `.nvmrc`는 로컬 Node 패치를 고정하고, root/각 앱의 `engines.node`는 배포 환경을 위해 `24.x`로 지정합니다. Vercel은 지원하는 major 안에서 minor/patch를 관리하므로 로컬과 정확한 패치까지 같다고 보장하지 않습니다. [Vercel Node 버전 문서](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

```sh
nvm use
npm ci
```

설치는 루트에서 한 번 합니다. 앱마다 별도 `npm install`을 실행하거나 lockfile을 새로 만들지 않습니다. 1단계에서는 원본 의존성을 보존했고 2단계에서 공용 UI를 위해 React/React DOM 19.2.8과 관련 타입을 정렬했습니다. 각 앱·공용 UI가 같은 React 인스턴스를 참조하는지 확인했습니다. Next와 Jotai 버전은 앱별로 유지합니다. 나머지 버전도 lockfile 하나로 관리하되 강제 통일하지 않습니다. [npm workspaces 문서](https://docs.npmjs.com/cli/v11/using-npm/workspaces/)

각각 별도 터미널에서 실행합니다.

```sh
npm run dev:mono
```

```sh
npm run dev:loud
```

```sh
npm run dev:admin
```

| 앱 | 기본 주소 | 기존 관리자 |
| --- | --- | --- |
| MONOASOBI | http://localhost:3000 | http://localhost:3000/admin |
| LOUDASOBI | http://localhost:3001 | http://localhost:3001/admin |
| ADMINASOBI | http://localhost:3002 | `/login` → `/musics/[id]` |

기존 서버가 기본 포트를 사용 중이면 포트를 바꿀 수 있습니다. 1단계 실행 확인에는 아래 명령을 사용했습니다.

```sh
npm run dev:mono -- --port 3100 --hostname 127.0.0.1
```

```sh
npm run dev:loud -- --port 3101 --hostname 127.0.0.1
```

관리자는 `npm run dev:admin -- --port 3102 --hostname 127.0.0.1`로 확인했습니다. 로컬 로그인 비밀번호는 `apps/adminasobi/.env.local`의 `ADMIN_PASSWORD`입니다.

Loud `.env.local`의 `NEXT_PUBLIC_MONOASOBI_URL`과 `NEXT_PUBLIC_SITE_URL`, 관리자 `NEXT_PUBLIC_MONOASOBI_URL`도 실제 포트에 맞춥니다. 해당 값은 공개 URL이며 서버 비밀값과 다릅니다.

## 로컬 환경과 데이터

- 환경 파일은 각 앱 루트의 `.env.local`에 둡니다. 실제 값은 Git에서 제외됩니다. 원본 프로젝트의 운영 `.env`를 일괄 복사하지 않습니다.
- 각 앱 `.env.example`에 필요한 키가 있습니다. DB 예시는 두 앱이 같은 로컬 SQLite 파일을 사용하도록 지정했습니다.
- 이 작업 환경에는 `.local/development.sqlite`를 준비했습니다. 기존 0000~0008 마이그레이션을 적용하고 **확인용 곡 ID 0 한 개·가사 한 줄·Loud 전용 설정**만 넣었습니다. 운영 DB의 복제본이 아니며 실제 콘텐츠 전체를 확인한 상태가 아닙니다.
- 관리자/열람 계정과 세션 secret은 각 앱 `.env.local`에 로컬 전용 무작위 값으로 생성했습니다. 직접 확인하려면 해당 파일의 `ADMIN_PASSWORD` 등을 로컬에서 원하는 값으로 바꾸고 서버를 재시작합니다. 실제 값은 문서·로그·커밋에 옮기지 않습니다.
- R2 키/접속 정보는 복사하지 않았습니다. 소설 본문·만화 파일·R2 앨범아트의 실제 로딩은 미확인입니다. Mono의 기존 로컬 이미지 fallback은 유지됩니다.
- 실제 콘텐츠를 연결하는 검증은 별도 복제 DB·분리된 파일 저장 대상에서 진행합니다. 현재 로컬 샘플 DB로 운영 데이터 마이그레이션을 완료했다고 보지 않습니다.

새 checkout에서 로컬 확인 환경을 준비할 경우, `.env.example`을 각 앱의 `.env.local`로 복사해 로컬 인증값을 채우고 `.local/` 디렉터리를 만듭니다. 이미 있는 `.env.local`과 DB를 덮어쓰지 마세요. **TURSO_DATABASE_URL이 `file:`로 시작하는 로컬 파일인지 확인한 경우에만** database 패키지 디렉터리에서 기존 마이그레이션 명령으로 빈 로컬 DB를 초기화할 수 있습니다.

```sh
# asobi 루트에서 시작합니다. .env.local 설정은 앞에서 준비해야 합니다.
mkdir -p .local
cd packages/database
node --env-file=../../apps/monoasobi/.env.local --run db:migrate
```

이 명령은 schema를 구성하며 콘텐츠를 채우지 않습니다. 기존 seed·backfill·R2 이전 도구는 자동 실행하지 않습니다. 개발/프리뷰가 운영 DB를 수정하는 설정으로 연결되지 않게 구분합니다.

마이그레이션 생성·적용·Studio 진입점은 루트의 `db:generate` / `db:migrate` / `db:studio`이며, 실행 전에 대상 환경변수를 명시적으로 설정해야 합니다. 앱에는 독립적인 generate/migrate 명령을 남기지 않았습니다.

## 공통 코드의 소유 위치

| 패키지 | 실제 역할 | 소비자와 경계 |
| --- | --- | --- |
| `@asobi/ui` | 기존 shadcn 기본 부품·cn·LOUDASOBI 공용 브랜드 팔레트/라이트·다크 테마·Tailwind 매핑 | Loud·새 관리자에서 사용. 곡 목록 구현도 공유. 화면 높이/스크롤 CSS·아이콘 선택기는 앱에 유지. Mono는 7단계 UI 전환에서 같은 색상 사용 |
| `@asobi/content-core` | 공통 가사 타입·콜/가사 표시 계산·카탈로그 검증·시간·영어 필드 제거·순수 추천 정렬 | 세 앱에서 실제 사용. DB·인증·Next 캐시를 import하지 않음. Mono 편집 입력과 Loud 공개 타임라인의 검증 차이 보존 |
| `@asobi/database` | 정식 schema/relations·서버 전용 지연 연결·Drizzle config·0000~0008 SQL/journal/snapshots | 세 앱 서버에서 사용. query/mutation과 공개 필터·캐시는 각 앱에 유지. 운영 DB 적용은 별도 승인 |
| `@asobi/storage` | 기존 R2 연결·파일 읽기/쓰기·Sharp 앨범아트 정규화 | Mono 보호 파일 읽기와 관리자 업로드의 공용 server-only 구현. 버킷 공개·DNS 설정은 별도 |

공용 패키지는 별도 빌드/발행 없이 TypeScript 소스를 제공하고 각 Next 앱이 컴파일합니다. 앱은 package name으로 import하며 패키지는 앱 내부 코드를 import하지 않습니다. 실제 production 번들·배포 검증은 아직 수행하지 않았습니다.

공통 시간 코드는 소유 위치만 옮겼습니다. 가사 0.01초 계산과 콜의 소수 넷째 자리 계산을 같은 함수로 합치지 않았습니다. 스키마·마이그레이션 파일도 재생성하지 않았습니다.

## 검사

루트에서 모든 앱과 공용 패키지의 검사를 실행합니다.

```sh
npm run lint
npm run typecheck
npm run check:core
```

`typecheck`는 앱별 Next route 타입 생성 후 TypeScript를 검사합니다. 특정 앱만 확인할 수도 있습니다.

```sh
npm run lint --workspace=@asobi/monoasobi
npm run typecheck --workspace=@asobi/loudasobi
```

일상 검사로 production build를 실행하지 않습니다. 실제 배포 빌드·브라우저 조작·재생·인증 저장·운영 설정은 별도 검증입니다.

## 관리자 저장과 공개 갱신

공통 곡 정보는 `/api/admin/musics/[id]`, 콜 설정은 `/settings`, 앨범아트는 `/album-art`로 각각 저장합니다. 각 섹션의 필드만 갱신합니다. 가사·콜 편집 버튼은 5단계 연결 전까지 비활성화 상태입니다.

공개 앱별 `REVALIDATION_SECRET`과 관리자 서버의 해당 `MONOASOBI_REVALIDATION_SECRET`/`LOUDASOBI_REVALIDATION_SECRET`을 맞추고 `MONOASOBI_URL`/`LOUDASOBI_URL`에 각 서버 주소를 설정합니다. 비밀값에는 `NEXT_PUBLIC_`를 붙이지 않습니다. 저장 후 각 앱이 자기 카탈로그를 갱신하며, 알림 실패는 저장 성공과 따로 표시하고 재시도할 수 있습니다. 이미 열린 화면의 자동 갱신은 8단계 작업입니다.

앱 내 곡 선택·로그아웃은 미저장 확인과 저장 중 이동 차단을 적용합니다. 새로고침/문서 이탈에는 beforeunload가 적용됩니다. App Router의 같은 문서 내 뒤로 가기 차단은 5단계에서 보강할 미완료 항목입니다.

작은 기존/집중 검사는 다음 명령으로 실행합니다.

```sh
npm run check:security --workspace=@asobi/adminasobi
npm run check --workspace=@asobi/storage
node --test apps/monoasobi/scripts/activeLyric.test.mjs
```

세 앱의 로컬 개발 서버가 3100/3101/3102에서 실행 중이면 아래 명령으로 합성 데이터 저장 흐름을 재확인할 수 있습니다. **ASOBI의 `.local/development.sqlite`와 loopback 주소만 허용하며, ID 0의 곡·설정을 잠시 수정한 뒤 원래 필드 값으로 복원합니다.** 저장 시각은 갱신됩니다. 실제 콘텐츠를 연결한 DB에서는 실행하지 마세요.

```sh
node apps/adminasobi/scripts/local-flow-check.mjs
```

실제 R2 업로드/교체·시각/모바일/브라우저 입력 QA·production build·운영 전환은 별도 검증입니다.

## 이력과 다음 작업

- 두 원본 HEAD를 squash하지 않는 subtree로 연결했습니다. 기존 커밋 ID는 보존됩니다. 과거 커밋 내부 경로는 원래 저장소 경로이며 apps 경로로 과거 이력 전체를 재작성하지 않았습니다.
- 원본 폴더/원격은 그대로입니다. 새 저장소의 원격은 아직 없고 푸시하지 않았습니다.
- 요청받은 단계의 작업은 검증 후 세부 기능·작업 단위로 로컬 커밋합니다. 메시지는 간결한 한글 한 줄이며, 푸시는 별도 요청이 필요합니다. 커밋별 이력은 docs/migration-status.md와 Git 로그를 봅니다.
- 현재 3단계 로컬 검증과 세부 커밋을 마쳤으며 화면 QA를 기다립니다. 다음은 4단계 독립 앨범아트 주소·크기별 제공입니다. 실제 도메인·버킷·공개 범위가 필요하며 승인 없이 설정을 변경하지 않습니다.

작업 전 [AGENT.md](AGENT.md)를 읽고, [현재 진행·검증 결과](docs/migration-status.md), [재사용 지도](docs/reuse-map.md), [원본 목록](docs/source-inventory.md)을 확인하세요.
