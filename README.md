# ASOBI

MONOASOBI와 LOUDASOBI를 함께 관리하는 npm workspace입니다. 현재는 **2단계: 공통 UI·도메인 코드·DB 정의 추출까지 로컬 검증을 완료**했습니다. 통합 관리자 앱은 이후 단계에서 기존 구현을 이관해 구성합니다.

## 현재 구조

```text
apps/
  monoasobi/       # 기존 공개 서비스와 기존 관리자
  loudasobi/       # 기존 공개 서비스와 기존 관리자
packages/
  ui/             # 기존 shadcn 부품 16개·cn·공통 테마 매핑
  content-core/   # 가사 타입·검증·콜 계산·시간·추천 정렬
  database/       # 서버 연결·정식 스키마·단일 마이그레이션 이력
docs/
  migration-status.md
  reuse-map.md
  source-inventory.md
package.json
package-lock.json # 전체 workspace의 단일 lockfile
```

`adminasobi`는 아직 만들지 않았습니다. 기존 관리자 두 개는 기능별 전환을 확인할 때까지 유지합니다. 새 앱 템플릿으로 제품을 다시 생성하지 않았으며, 기존 UI·편집·재생 구현을 공용 위치로 옮기고 import와 연결부만 수정했습니다. 정적 자산 URL은 유지합니다.

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

| 앱 | 기본 주소 | 기존 관리자 |
| --- | --- | --- |
| MONOASOBI | http://localhost:3000 | http://localhost:3000/admin |
| LOUDASOBI | http://localhost:3001 | http://localhost:3001/admin |

기존 서버가 기본 포트를 사용 중이면 포트를 바꿀 수 있습니다. 1단계 실행 확인에는 아래 명령을 사용했습니다.

```sh
npm run dev:mono -- --port 3100 --hostname 127.0.0.1
```

```sh
npm run dev:loud -- --port 3101 --hostname 127.0.0.1
```

Loud `.env.local`의 `NEXT_PUBLIC_MONOASOBI_URL`과 `NEXT_PUBLIC_SITE_URL`도 실제 포트에 맞춥니다. 해당 값은 공개 URL이며 서버 비밀값과 다릅니다.

## 로컬 환경과 데이터

- 환경 파일은 각 앱 루트의 `.env.local`에 둡니다. 실제 값은 Git에서 제외됩니다. 원본 프로젝트의 운영 `.env`를 일괄 복사하지 않습니다.
- `apps/monoasobi/.env.example`, `apps/loudasobi/.env.example`에 필요한 키가 있습니다. DB 예시는 두 앱이 같은 로컬 SQLite 파일을 사용하도록 지정했습니다.
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
| `@asobi/ui` | 기존 shadcn 기본 부품·cn·LOUDASOBI 공용 브랜드 팔레트/라이트·다크 테마·Tailwind 매핑 | Loud 공개/기존 관리자에서 사용. 화면 높이/스크롤 CSS·아이콘 선택기는 앱에 유지. Mono는 7단계 UI 전환에서, 새 관리자는 생성 시부터 같은 색상 사용 |
| `@asobi/content-core` | 공통 가사 타입·콜/가사 표시 계산·카탈로그 검증·시간·영어 필드 제거·순수 추천 정렬 | 두 앱에서 실제 사용. DB·인증·Next 캐시를 import하지 않음. Mono 편집 입력과 Loud 공개 타임라인의 검증 차이 보존 |
| `@asobi/database` | 정식 schema/relations·서버 전용 지연 연결·Drizzle config·0000~0008 SQL/journal/snapshots | 두 앱 서버에서 사용. query/mutation과 공개 필터·캐시는 각 앱에 유지. 운영 DB 적용은 별도 승인 |

공용 패키지는 별도 빌드/발행 없이 TypeScript 소스를 제공하고 각 Next 앱이 컴파일합니다. 앱은 package name으로 import하며 패키지는 앱 내부 코드를 import하지 않습니다. 실제 production 번들·배포 검증은 아직 수행하지 않았습니다.

공통 시간 코드는 소유 위치만 옮겼습니다. 가사 0.01초 계산과 콜의 소수 넷째 자리 계산을 같은 함수로 합치지 않았습니다. 스키마·마이그레이션 파일도 재생성하지 않았습니다.

## 검사

루트에서 두 앱의 기존 검사를 실행합니다.

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

## 이력과 다음 작업

- 두 원본 HEAD를 squash하지 않는 subtree로 연결했습니다. 기존 커밋 ID는 보존됩니다. 과거 커밋 내부 경로는 원래 저장소 경로이며 apps 경로로 과거 이력 전체를 재작성하지 않았습니다.
- 원본 폴더/원격은 그대로입니다. 새 저장소의 원격은 아직 없고 푸시하지 않았습니다.
- 요청받은 단계의 작업은 검증 후 세부 기능·작업 단위로 로컬 커밋합니다. 메시지는 간결한 한글 한 줄이며, 푸시는 별도 요청이 필요합니다. 커밋별 이력은 docs/migration-status.md와 Git 로그를 봅니다.
- 다음은 3단계 통합 관리자 기본 틀과 첫 저장 흐름입니다. 기존 탐색·폼·인증을 이관하며 새 CMS/편집기를 재개발하지 않습니다.

작업 전 [AGENT.md](AGENT.md)를 읽고, [현재 진행·검증 결과](docs/migration-status.md), [재사용 지도](docs/reuse-map.md), [원본 목록](docs/source-inventory.md)을 확인하세요.
