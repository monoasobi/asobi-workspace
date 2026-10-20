# ASOBI 이관 진행 기록

상세 실행 원칙은 [AGENT.md](../AGENT.md)를 따릅니다. 이 문서는 실제 진행 상태와 확인 결과를 기록합니다.

## 현재 상태

- **1단계 진행 중 — 원본 Git 이력 이관과 npm workspaces 구성.** 0단계는 완료했습니다. 확인일: 2026-10-20 KST.
- 사용자 요청: 단계마다 작업 내용을 먼저 쉽게 설명하고 진행. 이번 실행 범위는 0단계입니다.
- 새 프로젝트에는 지침과 이번 감사 문서만 있습니다. 앱 소스 복사, workspace 구성, Git 초기화는 아직 하지 않았습니다.
- 원본 두 프로젝트의 코드·설정·Git 이력은 변경하지 않았습니다. 설치·빌드·서버 기동·DB/R2 접속·DNS 변경·배포·커밋·푸시는 하지 않았습니다.
- 전체 페이지/API·환경변수 이름·정적 자산·스크립트·마이그레이션 목록: [source-inventory.md](source-inventory.md).
- 기존 구현의 이동·소유 관계: [reuse-map.md](reuse-map.md).

| 단계 | 내용 | 상태 |
| --- | --- | --- |
| 0 | 감사와 기준선 | 완료 |
| 1 | Git 이력 이관 방식 확정, npm workspaces에서 기존 앱 실행 | 진행 중 |
| 2 | 공통 UI·순수 도메인 코드·DB 정의 추출 | 미착수 |
| 3 | 통합 관리자 기본 틀과 첫 저장 흐름 | 미착수 |
| 4 | 독립 앨범아트 주소와 크기별 제공 | 미착수 |
| 5 | 가사·콜 편집기 별도 페이지 이관 | 미착수 |
| 6 | 원작·서적·추천 등 관리자 나머지 기능 | 미착수 |
| 7 | MONOASOBI 공개 UI를 shadcn으로 전환 | 미착수 |
| 8 | 앱 간 저장 반영·캐시·환경 검증 | 미착수 |
| 9 | Vercel 연결·운영 전환·중복 관리자 종료 | 미착수 |

## 원본 기준선

1단계 승인 기록(2026-10-20): 사용자가 squash하지 않는 subtree 방식과 로컬 Git 초기화·기준 문서 커밋 1개·두 앱 이관 커밋 2개, 총 3개 커밋을 승인했습니다. 새 원격 저장소는 아직 없으며 로컬 작업부터 진행합니다. workspace 설정 변경은 추가 요청 전까지 커밋하지 않습니다. 푸시·원격 생성·빌드·운영 작업 승인은 포함하지 않습니다.

| 항목 | MONOASOBI | LOUDASOBI |
| --- | --- | --- |
| 실제 경로 | `/Users/nine/Documents/work/monoasobi-react-ts-web` | `/Users/nine/Documents/work/loudasobi` |
| 브랜치 | `main` | `main` |
| HEAD | `2241c2efa0af20c9f43660c732527aa5ef7cd5ec` | `a9ade435c0232c485cd5ab0962d842cc881879e4` |
| HEAD 내용 | 관리자 곡 선택 사이드바 통합 및 편집 화면 개편 | 박수 패턴 인디케이터와 박자 점등 추가 |
| origin | `https://github.com/monoasobi/monoasobi-react-ts-web.git` | `https://github.com/ninefloor/loudasobi.git` |
| 작업 트리 | tracked 변경 없음, 비추적 파일 없음 | tracked 변경 없음, 비추적 파일 없음 |
| 추적 파일 수 | 319 | 222 |
| HEAD에서 도달 가능한 커밋 수 | 176 | 18 |
| 로컬 upstream 대비 ahead/behind | 0 / 0 | 0 / 0 |

upstream 비교는 로컬에 저장된 원격 추적 ref 기준입니다. fetch 또는 원격 서버 조회는 하지 않았으므로 GitHub의 현재 상태까지 확인했다는 의미는 아닙니다. ignored 파일은 별도로 조사했으며 제품 소스와 구분했습니다.

작업 시작 때와 감사 종료 때 HEAD·전체 status·추적 파일 내용을 다시 대조했고 모두 동일했습니다. 다음 단계 시작 때도 재확인하고, 달라지면 최신 원본을 기준으로 목록을 갱신합니다.

## 실제 실행 환경과 구성 차이

아래 버전은 원본 `package.json`뿐 아니라 설치된 `node_modules/*/package.json`에서도 확인했습니다.

| 항목 | MONOASOBI | LOUDASOBI |
| --- | --- | --- |
| 패키지 이름 | `nextjs-migration` | `loudasobi` |
| Next.js | 16.2.9 | 16.3.5 |
| React / React DOM | 19.2.4 | 19.2.8 |
| Jotai | 2.20.1 | 3.0.0 |
| Zod | 4.4.3 | 4.6.5 |
| TypeScript | 5.9.3 | 5.9.3 |
| libSQL client | 0.17.4 | 0.18.0 |
| Drizzle ORM | 0.45.2 | 0.45.2 |
| react-player | 3.4.0 | 3.4.0 |
| UI | Radix Themes 3.3.0 선언, CSS Modules | shadcn `radix-nova`, Radix, Tailwind 4.3.3 설치 |
| Next 옵션 | `cacheComponents`, React Compiler infer, realpath 기반 앱 디렉터리 Turbopack root | 기본 Next 설정 |
| Node 고정 파일 | `.nvmrc`: 22.18.0 | 없음 |
| 타입 검사 script | 없음. 이번에는 tsc 직접 실행 | `next typegen && tsc --noEmit` |

감사 환경의 실제 Node는 `v24.14.1`, npm은 `11.11.0`입니다. MONOASOBI `.nvmrc`와 다릅니다. 이 결과를 근거로 신규 프로젝트 Node 버전을 이미 확정했다고 보지 않습니다. 1단계에서 설치 버전의 요구 조건·배포 지원을 확인하고 결정합니다.

1단계는 각 앱의 기존 실행을 우선 복원합니다. 공유 패키지를 연결할 때 React·타입·Jotai 호환성을 확인하며, 버전 통일을 이유로 상태/타임라인 코드를 다시 작성하지 않습니다. Turbopack root와 앱 밖 소스 포함 설정은 설치된 Next 문서를 읽고 필요한 범위만 수정합니다.

## 이미 구현되어 있어 보존할 최신 기능

- MONOASOBI: 선택곡에 연결된 음악·소설·만화·가사·서적 탐색, 선택 복원, 미저장/저장 중 이동 보호, 앨범아트 업로드, SRT 내보내기.
- MONOASOBI: 세로 가사 타임라인, 영상/타임라인 크기 조절, 재생 위치 스냅과 Cmd/Ctrl 예외, 영어 해석·영어 독음의 타임라인 내 편집, 가사 경계 판정 개선.
- MONOASOBI: 모바일 영상 확대·가로 전환·상단 레이어, 소설/만화 읽던 위치, 비공개 독자 인증, Agent 읽기 API.
- LOUDASOBI: 곡 사이드바 정렬·그룹·스크롤 복원, 설정/콜 embedded 작업 화면, 미저장/저장 중 보호, 별도 콜 URL도 존재.
- LOUDASOBI: guide JSON v2, 가사 스냅샷/연결 검증, 콜과 sync_offset 트랜잭션 저장, revision 충돌 거부, undo/redo·초안 복사.
- LOUDASOBI: 최근 콜 아이콘·색상·가이드 표시, 마지막 펄스 직후 자르기, 박수 패턴 인디케이터·박자 점등, ko/ja/en, 추천 목록 편집.

기능 존재는 실제 코드와 최근 커밋에서 확인한 것입니다. 이번에 브라우저/재생/인증 저장까지 다시 검증한 것은 아닙니다.

## 감사에서 확인한 차이와 단계별 처리

| 항목 | 현재 코드의 사실과 근거 | 이관 시 처리 |
| --- | --- | --- |
| 최종 관리자 화면 | Loud `AdminMusicManager`는 info/guide 전환과 React Activity로 편집 화면을 유지. Mono 가사 독립 페이지에는 공통 관리자 곡 사이드바가 없음 | 3·5단계: 기존 탐색/폼/편집기 재사용. 최종은 같은 사이드바 + 곡 상세 좌우 정보 + 가사/콜 각각 별도 URL. 현재 탭 유지 구조를 최종 설계로 복사하지 않음 |
| ID 0 복원 | Loud `src/atoms/adminSidebar.ts`의 selectedId가 `.positive()`여서 0은 저장값 재읽기 때 검증 실패. Mono 곡 ID/API와 실제 기존 검사에는 0 사용 | 3단계: 곡 ID 검증은 0 포함 계약으로 맞춤. DB ID 재배정 금지. 다른 종류의 ID 검증까지 무조건 일괄 변경하지 않음 |
| 가사 동시 저장 | Mono lyricTrackSchema/PUT/updateLyricTrack에 클라이언트 revision 입력·비교가 없음. 트랜잭션에서 현재 행 존재만 읽고 입력 가사 전체를 저장 | 5단계: 오래된 가사 초안의 덮어쓰기 방지를 최소 변경으로 보완. 현재부터 이미 충돌 보호가 있다고 보고하지 않음 |
| 가사 검증 차이 | Mono 가사 스키마는 줄별 시간과 ID 중복을 검사. Loud linesSchema는 줄 사이 겹침도 거부 | 2·5단계: 공통화 과정에서 기존 입력 허용 범위를 무심코 바꾸지 않음. 공유 기본 타입과 소비자별 검증을 구분 |
| 인증 경계 차이 | Loud query/mutation은 내부 세션/역할 확인 및 write route Origin 검사. Mono admin query/mutation은 주로 page/API 호출자가 보호하고 공통 write helper에 Origin 검사가 없음 | 3·6단계: Loud의 기존 access/request/auth 패턴 재사용. 통합 관리자 query마다 인증, 모든 write에 권한·동일 출처 검증. 새 cookie/audience 적용 |
| 서로 다른 캐시 | Mono `public-catalog` 태그 + `use cache` hours. Loud 공개 홈은 connection() 후 DB 조회, focus/storage로 router.refresh | 3단계 최소 연결, 8단계 완성. 다른 배포의 캐시는 해당 앱이 무효화. 다른 도메인에 storage 이벤트가 전달된다고 가정하지 않음 |
| 앨범아트 경로 | Mono DB 현재 키 검증 → R2 → immutable 1년 응답. Mono Next Image는 blob 외 기본 최적화, Loud는 unoptimized로 Mono API 직접 사용 | 4단계: 공용 loader와 독립 assets 주소. 기존 경로는 전환 확인까지 보존. 현재 경로의 최적화/캐시가 전부 꺼져 있다고 단정하지 않음 |
| 고해상도 한계 | 현재 업로드 normalize는 최대 1000px, 작은 원본 확대 안 함. 기존 로컬 파일은 그대로 이전된 이력이 있음 | 4단계: 현재 객체 해상도를 조사한 뒤 제공 크기 결정. 작은 기존 파일은 URL 파라미터만으로 디테일 복원 불가. 원본 정책/제한 변경은 별도 검토 |
| 기존 문서의 시차 | Mono `docs/english-lyrics.md`는 관리자 영어 필드 숨김/별도 입력을 설명하지만 현재 타임라인은 직접 편집. Loud admin-setup/ux-review에는 독립 콜 화면 중심의 이전 설명이 일부 남음 | 이관 문서/AGENTS는 최신 코드와 새 AGENT.md 기준으로 정합화. 오래된 미구현 표기만 보고 기능을 다시 만들지 않음 |
| 정식 DB와 부분 매핑 | Mono 11개 테이블/relations와 0000~0008 마이그레이션 보유. Loud는 5개 테이블의 런타임 부분 매핑 | 2단계: Mono 정의/이력을 database로 인계하고 Loud 소비자 연결. 보관용 loudasobi_lyric_tracks는 서비스 fallback으로 사용하지 않음 |
| 이미지 공개 범위 | 같은 R2 연결 코드가 앨범아트와 소설/만화를 처리. 소설 isPublished는 출판 원작의 독자 인증 조건에도 사용 | 4단계: 기존 버킷 전체 공개 금지. 출판 여부를 Loud publish와 같은 뜻으로 합치지 않음. 공개 앨범아트와 보호 콘텐츠 분리 |

이 표는 새 기능 확장 목록이 아닙니다. 확정한 보존·인증·저장 계약을 지키기 위해 실제 코드 차이를 인계하는 목록이며, 0단계에서 수정하지 않았습니다.

## 이관 대상과 제외 대상

- 초기 앱 이관은 Git 추적 제품 소스·설정·자산·문서·기존 집중 검사와 Drizzle 이력을 기준으로 합니다. 세부 소유 위치는 reuse-map을 따릅니다.
- 두 앱의 기존 관리자는 새 관리자 기능별 전환 전까지 임시 유지합니다. 제거 조건은 해당 기능 QA, 저장/갱신, 권한, 운영 전환 확인입니다. 원본 폴더는 보존합니다.
- `.env`, `.env.local` 등 실제 환경값, `.git`, `node_modules`, `.next`, `next-env.d.ts`, `*.tsbuildinfo`, `.backups`, 로컬 DB 복제본, `public/novel`, 실험/발표 출력물은 일괄 복사하지 않습니다. 원본 위치에서 보존합니다.
- Mono `.env.example`은 이름/설명만 검토해 새 예시로 재사용합니다. Loud는 `.env*` 전부 ignore하므로 새 root에서 예시 파일만 허용하는 규칙이 필요합니다.
- Loud `src/data/preview`·로컬 앨범아트는 추적 중이지만 현재 공개 코드에서 fallback으로 사용하지 않습니다. 최초 이관은 보존용으로 구분하고, 참조/검증 용도를 확인한 뒤 제거합니다. 공개 연결을 되살리지 않습니다.
- Loud `output/` 디렉터리는 존재하지만 이번 조사에서 파일은 없었습니다. 산출물이 생겨도 제품 소스에 포함하지 않습니다.
- 보존이 필요한 미추적 제품 소스가 없으므로 이번 단계에서 미커밋 파일 포함 여부를 물을 필요는 없습니다.

## 실행한 검증

| 범위 | 명령/방법 | 결과 |
| --- | --- | --- |
| Mono lint | 원본에서 `npm run lint` | 통과, exit 0 |
| Mono 타입 | 원본에서 `./node_modules/.bin/tsc --noEmit --incremental false` | 통과, exit 0 |
| Loud lint | 원본에서 `npm run lint` | 통과, exit 0 |
| Loud 타입 | 원본에서 `./node_modules/.bin/tsc --noEmit --incremental false` | 통과, exit 0 |
| 소스 목록 | Git 추적 목록, page/route HTTP export, config·환경변수 참조·자산·스크립트 대조 | source-inventory에 기록 |
| 문서 정합성 | 원본 경로 존재, 라우트 목록/개수, 문서 링크, Markdown 코드 블록, 공백 확인 | 통과. 페이지 14개·API route 31개 목록화, 재사용 원본 경로 존재 확인 |
| 원본 보존 | 시작/종료 HEAD·전체 status·추적 파일 SHA-256 대조 | 통과. Mono 319개·Loud 222개 추적 파일의 경로/내용과 HEAD/status 동일 |

타입 검사는 기존 `.next` 타입 파일을 사용했고, 원본 파일 생성을 피하기 위해 `next typegen`과 incremental 캐시 쓰기를 하지 않았습니다. 새 위치의 route typegen·개발 실행·빌드 포함 여부를 검증한 결과는 아닙니다. 기존 집중 검사 스크립트는 목록화했으며 실행하지 않았습니다.

미검증: 새 프로젝트 실행/설치, 새 배포 빌드, 브라우저·모바일·실제 재생, 인증 저장, 복제/운영 DB 스키마·권한·데이터, 실제 R2 객체, 이미지 MISS/HIT·속도, Cloudflare/DNS/Images 설정, Vercel 프로젝트·환경변수·요금 조건. 원본의 과거 검증 기록을 이번 실행 결과로 옮겨 적지 않습니다.

## 결정·승인과 다음 단계

- 확정: 세 앱, npm workspaces, Loud shadcn UI 재사용, 별도 가사/콜 URL, 관리자 사이드바 유지, 기존 코드 최대 활용, 원본 보존.
- 이번 승인/실행: 0단계 읽기 감사, 새 프로젝트 문서 작성, 원본을 바꾸지 않는 lint/타입 기준선 확인.
- 미승인/미실행: Git 초기화·이관 커밋·새 원격 생성/연결·푸시, 빌드, 운영 DB/R2/DNS/배포.
- 도메인명/버킷·이미지 공개 범위는 4단계, 허용 갱신 지연은 8단계, 운영 전환은 9단계에서 구체화합니다. 0단계의 장애물은 아닙니다.

1단계 시작 시 먼저 사용자에게 설명할 내용:

1. 두 앱을 `apps/monoasobi`, `apps/loudasobi`에 옮기고 각각 실행할 수 있도록 npm workspace를 구성합니다. 공통화와 UI 전환은 아직 하지 않습니다.
2. 두 원본은 서로 다른 Git root/이력을 가집니다. **추천은 squash하지 않는 subtree 이관**으로 기존 커밋 ID를 보존해 한 저장소에 연결하는 방법입니다. 로컬 원본을 읽기 원격으로 사용하면 GitHub 변경 없이 준비할 수 있습니다. 과거 커밋 내부 경로는 원래 경로이며, 과거 전체를 apps 경로로 다시 쓴 이력은 아닙니다.
3. 대안은 경로를 apps 아래로 재작성하는 history import입니다. 경로별 이력은 편해지지만 기존 커밋 ID가 바뀌고 별도 도구/검증이 필요합니다. 단순 스냅샷 복사는 과거 이력을 새 저장소에 연결하지 않으므로 기본 추천이 아닙니다.
4. 이력 이관은 Git 초기화와 커밋이 필요합니다. 구체적인 방법/커밋 범위를 사용자에게 확인하고 실행합니다. 새 원격 저장소 주소/공개 범위도 확인하되, 원격이 없어도 승인된 로컬 workspace 작업은 가능합니다. 자동으로 원격 생성·푸시하지 않습니다.
5. 이관 직전 원본 HEAD/status를 재확인하고, 앱별 package 이름/포트/기존 config를 보존하며 루트 lockfile을 구성합니다. `.env` 값을 복사해 운영 DB 쓰기가 가능한 개발 환경을 자동으로 만들지 않습니다.

되돌리기: 이번 단계는 새 docs 파일만 추가했으므로 이 문서들을 제거하면 됩니다. 원본 저장소·데이터·서비스 변경을 되돌릴 작업은 없습니다.
