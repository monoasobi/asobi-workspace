# ASOBI 이관 진행 기록

상세 실행 원칙은 [AGENT.md](../AGENT.md)를 따릅니다. 이 문서는 실제 진행 상태와 확인 결과를 기록합니다.

## 현재 상태

- **8단계 코드/로컬 검증 및 운영 DB·R2 연결 완료. 후속 승인으로 앨범아트 36곡 운영 키 전환·기존 배포 호환/캐시 검증 완료.** 사용자 QA는 진행 중이며 앨범아트는 승인됐습니다. 9단계 배포 준비 문서를 마련했고 실제 GitHub 연결/푸시/배포는 사용자가 진행합니다. production build와 기기별 전체 QA는 미검증입니다. 확인일: 2026-10-20 KST.
- 사용자 요청: 단계마다 작업 내용을 먼저 쉽게 설명하고 진행. 현재 실행 범위는 승인된 앨범아트 운영 전환과 실제 운영 환경변수/사용자 배포 인계입니다. 후속 사용자 결정으로 혼용 금지를 철회하고 소설 문법 CSS Modules 유지 + Themes 부품의 HTML/Tailwind·공용 shadcn 전환을 진행했습니다. 사용자 조정 외형 보존 계약은 유지합니다. 사용자 QA·검토사항은 사용자가 별도로 진행 중이며 결정이 모이면 함께 반영합니다. 세부 작업별 검증 후 로컬 커밋을 남기며, 이번에 제공된 최신 사용자 지침에 따라 신규 제목은 간결한 한글 한 줄을 사용합니다.
- 브랜드는 사용자 결정(2026-10-20)에 따라 LOUDASOBI 팔레트로 통일합니다. 공용 색상 정의는 `packages/ui/src/brand.css`, Tailwind 연결은 `styles.css`이며 Loud와 새 관리자에서 사용합니다. Mono 일반 공개 UI에도 적용했으며 소설 읽기 화면은 보존 계약 예외입니다.
- 세 앱이 공용 `ui`, `content-core`, `database`, `storage`, `loudasobi-view`를 역할에 맞게 사용합니다. lint·타입·기존/집중 검사·로컬 저장/공개 반영 확인을 마쳤습니다. 상세 결과는 아래 3~8단계 기록과 [README](../README.md)를 봅니다.
- **후속 운영 DB 연결 완료:** 사용자 명시 요청으로 세 앱의 DB URL/토큰을 원본과 같은 운영 Turso에 연결하고 로컬 서버를 재시작했습니다. 공개 홈·관리자 36곡/상세 조회를 확인했으며 데이터/스키마는 수정하지 않았습니다. 후속 요청으로 Mono R2도 연결했고 원격 소설·만화 목록/첫 이미지 읽기와 로컬 Markdown 4개를 검증했습니다. 배포·전체 QA는 별도입니다.
- 원본 두 프로젝트의 코드·설정·Git 이력은 변경하지 않았습니다. 운영 DB는 승인된 앨범아트 키/수정 시각만 교체했습니다. 기존 R2 파일 삭제·빌드·배포·원격 연결·푸시는 하지 않았습니다. 사용자 승인으로 새 R2 버킷에 앨범아트만 복사/업로드하고 assets DNS와 Images Free를 연결했습니다. 공개 서비스의 곡 목록/이미지 API는 읽기 조회했습니다. 이관용 3개 커밋은 보존하며, 추가 승인에 따라 아래 세부 작업 커밋 기록으로 이어갑니다.
- 전체 페이지/API·환경변수 이름·정적 자산·스크립트·마이그레이션 목록: [source-inventory.md](source-inventory.md).
- 기존 구현의 이동·소유 관계: [reuse-map.md](reuse-map.md).

| 단계 | 내용 | 상태 |
| --- | --- | --- |
| 0 | 감사와 기준선 | 완료 |
| 1 | Git 이력 이관 방식 확정, npm workspaces에서 기존 앱 실행 | 완료 — 로컬 샘플 기준 |
| 2 | 공통 UI·순수 도메인 코드·DB 정의 추출 | 로컬 검증 완료 — 배포 빌드 미검증 |
| 3 | 통합 관리자 기본 틀과 첫 저장 흐름 | 로컬 검증 완료 — 화면 QA 대기 |
| 4 | 독립 앨범아트 주소와 크기별 제공 | 36곡 고해상도 운영 키 전환·구버전 200px 호환/캐시 검증·사용자 앨범아트 승인 완료 — 새 앱 배포 대기 |
| 5 | 가사·콜 편집기 별도 페이지 이관 | 로컬 검증 완료 — 화면·입력·재생 QA 대기 |
| 6 | 원작·서적·추천 등 관리자 나머지 기능 | 로컬 검증 완료 — 사용자 QA·실제 콘텐츠/R2 통합 검증 대기 |
| 7 | MONOASOBI 공개 UI를 shadcn으로 전환 | 코드/로컬 검증 완료 — 소설 보존 예외·사용자 QA 대기 |
| 8 | 기존 캐시 무효화·자동 갱신 제거 | 코드/로컬 검증 완료 — 환경 분리 제외, 배포/실제 재생 QA 대기 |
| 9 | Vercel 연결·운영 전환·중복 관리자 종료 | 환경변수/배포 인계 준비 — 사용자 배포 후 기존 관리자 종료 |

## 원본 기준선

1단계 승인 기록(2026-10-20): 사용자가 squash하지 않는 subtree 방식과 로컬 Git 초기화·기준 문서 커밋 1개·두 앱 이관 커밋 2개, 총 3개 커밋을 승인했습니다. 새 원격 저장소는 아직 없으며 로컬 작업부터 진행합니다. 당시에는 workspace 설정 변경을 추가 요청 전까지 커밋하지 않기로 했으며, 이 제한은 아래 2026-10-20 세부 작업 커밋 승인으로 갱신됐습니다. 푸시·원격 생성·빌드·운영 작업 승인은 포함하지 않습니다.

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

## 0단계 종료 시점의 결정·승인과 다음 단계

아래는 0단계 종료 시점의 기록입니다. Git 작업 승인과 실행 상태는 이 문서 앞의 1단계 승인 기록 및 아래 실행 결과가 우선합니다.

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

0단계 되돌리기: 당시에는 새 docs 파일만 추가했습니다. 원본 저장소·데이터·서비스 변경은 없었습니다. 이후 1단계 결과를 보존한 채 docs를 임의로 삭제하지 않습니다.

## 1단계 실행 결과

### 이관과 재사용

- `apps/monoasobi`, `apps/loudasobi`에 각 원본 HEAD를 `git subtree add`로 가져왔습니다. squash/원본 이력 재작성은 하지 않았습니다.
- 이관 직후 Git tree ID가 원본과 각각 완전히 같고 두 원본 HEAD가 새 HEAD의 ancestor임을 확인했습니다.
  - Mono tree: `6e3e4f385c0a53acdab7ea808282c6836ea66233`.
  - Loud tree: `477e46f207c6136f31d5c77ebd661775954f9528`.
- 기존 `src/`, `public/`, 관리자·편집기·재생·query/mutation·Drizzle 이력은 변경하지 않았습니다. 신규 제품 컴포넌트/서버 로직은 작성하지 않았습니다.
- Git의 원래 전역 줄바꿈 설정이 원본 파일을 광범위하게 바꾸지 않도록 새 저장소의 `core.autocrlf=false`만 설정했습니다. 전역 설정과 원본 저장소 설정은 바꾸지 않았습니다.

### 승인된 Git 작업

| 커밋 | 내용 |
| --- | --- |
| `9d80254` | `Add migration baseline` — 지침/감사 문서 |
| `333af83` | `Import MONOASOBI history` — 원본 이력과 앱 가져오기 |
| `f661b96` | `Import LOUDASOBI history` — 원본 이력과 앱 가져오기 |

1단계 이력 이관 당시 first-parent 커밋은 위 3개입니다. 원본 176개/18개 커밋을 부모 이력으로 보존합니다. 당시 workspace 설정·진행 문서는 미커밋으로 남겼으며, 아래 세부 작업 커밋 승인에 따라 후속 커밋으로 기록했습니다. 새 원격은 없고 원격 생성·푸시는 하지 않았습니다.

### 필요한 설정만 수정

- 루트 `package.json`: private npm workspace, `dev:mono`, `dev:loud`, 전체 lint/typecheck. admin 앱/공통 패키지는 소비자가 생기는 후속 단계에서 생성합니다.
- 루트 `package-lock.json` 하나로 통합했습니다. 기존 두 lockfile의 해석 버전/무결성 정보를 재사용해 오프라인 설치했고 **두 앱의 모든 직접 dependency/devDependency 설치 버전이 원본 lockfile과 동일**한 것을 확인했습니다. 새 의존성을 추가하지 않았습니다.
- 앱 이름은 `@asobi/monoasobi`, `@asobi/loudasobi`로 구분했습니다. 기존 의존성 범위는 유지했습니다. React/Jotai/Next 버전 차이는 이번에 강제 통일하지 않았습니다.
- 기본 포트는 Mono 3000/Loud 3001, root 명령에서 `-- --port`로 변경 가능합니다. 기존 서버가 사용 중이므로 실제 확인에는 3100/3101을 썼습니다.
- `.nvmrc`는 루트 Node 24.14.1로 통합하고 npm 11.11.0을 packageManager에 기록했습니다. root와 앱의 engines는 Node 24.x/npm 11.x입니다. Vercel의 지원 major와 설치된 두 Next의 최소 Node 조건을 확인했습니다. 운영 Node patch까지 동일하다는 보장은 아닙니다.
- Next의 실제 설치 문서에 따라 Turbopack root와 outputFileTracingRoot를 workspace 루트로 지정했습니다. Mono cacheComponents/React Compiler 설정, 앱별 import alias, 정적 자산 URL, 기존 Tailwind 구성은 보존했습니다.
- 앱별 `.env.example`과 root 제외 규칙을 구성하고 Loud 예시 파일만 ignore 예외로 허용했습니다. 실제 `.env`·원본 node_modules·.next·백업은 가져오지 않았습니다.
- 이관한 앱 AGENTS에는 루트 청사진 우선과 소유권 인계 시점을 명시했습니다. 당시 Mono 신규 커밋 규칙은 영어 한 줄로 맞췄으나, 이후 사용자 결정에 따라 루트와 두 앱 모두 간결한 한글 한 줄로 갱신했습니다.

### 실행 환경과 확인 범위

- Git 제외 `.local/development.sqlite`에 **로컬 검증 전용** DB를 만들었습니다. 기존 9개 SQL/Drizzle journal을 그대로 적용했습니다. 실제 DB를 새로 대체하거나 운영 내용을 복제한 작업이 아닙니다.
- 샘플은 합성 곡 ID 0 한 개·stable ID가 있는 가사 한 줄·명시적 Loud 전용 영상/publish 설정뿐입니다. 기존 seed/backfill/콘텐츠 이전 도구는 실행하지 않았습니다.
- 두 앱 `.env.local`은 같은 로컬 파일 DB를 가리킵니다. 관리자/열람/세션값은 이번 로컬 확인용으로 생성했고 로그에 출력하지 않았습니다. R2 설정은 넣지 않았습니다.
- 개발 서버 실행 확인 주소: Mono `http://127.0.0.1:3100`, Loud `http://127.0.0.1:3101`. 현재 프로세스가 종료되면 README 명령으로 재실행합니다. 기존 3000/3001 서버는 건드리지 않았습니다.
- 샌드박스의 포트 바인딩/로컬 접속 제한은 필요한 명령에만 실행 권한을 받아 확인했습니다. 앱 오류로 처리하지 않았습니다.

| 검사 | 결과 |
| --- | --- |
| root `npm install --offline --ignore-scripts --no-audit --no-fund` | 통과. 기존 npm 캐시로 1401개 패키지 설치, root lockfile 유지 |
| 모든 직접 의존성 버전 대조 | 두 앱 모두 원본 lockfile과 차이 0개 |
| React resolve | 각 앱의 react-dom/react-player와 Radix가 같은 앱의 React를 참조 |
| root `npm run lint` | 두 앱 통과 |
| root `npm run typecheck` | 각 Next route typegen + tsc 모두 통과 |
| Mono `/`, `/admin`, 로그인 후 `/admin?musicId=0`, `/admin/lyrics/0/timeline` | HTTP 200 |
| Loud `/`, `/admin`, 로그인 후 `/admin`, `/admin/musics/0/guide` | HTTP 200 |
| Loud 인증된 musics/guide GET | HTTP 200 |
| 양쪽 로컬 로그인 | admin/viewer 각각 HTTP 200 |
| 양쪽 비로그인 쓰기·viewer 쓰기 | 각각 401·403, 저장 안 됨 |
| secret/DB 제외 규칙 | 두 .env.local과 .local DB가 Git ignore됨 |

HTTP 확인은 새 자동화 테스트 프레임워크를 추가하지 않고 임시 점검 스크립트로 수행했습니다. 로컬 결과는 Git 제외 `.local/*-http-check.json`에 남겼습니다. 설치 lifecycle script는 실행하지 않았으며 실제 서버 컴파일/로컬 DB 연결은 성공했습니다.

**남은 검증:** 브라우저에서의 hydration/화면 비교·드래그·스냅·재생·모바일·실제 콘텐츠 전체 조회·인증 저장·R2 파일·운영/복제 DB 권한·실제 배포 빌드·Vercel 설정. 이번 lint/typegen/HTTP 결과로 이를 완료 처리하지 않습니다.

### 임시 중복과 다음 단계

- 기존 두 관리자는 앱 안에 그대로 있습니다. 3~6단계 기능별 전환/QA 후 9단계 운영 전환에서 옛 쓰기 경로를 정리합니다.
- 앱별 의존성/React/Jotai 버전이 독립적으로 남아 있습니다. 2단계에서 공통 UI의 실제 peer 경계를 만들 때 호환성을 정렬하며, 의존성 수를 줄이려고 제품 동작을 먼저 바꾸지 않습니다.
- 다음은 **2단계: 기존 Loud shadcn 부품·순수 공통 코드·Mono 정식 DB 정의 추출**입니다. source-inventory/reuse-map과 실제 소비자를 대조하고 packages를 생성합니다. 이번 1단계 승인으로 운영 DB 작업/빌드/추가 커밋/푸시를 실행하지 않습니다.
- 원본 갱신 여부를 다시 확인하고 시작합니다. 원격 저장소 주소/공개 범위는 사용자가 준비했을 때 기록하며 로컬 공통화의 선행 조건은 아닙니다.
- 되돌리기: 원본 두 폴더/서비스는 그대로 남아 있습니다. 새 저장소의 이관 커밋은 보존하고 workspace 수정 사항을 검토해 되돌릴 수 있습니다. `.local`은 합성 검증 데이터이며 운영 복구 자료가 아닙니다. 사용자 승인 없이 전체 reset/삭제하지 않습니다.

## 2단계 실행 결과

### 소유권과 재사용

- `packages/ui`: 기존 Loud shadcn TSX 16개·cn을 이동했습니다. 앱의 사본은 제거하고 소비자 import를 package name으로 바꿨습니다. components.json alias/export를 연결했으며 CLI로 부품을 재생성하지 않았습니다.
- 공통 CSS에는 기존 semantic Tailwind 매핑과 dark variant를 옮겼습니다. 이후 사용자 브랜드 통일 요청에 따라 Loud 팔레트·라이트/다크 값도 공용 `brand.css`로 옮겼고 색상 utility 매핑도 `styles.css`로 모았습니다. Loud globals는 공용 CSS를 가져오며 스크롤/높이 레이아웃만 앱에 유지합니다. 공통 UI의 클래스 탐색은 `@source`로 명시했습니다.
- `packages/content-core`: 기존 콜 parse/resolve/패턴·가사 표시 보정·가사 언어 필드·아이콘 이름 검증·순수 추천 정렬을 옮겼습니다. 기존 주요 모듈 5개는 import를 제외한 구현이 같은지 AST로 대조했습니다.
- 가사 타입은 두 원본의 optional 필드를 보존해 한 곳으로 모았습니다. Mono 영어 필드 제거/플레이어 시간 계산도 기존 구현을 이동했습니다. 가사 0.01초 정밀도와 콜 소수 넷째 자리 정밀도를 각각 유지합니다. 범용 타임라인 엔진은 만들지 않았습니다.
- Loud 공개 카탈로그의 linesSchema만 순수 모듈로 추출했습니다. 기존 Mono 관리자 가사 입력의 허용 범위를 바꾸지 않았습니다. 관리자 폼 스키마·query/mutation·인증·Next 캐시는 앱에 그대로 있습니다.
- `packages/database`: Mono의 정식 11개 테이블/relations, Drizzle config, 0000~0008 SQL/journal/snapshots를 옮겼습니다. 파일을 재생성하거나 ID/순서/해시를 초기화하지 않았습니다. Loud의 부분 매핑과 Mono 앱의 schema/migration 사본은 제거했습니다.
- DB 생성은 공유 지연 연결 한 곳으로 모았습니다. Mono의 기존 eager db 진입점과 Loud의 필수 token 검사는 앱의 얇은 adapter에서 유지합니다. 공개 쿼리는 기존 명시적 projection·논리 삭제/publish 조건을 유지합니다.
- DB generate/migrate/studio 진입점은 database 패키지와 이를 호출하는 root script만 남겼습니다. 기존 운영 도구의 migration 읽기 경로도 정식 위치로 연결했고 실행하지 않았습니다. DB/R2/운영 데이터는 변경하지 않았습니다.

### 의존성과 실행 경계

- npm workspace 내부 의존성은 `0.1.0`으로 연결했고 단일 root lockfile을 갱신했습니다. 별도 패키지 빌드·발행·Turborepo/Nx를 추가하지 않았습니다.
- 공통 UI의 실제 공유를 위해 React/React DOM을 Loud 기준 19.2.8, 관련 타입을 19.3.0으로 정렬했습니다. 양 앱·ui·react-dom/react-player/Radix가 root의 같은 React 인스턴스를 참조하는지 확인했습니다. Next와 Jotai는 기존 앱 버전을 유지했습니다.
- Drizzle ORM 0.45.2도 같은 실체를 참조하며 공용 연결은 기존 Loud libSQL client 0.18.0을 사용합니다. Mono의 기존 운영 도구용 직접 client 의존성은 별개로 보존합니다.
- DB 연결은 표준 server-only 경계로 보호하고 schema 진입점은 CLI/타입에서 독립적으로 읽을 수 있게 분리했습니다. 공통 패키지 안에 앱 alias/import가 남지 않았는지 검사했습니다.
- Next 설치 문서를 확인하고 source 패키지 이름을 transpilePackages에 명시했습니다. workspace root와 파일 추적 설정을 유지했습니다. 실제 production 번들 검증은 아직 수행하지 않았습니다.
- 기존 캐시를 우선 사용해 설치했고 캐시에 없던 server-only 등 필요한 메타데이터/패키지를 받았습니다. install lifecycle scripts는 실행하지 않았습니다. root에 공통 검사 도구 의존성을 명시했으며 각 앱의 기존 lint 기준은 유지했습니다.

### 실행한 검사와 결과

| 항목 | 결과 |
| --- | --- |
| root `npm run lint` | 두 앱 + 공통 패키지 3개 통과. 마지막 import/검사 파일 수정은 해당 workspace 추가 검사 |
| root `npm run typecheck` | 각 앱 route typegen/tsc + 공통 패키지 3개 통과. 검사 파일도 core 타입 검사에 포함 |
| `npm run check:core` | 시간 정밀도·경계·가사 중첩 거부·영어 필드 제거·펄스/resize·콜/가사 참조·ID 0 추천 projection 확인 |
| 기존 `node --test apps/monoasobi/scripts/activeLyric.test.mjs` | 기존 재생 경계 검사 통과 |
| canonical migration 대조 | 9개 SQL·journal·snapshot 모두 원본 Git 바이트와 동일 |
| 주요 도메인 코드 대조 | 5개 기존 모듈의 import 제외 구현 동일 |
| 테마/스타일 | 기존 CSS 변수 선언 전체 동일. 기존 PostCSS/Tailwind로 공용 CSS 컴파일 및 공유 부품 클래스 생성 확인 |
| React/ORM resolve | 공용 React/React DOM/ORM과 실제 소비 경로 확인 |
| Mono 로컬 HTTP | 공개/관리자/가사 페이지 200, admin/viewer 로그인 200, 비로그인 쓰기 401·viewer 쓰기 403 |
| Loud 로컬 HTTP | 공개/관리자/콜 페이지·인증 조회 200, admin/viewer 로그인 200, 비로그인 쓰기 401·viewer 쓰기 403 |

첫 연결 중 발견한 import 누락/검사 설정은 수정 후 다시 검사했습니다. 실행 중이던 Loud 개발 서버에는 패키지가 생기기 전의 CSS 실패 경로가 cache에 남아 있어, 해당 `.next/dev/cache`만 임시 디렉터리로 옮기고 재시작했습니다. 소스·콘텐츠·운영 캐시는 삭제하지 않았습니다. 새 서버에서 공용 CSS와 기존 페이지가 정상 응답합니다.

HTTP 확인은 1단계의 합성 곡 1개를 가진 같은 로컬 DB와 기존 임시 점검 스크립트를 사용했습니다. **Production build, 배포 번들 포함, 브라우저 hydration·시각 비교·재생·스냅/드래그, 실제 콘텐츠 저장·R2·운영 권한은 미검증**입니다. 개발 컴파일/정적 검사 통과로 대체하지 않습니다.

브랜드 공통화 후 추가 확인(2026-10-20): Loud와 ui의 lint·typecheck가 통과했습니다. 이동 전후 CSS custom property 선언을 전체 대조해 값이 동일하며, 기존 PostCSS/Tailwind로 공용 팔레트·라이트/다크 값·공유 부품 utility가 포함되는지 확인했습니다. `.light` 컨테이너에서도 공용 라이트 토큰을 사용할 수 있게 했습니다. Mono 화면 색상 변경·브라우저 시각 QA·production build는 이번 변경에 포함하지 않았습니다.

### 남은 작업과 재개

- 기존 두 관리자·편집기·공개 재생기는 각 앱에 남아 있습니다. 통합 관리자의 첫 실제 소비자가 생기는 3단계부터 기존 구현을 순서대로 이관합니다.
- 아이콘 선택기/대용량 검색 데이터·레이아웃 CSS는 앱 전용입니다. 브랜드 색상은 공용 UI로 이동했습니다. Mono UI를 shadcn으로 바꾸고 공용 색상을 화면에 적용하는 작업은 7단계이며, 이 단계에서 Radix Themes를 제거하지 않았습니다.
- 앱별 db/index.ts는 구현 복제가 아닌 기존 진입점 호환용입니다. 관리자 이관 뒤 남은 소비자가 없어지면 해당 entry를 제거할 수 있습니다.
- 이관용 3개 커밋은 보존하며, 1~2단계 미커밋 변경은 추가 승인에 따라 세부 작업별로 커밋합니다. 푸시·build·운영 migration·배포는 수행하지 않았습니다. 원본 두 폴더는 보존합니다.
- 다음은 **3단계: 기존 탐색·폼·인증을 이용한 통합 관리자 기본 틀과 첫 저장 흐름**입니다. 새 DB 패키지의 파일 이동은 운영 DB 전환 승인이 아닙니다.

## 세부 작업 커밋 승인 및 이력 정리 (2026-10-20)

- 사용자 요청: 앞으로 요청한 단계는 세부 기능·작업 단위로 나누어 로컬 커밋까지 수행합니다. 단계당 한 커밋으로 몰지 않고, 메시지는 간결한 한글 한 줄로 작성합니다. 이후 단계에도 적용하며 반복 승인받지 않습니다.
- 현재 미커밋 작업도 같은 기준으로 정리합니다. 기존 이관용 3개 커밋은 수정하지 않습니다. 푸시·원격 연결·빌드·운영 작업과 3단계 착수는 이번 요청에 포함되지 않습니다.
- 루트 AGENTS.md/AGENT.md와 두 앱 AGENTS.md의 기존 영어 메시지·커밋 대기 규칙을 갱신했습니다.

| 커밋 | 세부 작업 |
| --- | --- |
| `46982bf` | 세부 작업별 한글 커밋 지침 정리 |
| `43868bb` | 공통 가사·콜 도메인과 계약 검사 추출 |
| `b373f53` | 공용 DB 연결과 정식 스키마·마이그레이션 구성 |
| `5e80db0` | 공용 shadcn UI와 LOUDASOBI 브랜드 테마 구성 |
| `b9522bd` | 단일 npm 워크스페이스와 앱 실행·검사 환경 구성 |
| `da40c54` | MONOASOBI 가사 타입과 시간 계산을 공통 패키지로 연결 |
| `302fb5b` | LOUDASOBI 콜·가사 계산과 카탈로그 검증 공통화 |
| `9873533` | LOUDASOBI 화면에 공용 UI와 브랜드 테마 적용 |
| `08e4d1a` | 두 앱의 DB 참조와 마이그레이션 소유권 일원화 |
| `a0f15b4` | 로컬 개발 환경변수 예시와 비밀값 제외 규칙 정리 |

위 작업 커밋 뒤 README·재사용 지도·이 진행 기록을 별도 인계 문서 커밋으로 남깁니다. 문서 자신의 최종 커밋 해시는 Git 로그에서 확인합니다.

검증: root `npm run lint`, `npm run typecheck`, `npm run check:core`, 기존 `node --test apps/monoasobi/scripts/activeLyric.test.mjs` 모두 통과했습니다. 신규 파일의 EOF 공백 한 곳만 정리했으며 기능 코드는 추가 변경하지 않았습니다. 정식 스키마와 마이그레이션 파일 20개는 이관 기준 Git 바이트와 동일합니다. 원본 두 저장소는 기존 HEAD/clean 상태이며 로컬 환경변수·검증용 DB·개발 산출물은 Git에서 제외됩니다.

당시 재개 지점: **3단계 미착수**였으며, 이후 실행 결과는 아래 3단계 기록을 따릅니다. 사용자가 진행을 요청하면 통합 관리자 기본 틀과 첫 저장 흐름을 시작하고, 이후에도 세부 작업별 검증·한글 커밋·진행 기록 갱신을 함께 수행합니다. Production build·브라우저 기능 QA·운영 DB/R2/DNS·푸시·배포는 이번 커밋 정리로 완료 처리하지 않습니다.

## 3단계 실행 기록

### 관리자 앱과 인증 기반

- `apps/adminasobi`를 추가하고 Loud의 Next 설정·공용 CSS·기존 HMAC 인증·권한·Origin 검사·로그인 폼을 이관했습니다. 관리자 전용 cookie/audience는 `adminasobi_admin`/`adminasobi`이며 공개 앱 쿠키와 분리합니다.
- 기존 관리자는 전환 기간 동안 유지합니다. 새 관리자 인증 사본은 서비스 분리용이며 9단계에 기존 관리자 전용 경로를 종료할 때 옛 사본을 제거합니다.
- 로컬 환경은 기존 합성 SQLite와 별도 무작위 인증값을 사용합니다. 실제 비밀값과 DB는 Git에서 제외됩니다. 새 관리자 기본 포트는 3002, 이 작업의 검증 포트는 3102입니다.

인증 기반 검증: admin lint·typecheck·작은 보안 계약 검사 통과. 로컬 HTTP에서 로그인 화면/보호 화면·admin/viewer 로그인·로그아웃·미인증 세션 401·Origin 없는 로그인 403을 확인했습니다. 화면 배치와 곡 저장은 다음 세부 작업입니다.

### 공용 곡 사이드바 추출

- 기존 Loud SongList의 정렬·아코디언·선택 표시·스크롤 복원을 공용 UI로 옮겼습니다. 앱은 locale/문구/이미지만 전달합니다. 앨범 순서·팬라이트 키는 content-core에서 재사용합니다. 공개 화면의 호출부는 얇은 adapter로 유지합니다.
- ui·Loud lint/typecheck와 content-core typecheck 통과. 관리자 곡 목록/상세 연결은 다음 커밋에서 기록합니다.

### 관리자 곡 조회와 공통 레이아웃

- 기존 Loud 조회 projection에 공통 곡 필드를 더해 인증된 목록/상세 API를 연결했습니다. 곡 ID 0을 보존하고 모호한 숫자·없는 곡을 거부합니다. 응답은 private/no-store입니다.
- URL 곡 선택·헤더·접을 수 있는 공용 곡 사이드바·라이트/다크 전환·좌우 곡 정보/콜 정보 영역을 연결했습니다. 정렬/그룹/접힘은 기존 Jotai storage 패턴으로 보존하며 저장소 실패 시 기본 상태로 동작합니다. 기존 이동 확인/beforeunload 패턴을 공통 guard로 연결했습니다.
- admin lint/typecheck·보안/ID 검사 통과. 로컬 HTTP에서 목록/상세·ID 0·잘못된/없는 ID·곡 URL 페이지·no-store를 확인했습니다. 실제 브라우저의 뒤로 가기/스크롤/시각 QA는 별도입니다. 앨범아트 표시는 4단계 전환 전까지 기존 Mono 공개 주소를 사용하는 임시 adapter입니다.

### 공통 곡 검증과 파일 처리 재사용

- Mono 곡 schema와 Loud 설정 schema를 content-core 단일 원본으로 옮겼습니다. 공유 Zod schema가 두 버전의 타입 경계를 넘지 않도록 Mono Zod를 기존 공용 버전 4.6.5로 맞췄습니다. Jotai/Next는 기존 앱 버전을 유지합니다.
- 기존 R2 연결·읽기/쓰기·응답 변환과 Sharp 정규화를 `packages/storage`로 옮겼습니다. Mono 보호 콘텐츠 읽기와 새 관리자 업로드가 실제 소비하므로 별도 구현 복제 대신 작은 server-only 패키지를 추가했습니다. 파일 키·버킷 기본값·3MB/40MP·포맷·1000px·실패 정리 계약을 유지합니다. 운영 R2는 접속하지 않았습니다.
- 전체 lint/typecheck·공용 계약·관리자 보안 검사 통과. Sharp 로컬 검사에서 비율/작은 이미지 보존·WebP 변환·초과 크기/잘못된 이미지/GIF 거부를 확인했습니다.

### 공개 갱신 알림과 실패 분리

- 각 공개 앱에 고정 `catalog` 범위만 허용하는 서버 전용 Bearer 갱신 API를 연결했습니다. Mono는 기존 public-catalog tag를 expire:0으로 만료시키고 Loud는 자기 공개 경로만 갱신합니다. 임의 경로나 관리자 쿠키로 호출할 수 없습니다.
- 관리자 서버는 공통 곡/앨범아트 변경 시 두 앱, Loud 설정 변경 시 Loud에만 알립니다. 5초 제한·redirect 거부·no-store를 사용하며 알림 실패를 저장 실패로 보고하지 않습니다. 관리자 역할/Origin을 확인하는 갱신 재시도 API도 연결했습니다.
- 전체 lint/typecheck·계약 검사 통과. 로컬 정상 흐름에서 두 공개 페이지의 수정 제목 반영, 무인증 401/잘못된 scope 400을 확인했습니다. Loud 로컬 서버 중단 검증에서도 저장은 성공하고 알림만 실패하며 가사/콜 원본은 보존됐습니다. 공개 서버는 다시 실행했습니다. 이미 열린 브라우저의 자동 갱신은 8단계 범위로 남깁니다.

### 곡 정보와 콜 설정 저장

- 공통 곡 정보 PUT과 Loud 설정 PUT을 별도 경로/기존 mutation으로 연결했습니다. 각 쓰기에 관리자 역할·Origin·ID·기존 입력 schema를 적용하고 공통 정보는 기존 다섯 필드만 갱신합니다. 콜 설정은 자기 테이블만 갱신합니다. 가사·guide_json·앨범아트 키를 함께 덮어쓰지 않습니다.
- 로컬 HTTP에서 미인증 401/viewer 403/다른 Origin 403/잘못된 입력 400을 확인했습니다. 공통 저장 뒤 설정·가사·콜이 동일하고, 설정 저장 뒤 공통 곡·가사·콜이 동일한지 실제 SQLite 행으로 대조했습니다. 정상 알림 뒤 두 공개 페이지에 수정 제목이 나타났으며 시험 필드는 원래 값으로 복원했습니다(저장 시간은 갱신).

### 앨범아트 관리 API

- 기존 bounded body 읽기 → Sharp 정규화 → R2 새 키 업로드 → DB 조건부 교체 → 실패 시 새 객체 정리/성공 시 옛 객체 정리를 새 관리자에 이관했습니다. 관리자 역할·Origin 검사를 추가하고 저장 후 두 공개 앱에 알립니다.
- 로컬 HTTP에서 viewer 업로드 403, 3MB 초과 413, 잘못된 이미지 400과 DB 무변경을 확인했습니다. Sharp 로컬 변환 검사는 통과했으나 실제 R2 업로드/교체/객체 정리는 아직 검증하지 않았습니다. 현재 로컬에는 R2 비밀값이 없으며, 분리된 검증용 대상/독립 이미지 주소는 4단계에서 확인합니다.

### 상세 화면의 개별 저장 폼

- 기존 Mono 음악 필드/페이로드를 shadcn으로 연결하고 기존 Loud 설정 폼을 이관했습니다. 곡 정보·앨범아트·콜 설정은 별도 폼/저장 상태로 유지합니다. 한 섹션을 저장해도 다른 섹션의 미저장 입력을 초기화하지 않습니다.
- 저장 중 곡 전환/로그아웃을 막고, 미저장 변경의 이동 확인과 beforeunload 보호를 기존 패턴으로 연결했습니다. 현재 보호는 앱 내 곡 선택·로그아웃과 beforeunload에 적용됩니다. App Router의 같은 문서 내 뒤로 가기 차단은 아직 연결하지 않았고 5단계 편집기 이동 보호에서 보강합니다. 새로고침·스토리지 차단·모바일 동작은 사용자 QA가 남아 있습니다.
- 앨범아트 선택 미리보기와 갱신 실패 표시/알림 재시도 버튼을 연결했습니다. 가사/콜 편집 버튼은 준비 중으로 비활성화했으며 실제 독립 편집 페이지는 5단계에 연결합니다. 실제 R2 업로드는 미검증입니다.
- 전체 lint/typecheck 및 로컬 HTTP의 곡 상세 페이지 응답을 확인했습니다. 시각 배치·입력 조작 QA는 사용자 확인 대기입니다.

### 최종 검증과 재개 지점

| 검증 | 결과 |
| --- | --- |
| root lint/typecheck | 세 앱 + 공용 패키지 네 개 통과 |
| check:core | 기존 가사/콜/ID 0 계약 + 곡/설정 필드 소유권·선택 필드 null 변환 통과 |
| admin check:security | cookie audience/역할/만료/Origin·ID 0·갱신 성공 응답/실패 처리 통과 |
| storage check | Sharp 비율 보존·WebP·용량/포맷 거부 통과, 외부 R2 미사용 |
| 기존 activeLyric 검사 | 0.01초 경계 검사 통과 |
| 로컬 HTTP/SQLite | admin/viewer·Origin·입력 거부·섹션별 저장·가사/콜 불변·두 공개 페이지 반영·재시도 통과 |
| 갱신 장애 실험 | Loud 로컬 중단 시 저장 성공/알림 실패 분리 확인, 서버 복구 |
| lockfile | npm ci --dry-run --ignore-scripts --offline 통과. 새 workspace 연결에 따른 hoist/전이 의존성 재정렬 |
| 원본 보존 | 원본 두 Git HEAD/clean 상태 유지. 운영 DB/R2/DNS/배포·푸시 미실행 |

로컬 검증 스크립트는 ASOBI의 합성 SQLite 경로와 관리자/공개 앱의 loopback HTTP 주소만 허용합니다. ID 0의 필드를 잠시 수정하고 원래 값으로 복원하며 저장 시각은 갱신됩니다. 비공개 값은 로그/커밋에 기록하지 않습니다. 새 프레임워크나 별도 테스트 서버는 추가하지 않았습니다.

**사용자 확인 대기:** `http://127.0.0.1:3102/musics/0`에서 로그인 후 좌우 배치·필드·개별 저장·열람 전용·테마·사이드바 접힘/정렬/스크롤·모바일을 확인합니다. 로컬 인증값은 adminasobi의 무시된 `.env.local`에만 있습니다. 실제 브라우저 조작·R2 업로드/교체/정리·production build·운영 권한/배포는 미검증입니다. 같은 문서 내 App Router 뒤로 가기 보호는 5단계에서 보강할 구현 잔여입니다.

**3단계 종료 당시 다음 작업:** 4단계 독립 앨범아트 도메인·크기별 제공이었습니다. 현재 결과는 아래 4단계 기록을 확인합니다. 정확한 도메인·서브도메인·검증/공개 버킷·공개 파일 범위를 확인한 뒤 진행하며, DNS/R2 공개 설정·유료화·운영 작업은 승인 범위를 따릅니다. 가사/콜 편집기는 5단계, 나머지 관리 기능은 6단계, 전체 공개 UI 전환/갱신은 7~8단계에 남아 있습니다.

3단계 세부 커밋:

| 커밋 | 내용 |
| --- | --- |
| `fec985c` | 통합 관리자 앱과 독립 로그인·권한 기반 구성 |
| `ba765e9` | 곡 사이드바와 앨범 정렬·스크롤 복원 공용화 |
| `c83cd7f` | 관리자 곡 조회와 URL 기반 좌우 상세 화면 연결 |
| `508434a` | 공통 곡 검증과 R2·이미지 처리 구현 재사용 |
| `c1aab90` | 공개 앱 갱신 알림과 인증된 재시도 경로 연결 |
| `481fb2f` | 공통 곡 정보와 콜 설정의 저장 경로 분리 |
| `087e56e` | 기존 앨범아트 업로드와 조건부 교체 이관 |
| `148b910` | 갱신 응답 검증과 실패 처리 계약 보강 |
| `653a380` | 곡·콜 정보 저장 폼과 앨범아트·갱신 상태 UI 연결 |
| `4dafa7c` | 로컬 저장·권한·공개 반영 검증 경로 추가 |

이 기록·README·재사용 지도·진입 지침 정합화는 마지막 인계 문서 커밋으로 남깁니다. 해당 문서 커밋 자신의 해시는 Git 로그/최종 응답에서 확인합니다.


## 4단계 — 독립 이미지 제공 준비와 고해상도 수집

### 사용자 결정과 실행 경계

- 사용자는 외부에 있어 기존 화면 QA를 나중에 한 번에 진행하겠다고 하셨고, 4단계와 고해상도 싱글 앨범아트 수집을 승인하셨습니다. QA를 통과한 것으로 처리하지 않습니다.
- 보유 도메인은 **envifloor.uk**, R2와 같은 계정임을 사용자가 확인했습니다. `assets.envifloor.uk` + 새 전용 버킷 `asobi-album-art` + 커버만 공개 + Images Free 변환 연결안을 **명시적으로 승인**했습니다. APAC/Standard 버킷 생성·커버 객체 복사/업로드·도메인/TLS 1.2·Free 변환을 실행/검증했습니다. 운영 DB 키 일괄 교체와 기존 파일 삭제는 승인 범위에서 제외되어 실행하지 않았습니다. 기존 와일드카드 DNS도 유지했습니다.
- 신규 커밋 메시지는 이번 사용자 진입 지침의 영어 한 줄 규칙을 우선했습니다. 이전 한글 커밋은 그대로 보존합니다.
- 구체적 실행·승인·복구·캐시 검증 절차는 [album-art-delivery.md](album-art-delivery.md)에 있습니다. 다음 에이전트는 이 문서와 실제 답변/설정부터 확인합니다.

### 로컬 결과

1. **36곡 수집:** 소스 seed 35곡에만 의존하지 않고 운영 공개 목록을 조회해 ID 35 `咲き誇れ`까지 포함했습니다. Apple Music 일본 공식 배급 카탈로그에서 각 싱글 커버를 3000×3000으로 다운로드했습니다. Orion(ID 34)은 사용자 지정 THE BOOK for,입니다. 원본 JPEG와 3MiB 이하 동일 해상도 WebP를 `assets/album-art`에 보존했습니다. 출처·ID·곡명·해상도·크기·SHA-256·새 키/수집 시점 기존 키는 manifest에 있습니다. 기존 이미지와 비교판으로 대조했습니다. 기존 public 파일/DB/R2 객체는 교체하지 않았습니다. 이후 승인된 전용 버킷에 기존 키 36개를 유지해 복사하고 준비본 새 키 36개를 업로드했으며, 총 72개 SHA-256·바이트·Content-Type을 재확인했습니다.
2. **공용 표시/크기 요청:** 기존 이미지 표시·실패 처리·blob 미리보기를 `packages/ui/components/album-artwork`로 추출하고 세 앱의 얇은 adapter를 연결했습니다. `content-core/albumArt`에서 공개 origin/키 검증과 200/400/800/1200/1600 다섯 크기의 URL을 만듭니다. 명시적 srcset/sizes를 native img로 전달해 Next와 Cloudflare의 이중 변환을 피합니다. 도메인 활성화/HTTP 검증 후 세 앱의 공개 `.env.example`과 로컬 `.env.local`에 독립 주소/변환 값을 적용했습니다. 로컬 쓰기 인증·검증 버킷은 아직 별도 준비가 필요합니다. 운영 Vercel 환경변수/배포는 바꾸지 않았습니다. Mono의 기존 Next optimizer 경유는 제거했습니다.
3. **해상도/저장 경계:** 기존 Sharp/R2/DB 조건부 교체를 그대로 재사용합니다. 1000px 축소를 제거해 원본 픽셀을 유지하고 3MiB/40MP/정지 JPG·PNG·WebP 제한은 유지했습니다. WebP 출력도 최대 3MiB로 제한합니다. 별도 `R2_ALBUM_ART_BUCKET_NAME`을 앨범아트 읽기/쓰기에만 전달합니다. 비공개 버킷과 동일 대상/공개 주소만 설정한 오구성을 거부합니다. 전용 버킷 전환 중에는 이전 객체 삭제를 보류하며 DB 교체 실패 시 새 객체 정리는 유지합니다. 두 원래 쓰기 경로도 같은 전용 버킷을 사용하도록 연결했습니다.
4. **속도 기준선:** 기존 공개 API의 같은 3,734B 이미지가 첫 GET 3,008ms/MISS, 재요청 69ms/HIT였습니다. 무료 플랜 탓으로 단정하지 않습니다. 로컬 크기별 전송량은 별도 참고치로 기록했고 연결 후 새 CDN 200px 실측은 첫 1,480ms/MISS, 재요청 75ms/HIT였습니다. 3000px 원본과 5개 크기·모든 36곡 공개 원본을 확인했습니다. 최초 403/9408은 도메인 초기화가 끝난 뒤 정상화됐습니다.

### 검증과 세부 커밋

| 항목 | 결과 |
| --- | --- |
| root lint/typecheck | 세 앱과 공용 패키지 전체 통과 |
| content-core 검사 | 기존 가사/콜/필드 계약 + 이미지 키/공개 origin/제한 크기/레거시 주소 통과 |
| storage 검사 | 3MiB/포맷/40MP 제한, 3000px 보존, 비공개 버킷 경계 통과 |
| 기존 Mono albumArt 검사 | 4개 통과 — 해상도/비율/포맷·불량 입력·기존 주소 |
| 수집본 검사 | 36개 원본·준비본 해시/크기/해상도/키 통과. 확대 없이 3000×3000 |
| 업로드 입력 재검사 | 실제 준비본 ID 4/11/31을 정규화해 3000px·3MiB 이하 유지 확인 |
| 공용 표시 markup probe | bounded srcset/sizes·Next optimizer 미경유·blob 미리보기 우회 확인. 브라우저 QA 대체 아님 |
| R2 외부 | 승인된 새 버킷 생성·기존 키 36개 복사·고해상도 새 키 36개 업로드, 72개 모두 SHA-256/용량/Content-Type 대조. 이전 파일 보존 |
| CDN 외부 | 도메인 활성/TLS 1.2, 원본 36개 HTTP 200·5개 변환 크기·원본 해시·MISS/HIT·없는 파일 404 통과 |
| 운영/QA | DB 키 변경·기존 객체 삭제·Vercel 환경변수/빌드/배포/푸시 미실행. 실제 관리자 업로드/CAS/정리와 모바일 UI QA 남음 |

| 커밋 | 내용 |
| --- | --- |
| `969ae79` | 36곡 고해상도 싱글 원본·WebP·출처/해시·수집 스크립트 |
| `8bc9bbf` | 세 앱 공용 앨범아트 표시와 제한된 크기별 CDN 주소 |
| `a0a1672` | 업로드 해상도 유지와 앨범아트 전용 버킷 경계 |
| `1d91475` | 로컬 결과·연결/복구 절차·사용자 최신 커밋 지침 정합화 |
| `cb6fa1e` | 승인된 공개 업로드·CDN 검증 도구와 객체 검증 기록 |

이 문서/연결 절차/재사용 지도/지침 정합화는 별도 마지막 문서 커밋으로 남기며 자기 해시를 넣기 위해 amend하지 않습니다.

**다음 재개:** 외부 연결 승인은 이미 충족됐으므로 반복 질문하지 않습니다. 운영 전환 전 최신 곡/키의 변경분을 다시 확인하고, 별도 승인된 범위에서 운영 앱의 환경변수/배포와 고해상도 DB 키 교체를 진행합니다. 실제 관리자 업로드·CAS/정리·공개 중단/purge·화면 QA는 미검증입니다. 5단계는 사용자의 진행 요청에 따라 시작합니다.

자동 승인 검토는 기본 `envifloor.uk` 변환 원본 항목 삭제를 다른 사용처 중단 우려로 거절했습니다. 해당 항목은 보존하고 전용 assets 원본만 추가하는 안전한 대안으로 목표 연결을 완료했습니다. 불필요한 삭제를 우회/재시도하지 않습니다. 루트 허용 항목 정리는 별도 결정 사항이며 이번 단계의 차단 요인이 아닙니다.


## 5단계 실행 결과

사용자 승인: 다음 단계 진행과 겹치는 단축키/편집 동작 최대 공용화, 더 최근인 Loud 편의 기능의 Mono 적용 검토. 앞서 결정한 화면 QA 추후 일괄 진행을 유지합니다. 상세 계약·공통화 범위·수동 QA는 [editor-migration.md](editor-migration.md)에 기록했습니다.

### 재사용과 변경

- Mono 가사 타임라인/선택·resize·스냅·영어·영상·SRT를 이관하고 shadcn 경계만 교체했습니다. Loud CallGuideEditor/패턴·펄스·스냅샷·텍스트·아이콘도 기존 구현에서 이관했습니다.
- `/musics/[id]/lyrics`, `/calls`를 같은 관리자 sidebar/layout에 연결했습니다. sidebar 곡 전환 시 편집 종류를 유지합니다. 가사가 없는 곡은 상세로 이동하며 트랙 생성은 6단계입니다.
- 실제 겹치는 단축키·bounded history·기준점 확대·viewport 판정·dirty/busy·초안 복사는 관리자 `editors/shared`가 소유합니다. 볼륨도 공용 atom입니다. Mono에 undo/redo·선택 줄 반복·JSON 복사·공통 확대 조작을 적용했습니다.
- 공개 콜 렌더러/플레이어/clock/메시지를 `loudasobi-view`로 인계했습니다. Loud 기존 진입점은 re-export이며 새 관리자 미리보기도 같은 소스를 사용합니다. 관리자에서는 공개 Space 리스너를 끕니다.
- Mono 가사 입력 schema를 content-core로 추출하고 기존 Mono도 re-export합니다. 겹침 허용·ID·EN 계약을 보존했습니다. 관리자 가사 API에 revision 보호를 추가했습니다.
- 콜 저장은 기존 transaction/revision에 sourceRevision 구분을 더해 원문 수정 이후 오래된 초안 저장을 거부합니다. 가사 저장 뒤 콜 참조 경고를 재계산하되 콜 문서는 자동 변경하지 않습니다.
- 공통 guard에 history 처리도 연결했습니다. 구형 브라우저의 guard 이전 항목 fallback은 forward history를 잘라낼 수 있고 실제 브라우저 동작은 미검증입니다.

### 실행 검증

| 검사 | 결과 |
| --- | --- |
| 전체 workspace lint·typecheck | 모든 앱/패키지 통과, 경고 없음 |
| core / admin editor / admin security | 각 3 / 4 / 3개 통과 |
| Mono 기존 activeLyric·timelineSnap | 2개 통과 |
| npm ci dry-run offline | 통과. clean install/빌드 결과가 아님 |
| 기존 local-flow-check | 로그인·역할·Origin·곡/설정 분리 저장·필드 보존·공개 HTTP 반영 통과 |
| editor-flow-check | API 401/403/400/404/409, 줄 ID·EN·소유 필드 보존, 가사-콜 동시 수정 충돌·낡은 anchor 경고, 두 편집 URL 200 통과 |
| 데이터 복원 | 편집 검사 합성 lyric/call/settings fixture와 시각을 원래 값으로 복원. 기존 local-flow-check의 저장 시각 갱신 계약은 유지 |
| 원본 보존 | 원본 Mono/Loud status clean, HEAD `2241c2e` / `a9ade43` 동일 |

정적 검사와 HTTP 검사는 실제 재생·키 입력·드래그·history 브라우저 QA를 대신하지 않습니다. 합성 DB에는 확인용 곡 하나뿐이며 전체 실제 콘텐츠 검증이 아닙니다. 운영 DB/R2/DNS 변경·production build·배포·push는 이번 단계에서 하지 않았습니다.

### 세부 커밋

| 커밋 | 제목 |
| --- | --- |
| `ac981e8` | Share call rendering and playback views |
| `b41dcfd` | Migrate editor saves with source conflict checks |
| `88badba` | Share editor shortcuts history and zoom |
| `393321d` | Migrate lyric and call editors with shared controls |
| `30d2fe3` | Connect standalone editor routes and navigation guards |
| `40c36db` | Verify editor saves against isolated local fixtures |

지침·진행·재사용·QA 문서는 별도 마지막 커밋으로 기록합니다. 자기 해시를 쓰기 위해 amend하지 않습니다. 새 의존성은 원본 아이콘/패널에 쓰던 기존 라이브러리와 이미 쓰던 tsx 검사 도구이며 새 편집 프레임워크는 추가하지 않았습니다.

**다음 재개:** 사용자 요청 시 6단계 원작·서적·가사 문서 생성·추천/정렬 등 나머지 관리자 기능을 원본 목록과 대조해 이관합니다. 3~5단계 UI·재생 QA는 나중에 일괄 진행하며 이미 완료한 로컬 이관을 재작성하지 않습니다. 기존 두 관리자/API는 전환 QA와 9단계 종료 승인 전까지 임시 유지합니다. 원본·운영 데이터는 계속 보존합니다.


## 6단계 실행 결과

사용자는 6단계 진행을 요청했고 기존 QA·검토사항은 별도로 진행해 결정이 모이면 한꺼번에 반영하기로 했습니다. 이관 작업을 보류한 결정의 승인으로 해석하지 않습니다. 자세한 기능 대조·경로·한계는 [content-migration.md](content-migration.md)를 읽습니다.

### 재사용과 범위

- Mono 원본 문서 editorConfigs·payload·선택/연결 계산·조회·CRUD를 이관했습니다. 공용 shadcn 필드와 관리자 URL/공통 guard에 연결했으며 새 CMS나 폼 프레임워크를 추가하지 않았습니다.
- 곡 생성/선택적 앨범아트, 소설/만화/서적 CRUD, 가사 JSON 생성/수정/삭제, 곡별 연결 콘텐츠 탐색과 전체 서적, 곡 숨김/복원을 연결했습니다. SRT/타임라인/앨범아트 쓰기는 기존 구현을 재사용합니다.
- 가사 JSON 수정은 5단계 saveLyrics로 단일화하고 편집 시작 revision을 유지합니다. 삭제에도 revision을 확인합니다. 소설/만화/서적 메타데이터는 기존처럼 revision이 없어 동시 편집 시 마지막 저장이 적용될 수 있습니다.
- 서적 관계·구매 링크 교체와 소설 삭제는 트랜잭션으로 처리합니다. 숨긴 곡의 novel 관계도 기존 서적 payload에서 보존합니다. 존재하지 않는/중복 novel ID를 거부하며 출판 소설의 bookId 참조가 남은 서적 삭제는 409입니다.
- Loud 추천 그룹/정렬 UI·drag/button·미리보기·ko/ja/en 이름·query/mutation·revision/membership을 재사용했습니다. 공개 알림 실패는 저장 실패와 구분하고 재시도 UI에 연결했습니다.
- 기존 공개 파일 제공·독자 인증·Agent 읽기는 각 공개 앱에 유지합니다. 원본 관리자에 없는 소설/만화 파일 업로드·비공개 본문 편집기를 새로 만들지 않았습니다.

### 실행 검증

| 범위 | 결과 |
| --- | --- |
| 전체 workspace lint/typecheck | 모두 통과. 마지막 연결 수정 후 admin lint/typecheck도 통과 |
| core/editor/security/content 계약 | 각 3/4/3/2개 통과 |
| 기존 local-flow-check | 곡/설정 분리 저장·권한·공개 HTTP 반영 회귀 통과 |
| 기존 editor-flow-check | 가사/콜 충돌·ID/영어·필드 소유권 회귀 통과, 편집 fixture 복원 |
| 새 content-flow-check | 인증/Origin/입력·CRUD·숨긴 novel의 서적 관계·잘못된 관계 요청 시 기존 값 유지·가사 삭제 revision·곡 숨김/복원 자료 보존·추천 충돌/현재곡 집합·신규 페이지 200 통과 |
| 데이터 보존 | 콘텐츠 검사 종료 시 합성 10개 테이블의 값·시각을 원래 snapshot으로 복원. 기존 local-flow-check의 저장 시각 갱신 계약은 유지 |
| 원본 보존 | Mono/Loud status clean, HEAD `2241c2e`/`a9ade43` 유지 |

미검증: 브라우저 입력/추천 drag·실제 데이터 전수·R2 업로드/부분 실패 재시도·빌드·배포. 사용자 QA를 통과한 것으로 처리하지 않습니다. 이번 단계에서 운영 DB/R2/DNS·원격·push·production build를 실행하지 않았고 새 의존성·DB schema/migration 변경도 없습니다.

### 세부 커밋

| 커밋 | 제목 |
| --- | --- |
| `0477965` | Migrate content APIs and preserve document relationships |
| `58a7539` | Connect shared content forms and music lifecycle pages |
| `bc3ca58` | Migrate recommendation groups and ordering |
| `06fd5af` | Verify content writes and relationship preservation |

지침·진행·재사용·기능 대조 문서는 마지막 별도 커밋으로 기록하며 자기 해시를 위해 amend하지 않습니다.

**다음 재개:** 사용자 요청 시 7단계 Mono 공개 UI 전환을 기존 화면부터 이관합니다. 기존 QA·이미지 선정/운영 키 교체·갱신 지연·원격/도메인/배포·보존 기간 검토는 별도 진행 중입니다. 결정이 모이면 함께 반영하며 다시 승인된 항목을 묻거나 운영 변경을 선행하지 않습니다. 예전 관리자/API는 9단계 전환 확인 전까지 유지합니다.


## 7단계 실행 결과

사용자 확정: 두 앱이 같은 팬 활동에서 나온 서비스로 보이도록 반복 패턴 기반 최소 디자인 시스템을 적용합니다. 소설/가사/콜 읽기 위계는 별도 역할입니다. 소설 뷰어는 스타일 혼용을 금지하고 사용자 직접 조정 화면 보존을 최우선으로 하며, 이번에는 전체 CSS Modules 유지로 결정했습니다. QA/운영 검토는 사용자가 별도로 진행해 모이면 반영합니다.

### 변경과 소유권

- 일반 제목·본문·설명·라벨·메타 정보의 `type-*` 역할을 ui/styles.css에 정리하고 Mono/Loud/새 관리자에 연결했습니다. 기존 공용 팔레트를 Mono 일반 공개 UI에도 적용했습니다.
- Mono 일반 공개 화면의 Radix 부품을 ui shadcn/HTML로 옮기고 공개 CSS Modules 18개, 새 관리자 모듈 2개를 Tailwind로 정리했습니다. 기존 콘텐츠/조회/라우팅/권한·재생/편집 훅은 보존했습니다.
- Resizable은 ui의 실제 공용 구현으로 인계했습니다. Mono/새 관리자 모두 기존 API·18px handle을 사용합니다.
- 소설 원래 Markdown 문법/스타일은 보존합니다. Markdown 경계에서 기존 gray-12를 명시하고 비시각적 viewer marker로 기존 읽기 canvas를 유지합니다. 소설의 기존 Ref/ScrollArea/모바일 여백·본문 폭은 그대로입니다.
- Radix Theme/CSS는 소설과 종료 전 관리자 때문에 유지합니다. legacy/base/utilities 레이어로 분리하고 Tailwind preflight를 넣지 않았습니다. Radix 완전 제거 완료로 보고하지 않습니다.

상세 규칙은 [ui-design-system.md](ui-design-system.md), 검증/예외는 [ui-migration.md](ui-migration.md), 소설 기준 hash는 [novel-style-baseline.json](novel-style-baseline.json)을 따릅니다.

### 실제 검사

| 범위 | 결과 |
| --- | --- |
| 전체 lint/typecheck | 모든 앱/패키지 통과. 마지막 Mono 제목/버튼 수정 후 Mono 재검사 통과 |
| UI 보존 계약 | 소설 hash/문법·뷰어 혼용 금지·모듈 잔여 경계·공통 역할 통과 |
| 브라우저 소설 스타일 대조 | 로컬 Guide의 동일 조건에서 11개 예시 47개 요소 × 19개 computed 속성 차이 0. 조건은 기본 밝은 테마/바탕 폰트이며 전체 픽셀·모든 기기 검증이 아님 |
| 기존 집중 검사 | core 3·editor 4·content 2·fullscreen/activeLyric/snap 6개 통과 |
| 편집 HTTP | 기존 합성 DB 가사/콜 권한·revision·EN/ID·필드 보존 통과, fixture 원복 |
| 공개 개발 HTTP | Mono 홈/guide/players/heartbeat/onthestage/private, Loud 홈 모두 200 |
| 실제 CSS 파싱 | 브라우저 CSSOM에서 safe-area 포함 전체화면 width 계산 유효성 확인 |
| 설치/원본 | npm ci dry-run offline 통과. 원본 Mono/Loud status clean·HEAD 2241c2e/a9ade43 보존 |

브라우저 비교 중 주변 카드의 색상 상속과 reset 레이어가 실제 스타일 차이를 만드는 것을 확인해 경계에서 수정한 뒤 재대조했습니다. 검사를 통과시키기 위해 기존 소설 값을 새 디자인 값으로 바꾸지 않았습니다.

남음: 실제 소설 전수/다른 뷰포트/다크·고딕·스크롤·모바일 영상/iframe·편집 드래그·인증/읽기 QA. 정적/합성 검사를 사용자 QA나 운영 검증으로 대체하지 않습니다. Production build·운영 DB/R2/DNS·push·배포는 이번에 하지 않았습니다.

### 세부 커밋

| 커밋 | 제목 |
| --- | --- |
| `7e43aa2` | Share UI typography roles and resizable panels |
| `a534675` | Unify Mono public UI and preserve novel presentation |
| `af90f3d` | Replace admin timeline modules with Tailwind variants |
| `fbacb4d` | Guard novel rendering and UI ownership contracts |

인계 문서는 별도 세부 커밋으로 남깁니다. 자기 해시를 위해 amend하지 않습니다.

**다음 재개:** 사용자 요청 시 8단계 저장 반영·캐시·열린 화면/재생 유지·환경 분리를 검증합니다. 사용자 QA·이미지 선정/운영 키 교체·갱신 지연·원격/배포·보존 기간 결정은 별도이며 답변이 모이면 함께 반영합니다. 소설 보존을 위한 Radix 예외를 청소 대상으로 오해하지 마세요.


## 7단계 후속 — 소설 Themes 부품 교체

사용자는 소설 뷰어의 Tailwind/CSS Modules 혼용 금지를 철회하고, 기존 Radix 부품을 Tailwind로 대체하도록 승인했습니다. 사용자 직접 조정 문법/화면 보존 조건은 유지합니다. 이 결정이 위 초기 7단계의 전체 모듈/혼용 금지 결정을 대체합니다.

- Heading/Text/Flex를 HTML + 기존 정확한 크기·행간·자간·여백의 Tailwind로 대체했습니다. h4→h3 매핑, remark-breaks, 화자 분리, 글꼴/문단/인용/목록 모듈 규칙은 유지합니다.
- ScrollArea는 공용 shadcn을 재사용하고 viewportRef/viewportProps.onScroll로 기존 위치 저장/복원을 연결했습니다. Reader 모듈은 viewport 선택자만 변경했습니다. 기존 세로 스크롤/읽기 폭/스크롤바 수치도 유지합니다.
- 소설 부품의 Themes import는 0입니다. 앱 전체 Theme/CSS는 종료 전 관리자와 읽기 색상 변수/애니메이션·기본 상속 때문에 유지합니다. shadcn 내부 Radix primitive를 제거한 것은 아닙니다.
- Guide에서 밝음/어두움 × 바탕/고딕 4조합, 각 11개 문법 예시의 47개 요소 × 25개 computed 속성을 변경 전과 비교해 차이 0을 확인했습니다. 전체 실제 소설/모바일 픽셀 QA는 남습니다.
- 임시 합성 본문의 기존/변경 뷰포트 460×648px, 본문 영역 폭 412px, 스크롤 길이 7329px이 같았습니다. 키보드 이동 후 새로고침 위치 608→608 복원도 확인했습니다. 임시 route/Markdown/기존 사본은 삭제했으며 운영 데이터는 사용하지 않았습니다.
- 자동 보존 검사는 최초 사용자 모듈 hash를 유지하고 승인된 렌더러 hash를 별도로 기록하도록 변경했습니다. 혼용 금지 대신 공개 Themes import 제거를 검사합니다. 실제 픽셀/사용자 QA를 대신하지 않습니다.

검증: Mono lint/typecheck, `npm run check:ui`, `git diff --check` 모두 통과했습니다. 위 브라우저 비교와 합성 본문 검증도 통과했습니다. 실제 소설 전수/모바일·좁은 화면/서체 로딩 지연/끝까지 읽은 뒤 위치 초기화 QA는 남습니다.

| 커밋 | 내용 |
| --- | --- |
| `e8210cc` | Replace novel Themes components with Tailwind |

사용자 결정·진행·재사용·검증 문서는 별도 커밋으로 기록하며 자기 해시를 위해 amend하지 않습니다. 푸시·빌드·배포·운영 변경은 하지 않았습니다. 다음 단계는 사용자 요청 시 8단계입니다.


## 8단계 실행 결과

사용자 확정: 두 공개 앱은 실시간 갱신 서비스가 아니며 DB 저장 시 기존 캐시만 초기화합니다. 비캐시 조회에 새 캐시를 넣지 않고 현재 화면을 자동 교체하지 않습니다. 로컬 재생/볼륨·읽던 위치 등은 기존대로 유지합니다. 개발/운영 분리는 실제 설정 변경 전에 계획 보고를 요청했습니다. 이 결정이 초기 청사진의 focus/주기 확인·즉시 반영 검토를 대체합니다.

### 코드와 재사용

- Mono 기존 `use cache`/`public-catalog`/hours·보호된 무효화 API와 관리자 서버의 저장/알림 분리·재시도를 재사용합니다. 공통 곡/가사/원작/서적 변경 후 다음 서버 조회에서 최신 자료를 읽습니다. Mono 캐시 구현/수명은 바꾸지 않았습니다.
- Loud는 기존 `connection()` 후 매 요청 DB 조회를 유지합니다. 공개 mount/focus/catalog storage `router.refresh` 훅과 불필요한 internal/revalidate endpoint를 제거했습니다. 새 캐시/폴링/웹소켓은 추가하지 않았습니다.
- 관리자 알림은 Mono만 실제 전송하며 Loud-only 범위는 빈 결과입니다. 콜/offset 저장은 Mono 캐시를 초기화하지 않게 범위를 수정했습니다. 설정/추천도 기존 Loud-only 범위를 유지합니다.
- 실패 문구는 열린 화면 갱신이 아닌 서버 캐시 초기화로 명확히 했습니다. 재생·볼륨·선택곡·언어·읽던 위치 구현은 변경하지 않았으며 로컬 storage/visibility 동작은 남겼습니다.
- 직접 SQL/외부 도구 갱신은 자동 감지하지 않습니다. Mono 무효화 호출 또는 기존 TTL이 필요합니다. 이미 받은 Router/prefetch 결과까지 즉시 교체한다고 보장하지 않습니다.

### 환경 계획과 실제 읽기 확인

계획은 [cache-and-environments.md](cache-and-environments.md)의 개발/프리뷰/운영 표와 순서로 먼저 보고했습니다. 실제 `.env.local`이나 자원/배포 설정은 변경하지 않았습니다.

- 세 앱이 같은 기존 합성 SQLite를 사용하며 파일이 존재합니다. R2 인증값/private·album 쓰기 버킷은 미설정입니다. Mono 무효화 비밀값 쌍은 일치하고 로컬 주소를 사용합니다. 값은 출력하지 않았습니다.
- storage의 버킷 미지정 fallback을 확인해, 개발용 인증키를 추가할 때 검증 버킷을 명시해야 함을 보고했습니다. 실제 쓰기 자원/권한 변경이나 새로운 방어 코드를 승인 없이 적용하지 않았습니다.
- Vercel Development/Preview/Production 매핑·별도 프리뷰 DB/R2는 배포 연결 단계에서 읽기 확인할 계획입니다. 환경 분리가 실제 운영에 적용 완료된 상태가 아닙니다.

### 실행 검사

| 범위 | 실제 결과 |
| --- | --- |
| 변경 앱 lint/typecheck | adminasobi/loudasobi 통과 |
| 기존 security 집중 검사 | 3개 통과. Mono 성공·HTTP/응답/통신/설정 실패, Loud-only 네트워크 0, mixed 요청의 Mono-only 호출 확인 |
| 기존 local-flow HTTP | Mono 무인증/잘못된 비밀값 401·잘못된 범위 400·유효 요청 200. 공통/설정 분리 저장·필드 보존·두 공개 앱의 다음 HTTP 조회 반영 통과 |
| 기존 editor HTTP | 권한/Origin·revision·가사 ID/EN·필드 소유권 회귀 통과, 합성 fixture 정확히 복원 |
| 기존 content HTTP | CRUD/관계·가사 삭제·숨김/복원·추천 충돌/캐시 알림 범위 회귀 통과, 합성 fixture 정확히 복원 |
| 로컬 상태 소스 | 공용 재생기/Mono 재생·볼륨·로컬 atoms 변경 없음 |

개발 HTTP 결과를 production 캐시 검증으로 처리하지 않습니다. 실제 배포 간 알림·브라우저/기기별 재생과 볼륨·환경 분리·기존 사용자 QA는 남습니다. 기존 local-flow의 저장 시각 갱신 계약을 유지했으며 운영 DB/R2/DNS·실제 환경값·production build·push·배포는 변경/실행하지 않았습니다.

| 커밋 | 제목 |
| --- | --- |
| `f64b322` | Stop automatic public catalog refresh |
| `a845521` | Invalidate only existing public server caches |

계획·결정·진행 지침은 별도 마지막 커밋으로 남기며 자기 해시를 위해 amend하지 않습니다. 다음 재개는 사용자의 환경 계획 검토 결과와 9단계 요청에 따릅니다. 이전의 이미 열린 화면 자동 갱신 계획을 다시 구현하지 마세요.


### 8단계 후속 결정 — 환경 분리 제외

사용자는 개발 환경에서 운영 DB를 사용하는 기존 방식에 익숙하므로 환경 분리는 고려하지 말고 그대로 적용하도록 확정했습니다. 위 환경 계획 검토 대기는 종료하며, 별도 DB/R2·환경별 비밀값 분리를 추가 작업이나 9단계 선행 조건으로 요구하지 않습니다.

캐시 코드는 이미 적용되어 있으며 이번에는 지침·현재 상태·환경 문서만 갱신했습니다. 실제 `.env.local`·DB/R2 연결값·런타임 코드는 변경하지 않았습니다. 합성 fixture 회귀 검사의 로컬 전용 제한은 유지하며 실제 배포/사용자 QA를 완료 처리하지 않습니다. 다음 단계는 요청 시 9단계입니다. 문서 변경이므로 런타임 검사는 반복하지 않았습니다.


## 후속 실행 — 세 앱 운영 DB 연결

사용자 요청: 원래 사이트처럼 개발/운영 DB를 분리하지 않고 실제 운영 DB에 연결합니다. 원본 Mono `.env`와 Loud `.env.local`이 같은 운영 DB와 토큰을 사용하는지 값 노출 없이 확인한 뒤, 새 세 앱의 무시된 `.env.local`에서 DB 두 항목만 적용했습니다. 원본 환경 파일과 다른 인증/R2/공개 주소 값은 수정하지 않았습니다.

검증:
- 읽기 전용 트랜잭션 SELECT: musics 36, lyric_tracks 36, novels 38, comics 3, books 3, Loud settings 36, call_guides 36건.
- 로컬 서버 3100/3101/3102 재시작 후 공개 Mono/Loud 홈 200·기존 운영 곡 확인, 인증된 관리자 목록 36곡·ID 0 상세 200.
- 합성 fixture 전용 local-flow-check가 현재 원격 설정에서 네트워크 요청 전에 중단함을 확인했습니다. 운영 저장/migrate/seed는 수행하지 않았습니다.
- 실제 환경 파일/이전 로컬 DB 연결 복구 자료의 Git 제외를 확인했습니다. 비밀값은 출력/커밋하지 않았습니다.

런타임 코드를 바꾸지 않아 lint/typecheck는 반복하지 않았습니다. DB 연결 외 운영 데이터/스키마·R2/DNS·빌드·푸시·배포는 변경하지 않았습니다. R2 인증 미설정과 소설 개발 모드 로컬 Markdown 경로는 남아 있어 원문/파일 열람 검증은 별도입니다. 연결 기록/복구 경로는 cache-and-environments.md를 따릅니다. 지침·상태 기록만 로컬 커밋하며 환경 비밀값은 포함하지 않습니다.


## 후속 실행 — R2 원문 연결·소설 로컬 편집 유지

사용자가 소설/만화 원문 연결을 승인하고 Mono의 소설 로컬 편집 개발 코드를 유지하도록 요청했습니다. 기존 Mono R2 설정을 새 Mono의 무시된 `.env.local`에만 연결하고 서버를 같은 3100 포트로 재시작했습니다. DB/인증/공개 주소/앨범아트 대상·관리자/Loud 환경값은 보존했습니다.

- 런타임 코드는 변경하지 않았습니다. `NODE_ENV=development`의 `/novel/{id}.md` 편집 경로와 운영의 R2 API 분기를 그대로 유지합니다.
- 원본 로컬 원고 4개를 새 `apps/monoasobi/public/novel`로 바이트 동일하게 복사했습니다. 기존 대상 파일은 덮어쓰지 않으며 Git 제외를 확인했습니다.
- R2 공개 소설 API 200·Markdown/no-store, 보호 소설 비로그인 401을 확인했습니다. 만화 3편 목록(66/58/55페이지)과 각 첫 이미지 200/image 응답을 확인했습니다. 처음 검사에서는 Next의 localhost origin을 127.0.0.1과 다르다고 거부한 검사 조건을 조정했으며 앱 코드는 변경하지 않았습니다.
- 로컬 원고 4개 HTTP 200·원본 파일 SHA-256 일치, `npm run check:ui` 소설 소스/스타일 계약 통과. 런타임 코드 변경이 없어 lint/typecheck는 반복하지 않았습니다.

비밀값/원고는 커밋하지 않고 연결·보존·검증 기록만 커밋합니다. R2 업로드/삭제/공개 설정·운영 DB·DNS·빌드·배포·푸시는 변경하지 않았습니다. 만화 전체 페이지/인증된 보호 본문/실제 편집·기기 QA는 남습니다. 다음 단계는 요청 시 9단계입니다.


## 후속 실행 — 앨범아트 운영 전환·배포 인계

사용자 결정: 앨범아트 QA 통과·운영 교체 승인, 사이드바 200px 유지. GitHub 연결/배포는 사용자가 직접 하며 에이전트는 로컬 커밋까지만 합니다. 정상 배포/새 관리자 동작 확인을 알려주면 기존 관리자 쓰기 제거를 지체 없이 진행합니다. 시점 확인에 **지금 전환 — 현재 운영 배포의 호환 경로와 캐시까지 처리하기**로 답했습니다.

완료:
- 세 앱 사이드바의 요청 크기를 200px로 고정했습니다. 공용 AlbumArtwork의 선택적 requestWidth만 추가하고 표시 크기/다른 화면 srcset/blob 미리보기는 보존했습니다.
- 최신 DB/manifest 36곡 일치 확인, 공개 버킷 3000px 36개 해시 확인, 기존 비공개 버킷에 같은 새 키의 200px 호환본 36개 추가, CDN 200px 36개 디코딩 후 CAS 트랜잭션으로 DB 키를 전환했습니다. 기존 파일/공개 설정은 보존했습니다.
- 기존 운영 Mono 관리자에서 첫 곡의 최신 값을 그대로 재저장해 기존 public-catalog 태그를 초기화했습니다. 전체 행 비교에서 이미지 키/updated_at 외 필드 변화 없음, 구버전 프록시 36개 200·200×200, 운영 홈 200·새 키 36개를 확인했습니다.
- 로컬 Mono/Admin 전용 앨범아트 버킷 명시, Admin R2 인증 연결 후 해당 서버만 기존 포트로 재시작했습니다. Mono/Loud 홈 200·새 키 36개, 인증된 Admin 상세 200·새 키를 확인했습니다. 초기 Admin HTTP probe는 잘못된 /api/auth/login으로 404였고 기존 /api/admin/auth/login으로 수정해 통과했습니다. 앱 API 변경은 없었습니다. Loud Sidebar는 client mount 후 표시되므로 서버 HTML만으로 실제 화면을 검증했다고 하지 않습니다.
- 전체 workspace lint/typecheck, content-core 3개 검사, 소설 보존 UI 계약 검사, 공용 이미지 SSR 고정200/일반srcset/blob 확인, script syntax 및 diff whitespace 검사를 통과했습니다. 운영 DB에 합성 fixture 검사는 실행하지 않았습니다.
- `docs/production-environment.md`에 앱별 실제 운영 변수, 기존 설정 대비 변경점, 배포 순서, 관리자 종료 조건을 정리했습니다. `.env.example`의 별도 환경 강제 문구를 사용자 결정과 맞췄습니다. 비밀값과 백업은 커밋하지 않았습니다.

| 커밋 | 제목 |
| --- | --- |
| `cb73ba9` | Keep sidebar artwork requests at 200 pixels |
| `deaa1b2` | Activate high resolution artwork with legacy compatibility |

운영 연결/복구 상세는 [album-art-delivery.md](album-art-delivery.md), 배포 변수와 순서는 [production-environment.md](production-environment.md)를 봅니다. 문서/템플릿 인계는 별도 마지막 커밋으로 기록합니다. 그 커밋의 자기 해시를 위해 amend하지 않습니다.

남음: 사용자 전체 QA/실제 배포 빌드·배포, 배포 사이 Mono 무효화 API 확인, 새 관리자 인증 저장/R2 실패 정리 통합 QA, 성공 확인 후 기존 관리자/쓰기 API 제거. 현재 이미지 36곡에 대한 구버전 호환만 마련했으며 새 배포 전 추가 이미지 교체는 피합니다. 기존 버킷/원본 저장소 삭제나 운영 환경별 분리는 작업에 포함하지 않습니다.


## 저장소 이름 변경

사용자 요청으로 로컬 저장소 폴더를 `/Users/nine/Documents/work/asobi-workspace`로 변경하고 루트 npm 이름/lockfile을 `asobi-workspace`로 맞췄습니다. 앱/공용 패키지의 @asobi 이름과 서비스 브랜드는 유지합니다. 현재 Git 원격은 연결되어 있지 않아 원격 저장소 이름 변경은 없습니다. 코드 동작 변경이 없어 lint/build는 반복하지 않으며 JSON 정합성과 workspace 해석을 확인합니다. 개발 서버는 같은 3100/3101/3102 포트로 재시작합니다.


## QA 수정 — 소설 개발용 로컬 원고 누락

군청 `/novel/4`에서 HTML이 본문으로 표시됐습니다. 원본 NovelReader도 개발 모드에서는 `/novel/{id}.md`, 운영 모드에서는 R2 API만 읽습니다. 로컬 누락 시 R2 fallback은 원본에 없습니다. 새 프로젝트에는 앞서 34~37 원고만 복사돼 있어 없는 `/novel/4.md` 요청이 Next HTML 응답으로 연결됐습니다. 기존 `monoasobi-contents/novel`의 숫자 ID Markdown 중 누락 28개를 바이트 동일하게 복사했고 기존 4개는 덮어쓰지 않았습니다. 현재 로컬 원고는 32개입니다. 원고는 모두 Git 제외입니다.

처음 추가한 로컬 누락/R2 fallback helper와 검사 파일은 사용자의 원본 유지 지시에 따라 전부 철회했고 NovelReader를 변경 전 그대로 복구했습니다. 최종 런타임 코드 변경은 없습니다. 군청 정적 원고 HTTP 200·text/markdown·원본 SHA-256 일치·HTML 아님과 기존 UI/소설 보존 계약 검사 통과를 확인했습니다. DB/R2 객체·소설 스타일·로컬 편집 분기는 바꾸지 않았습니다.


## QA 후속 결정 — 로컬 우선·R2 전환

사용자가 원본 재확인 후 로컬 소설 파일 전체 삭제와 로컬 파일 누락 시 서버 조회를 명시 승인했습니다. 새 Mono public/novel의 Markdown 32개를 삭제했습니다. 원본 monoasobi-contents 및 원본 앱 파일/R2 객체는 보존했습니다. 개발에서는 로컬 원고를 no-store로 먼저 요청하고, 404 또는 Next HTML 응답이면 기존 독자 인증이 적용된 R2 API를 호출합니다. 운영에서는 기존처럼 R2 API만 호출합니다. HTML은 소설로 렌더링하지 않으며 인증 실패/서버 오류는 기존 오류 표시로 처리합니다. 원고를 자동 복사해 되살리지 않습니다.

NovelReader의 로딩 부분만 작은 helper로 분리했습니다. JSX·스크롤·Markdown renderer·CSS는 동일함을 diff로 확인했고, 승인된 로딩 변경에 대해서만 소설 소스 해시를 갱신했습니다. 로컬 우선/404/200 HTML/R2/401/500/HTML 거부 7개 경우 집중 검사와 UI 보존 계약, Mono lint/typecheck 통과. 실제 개발 서버의 군청 요청이 로컬 200 HTML → R2 200 text/markdown으로 전환되어 본문을 읽는 것까지 확인했습니다. DB/파일 쓰기는 하지 않았고 원문은 커밋하지 않았습니다.


## QA 수정 — 공용 주조색 #F2285A

Mono 사이드바 정식 발매 배지는 공용 Badge의 bg-primary를 사용하며 앱별 별도 배지색은 없었습니다. 짙은 색의 원인은 공용 라이트 primary가 magenta-600을 사용한 것이었습니다. 사용자 지정 #F2285A를 magenta-500에 명시하고 라이트/다크 primary·sidebar-primary를 모두 해당 값으로 통일했습니다. Mono/Loud/Admin은 같은 토큰을 소비합니다. 소설 문법별 스타일과 별도 읽기 색상은 변경하지 않았습니다.

검증: 전체 workspace lint/typecheck와 소설 UI 보존 검사 통과. 실제 localhost Mono/Loud의 제공 CSS에서 #f2285a와 두 모드의 primary/sidebar-primary → magenta-500 연결을 확인했습니다. 소설 로딩 변경 커밋은 `edd1a25`이며 브랜드 변경은 별도 커밋으로 남깁니다.


## QA 수정 — 본문 로딩 세로 중앙 정렬

공용 Loading이 최소 높이 160px만 사용해 소설 본문 상단에 머물렀습니다. 기존 flex column 본문 안에서 남은 높이를 채우도록 flex-1만 추가했습니다. 기존 justify-center/items-center·문구·스피너·접근성은 유지합니다. 소설 원고/렌더러/스타일은 변경하지 않았습니다. Mono lint/typecheck 통과. 실제 브라우저 화면 위치 확인은 사용자 QA로 진행합니다.


## 커밋 언어 지침 정정

사용자가 커밋 언어는 한글임을 재확인하고 지침 자체의 수정을 요청했습니다. 공통 ~/.codex/AGENTS.md, 루트 AGENTS.md/AGENT.md, 세 앱 AGENTS.md와 README의 현재 규칙을 간결한 한글 한 줄로 통일했습니다. 위 과거 영어 커밋 실행 기록과 기존 Git 이력은 재작성하지 않습니다. 앞으로는 세부 작업별 커밋을 한글로 남깁니다.


## QA 수정 — 작품 정보 헤더 상단 간격

사용자 요청으로 Mono ContentsContainer의 작품 정보 헤더 위치를 top-0에서 top-1(4px)로 조정했습니다. 소설 본문/스크롤/스타일은 변경하지 않았습니다. Mono lint/typecheck 통과.


## QA 수정 — Mono 설정 팝오버

공용 shadcn Popover/Button 사용은 유지했습니다. Mono가 전체 preflight를 사용하지 않아 남은 fieldset 기본 테두리/여백을 설정 그룹에서만 초기화하고, 팝오버의 중복 gap/space-y를 정리했습니다. Mono base 레이어의 shadcn button[data-slot=button]에 글자색 상속을 추가했으며 variant utility는 그대로 우선합니다. 시스템 다크모드가 앱 라이트 테마의 네이티브 글자색에 영향을 주지 않도록 html.light/dark color-scheme을 맞췄습니다. 소설 Markdown/스타일·전체 preflight는 변경하지 않았습니다.

Mono lint/typecheck·소설 UI 보존 검사 통과. 실제 개발 서버 CSS 반영을 확인했습니다. 현재 브라우저 조작 도구가 없어 열린 설정 화면과 테마 전환의 시각 검증은 사용자 QA로 남습니다. 코드 커밋: 1702c03.


## QA 수정 — 글꼴 버튼 미리보기 복원

원본 Header의 Text weight=bold와 Header.module.css .batangText(font-family: KoPub Batang, serif)를 재확인했습니다. 이관에서 빠진 KoPub 바탕 버튼의 글꼴 미리보기와 두 글꼴 라벨의 굵기를 기존 shadcn Button 내부 span/Tailwind로 복원했습니다. Mono lint/typecheck 및 KoPub WOFF2 HTTP 200 확인. 실제 브라우저 글꼴 표시는 사용자 QA로 확인합니다.


## QA 개선 — Loud 기준 Mono 설정 패널

사용자가 Loud 설정 패널을 기준으로 Mono 스타일 개선과 shadcn 활용을 요청했습니다. Loud의 기존 제목/설명/닫기/구분선/폭/반응형/스크롤 틀을 packages/ui의 SettingsPopover로 추출하고 두 앱에서 사용합니다. 공용 shadcn Popover/Button/Separator를 재사용합니다. 공통화 커밋은 a42794d입니다. Loud의 언어/테마 선택 및 번역/상태는 유지했습니다.

Mono Header에서 SettingsMenu를 분리해 같은 틀을 사용하고 기존 테마 두 가지는 아이콘 카드, 글꼴 두 가지는 체크 표시 목록으로 정리했습니다. 기존 appearance/font 저장 키·선택 동작과 KoPub 바탕 미리보기/굵기를 유지했습니다. Mono의 선택 테두리/배경은 라이트/다크 모두 primary를 따릅니다. 시스템 테마·언어 설정 등 새 기능이나 의존성을 추가하지 않았습니다.

전체 workspace lint/typecheck·소설 UI 보존 검사 통과 및 두 개발 홈 HTTP 200 확인. 소설 본문·재생·스타일은 변경하지 않았습니다. 현재 브라우저 조작 도구가 없어 열린 설정 팝오버·키보드/모바일·실제 선택 전환의 시각 확인은 사용자 QA로 남습니다.


## QA 수정 — 설정 그룹 간격 충돌 제거

공용 SettingsPopover의 space-y-5가 Mono fieldset의 m-0과 충돌해 테마/글꼴 그룹 간격이 사라졌습니다. 공용 본문을 flex column + gap-5(20px)로 변경해 자식 margin reset과 분리했습니다. 공용 제목/설명은 gap-1(4px), 두 앱의 글꼴/언어 선택 목록은 grid + gap-1.5(6px)로 명시했습니다. 패널 padding 16px·제목과 선택 항목 간격 12px·테마 카드 간격 8px은 유지합니다. 전체 lint/typecheck·소설 보존 검사 및 두 개발 홈 200 확인. 브라우저 시각 확인은 미검증입니다.

Mono 정식 발매 배지는 기존 공용 shadcn Badge 기본 variant를 그대로 사용하며 앱별 class override는 없습니다. 배경은 공용 primary #F2285A이고 글자는 primary-foreground(라이트 white-500, 다크 black-500)입니다. shadcn의 고정 색상이라고 설명하지 않습니다.


## QA 개선 — Mono 시스템 테마·설정 순서

사용자 요청으로 Mono 설정을 글꼴 → 테마 순서로 배치하고 Loud와 같은 라이트/다크/시스템 설정 세 카드로 구성했습니다. 기존 appearance 저장 키와 light/dark 값을 유지하며 저장값이 없는 경우 기본값은 Loud와 같은 system입니다. matchMedia change를 useSyncExternalStore로 구독해 시스템 설정 선택 중 OS 모드 변경을 반영합니다. 공개 html 클래스와 기존 Radix 읽기 테마는 같은 resolved light/dark를 사용합니다. 글꼴 선택/KoPub 미리보기와 기존 소설 스타일은 유지합니다.

Mono lint/typecheck·소설 UI 보존 검사 통과. OS 테마 변경/새로고침 후 선택 유지와 실제 화면 전환은 사용자 QA로 확인합니다.


## QA 수정 — 공개 헤더 배치 통일

Loud 헤더의 좌우 padding은 원래도 Mono와 같은 16px이었으나 40px 고정 grid 칸 때문에 32px 설정 버튼이 Mono보다 8px 안쪽에 놓였습니다. Loud를 Mono와 동일한 flex/justify-between·좌우16px/상하10px·높이56px·테두리/배경으로 맞추고 로고의 grid 전용 정렬을 제거했습니다. 두 header 클래스 일치 및 Loud lint/typecheck 통과.


## 관리자 QA — 곡 상세·콘텐츠 통합

사용자 브라우저 코멘트 1–5를 반영했습니다.
- 공통 곡 제목/콜 공개 상태를 두 카드 밖 최상단으로 이동하고 공통 앨범아트를 그 아래 최상단 섹션에 배치했습니다. 이미지 클릭으로 파일 선택, 새 파일명은 오른쪽에 표시하며 별도 파일 선택 행과 통합 관리자 3MB 제한을 제거했습니다. 등록/수정 공용 선택 UI를 사용합니다.
- 왼쪽 곡 정보↔원작·가사 문서는 상세 내부에서 전환하며 숨긴 폼은 유지합니다. 기존 가사/콜 타임라인은 별도 페이지로 유지합니다.
- 양쪽 폼은 같은 제목/설명/필드 간격을 사용하고 오른쪽의 중첩 카드 테두리를 줄였습니다.
- 원작 콘텐츠 탐색/상세를 소설·만화·가사·연결 서적 아코디언으로 합쳤습니다. 이미 있는 소설/만화/가사의 추가 버튼은 숨기고 빈 항목은 우측 + 아이콘을 사용합니다. 전체 서적 카테고리는 제거하되 독립 /books 기능은 유지합니다. 기존 콘텐츠 URL은 선택 항목을 보존해 곡 상세로 연결됩니다.

기존 CRUD/editorConfigs·가사 revision·viewer/Origin·미저장/저장 중 보호·캐시 알림을 재사용합니다. 가사 편집 데이터는 readLyrics가 반환한 revision의 원문으로 맞췄습니다. 통합 관리자만 이미지 바이트 상한을 해제하고 포맷·정지 이미지·40MP와 레거시 제한은 유지했습니다.

검증: 전체 workspace lint/typecheck·소설 보존 검사, 콘텐츠 계약 2개·보안 3개·storage 4개 집중 검사 통과. 실제 3MiB 초과 PNG와 WebP 처리 통과. 인증된 상세/내부 콘텐츠 200, 구 URL 307, 소설 추가 숨김/빈 만화 추가 노출/전체 서적 범주 제거, 대용량 잘못된 이미지 400, viewer 조회 200·추가 숨김·쓰기 403을 HTTP로 확인했습니다. 운영 DB/R2 쓰기 테스트·빌드/푸시/배포는 하지 않았습니다. 실제 파일 선택/미리보기·저장/닫기/이동 보호·모바일 시각 QA는 사용자 확인으로 남습니다.

커밋: ee31375 앨범아트 이미지 선택 방식 개선 및 용량 제한 해제 / 654a412 곡 상세 공통 정보와 콘텐츠 아코디언 통합. 환경변수 추가/변경은 없습니다.
