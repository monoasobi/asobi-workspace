# 공개 앱 서버 조회 점검 — 2026-10-21

## 후속 수정 완료 — Loud 공개 카탈로그 / Mono 만화 이미지

사용자 후속 요청으로 아래 최초 점검의 두 높은 우선순위 항목을 수정했습니다. `0bd437e`는 Loud getPublicCatalog를 경량 목록으로 바꾸고 getPublicMusicById로 선택곡만 관계 조회·계산합니다. 홈에는 전곡 가사/콜을 보내지 않습니다. 목록의 가사 유무는 SQL에서 배열 길이를 boolean으로 계산하며 JSON 본문은 반환하지 않습니다. 초기 홈 SQL은 2회, 곡 상세는 목록/정렬/선택곡 3회입니다. 쿼리 수가 아니라 데이터·계산 범위를 줄인 변경입니다.

`e4a2e2b`는 Mono 만화 두 API를 getComicContentAccess로 연결해 만화 ID 한 열과 활성곡 여부만 확인합니다. 이미지마다 DB 요청은 남아 있지만 만화·곡 전체 메타데이터는 더 이상 가져오지 않습니다. 파일 접근 확인과 no-store/R2 정책은 유지합니다. Agent API·구매정보·미호출 함수는 수정하지 않았습니다.

메모리 DB 검사와 두 앱 lint/typecheck, 기존 메타데이터/URL 검사, Loud 로컬 HTTP/브라우저 탐색·언어/iframe 유지 확인이 통과했습니다. 실제 오디오 전체 재생·모바일·운영 지연·운영 배포는 미검증입니다. 구체적 검증은 migration-status.md의 같은 날짜 후속 기록을 따릅니다. **아래 표는 수정 전 점검 시점의 기록**입니다.

## 범위와 판단 기준

MONOASOBI와 LOUDASOBI의 모든 런타임 DB 조회 함수, 호출 페이지/API, 클라이언트 전달 경로, 기존 캐시를 정적으로 대조했습니다. seed/seed-data는 운영 요청 경로가 아니므로 실행·최적화 대상에서 제외했습니다. 두 공개 앱의 소스는 수정하지 않았습니다. MINASOBI 리팩토링에서 공용 DB에 추가한 settings/callGuide 관계 정의는 ORM 조회용이며 테이블·인덱스·마이그레이션 변경은 없습니다.

관계 데이터는 함께 쓰는 화면 단위로 묶되, 불필요한 본문/JSON은 읽지 않는 것이 기준입니다. JOIN 한 번이어도 모든 곡의 대용량 데이터를 읽으면 비효율적일 수 있고, 권한·공개 여부 확인을 위한 별도 조회는 제거 대상이 아닙니다. SQL 횟수는 코드의 정상 조회 경로 기준이며 캐시가 있는 함수는 miss에서만 해당 DB 조회가 필요합니다. 운영 DB 실행시간·응답 바이트·접속량은 측정하지 않았으므로 아래 우선순위는 코드상 비용과 호출 빈도를 근거로 한 판단입니다. 무료 플랜이 주원인이라는 결론은 내리지 않습니다.

## 우선 개선 후보

| 우선순위 | 대상 | 확인한 문제 | 제안 |
| --- | --- | --- | --- |
| 높음 | Loud getPublicCatalog / PublicMusicPage | 모든 공개곡의 lyricJson/guideJson을 JOIN 한 번으로 읽고 전곡의 가사 검증·콜/표시 계산을 수행한 뒤 Client AppFrame에 전곡 track/sections 전달. 홈도 같은 layout 사용 | 가벼운 곡 목록과 선택곡 상세 분리. 홈은 상세 불필요. 곡 메타데이터/존재 확인도 경량 목록 사용. 현재 재생기·언어·뒤로가기 상태 보존 필요 |
| 높음 | Mono comic-file API → getComicById | 이미지마다 만화+곡의 전체 메타데이터 관계 조회 후 R2 요청. no-store로 재방문 시에도 파일 경로 재실행 가능 | 우선 활성 곡에 속한 만화 존재 여부만 조회. DB 요청 자체를 줄이는 제공 방식은 공개중단 반영·파일 접근 보호 조건을 유지하는 범위에서 별도 검토 |
| 중간 | Mono getAgentMusicsRaw / getAgentMusics / getAgentMusicById | 소설·만화 ID, 가사 존재 여부만 반환하면서 소설/만화 전체 행과 가사 JSON까지 읽음 | 소설·만화는 ID만, 가사는 musicId만 선택. 단일곡 함수는 ID 필터 유지 |
| 중간 | Mono searchAgentMusics | 비어 있지 않은 검색마다 위 전체 곡/관계 데이터를 읽고 서버 JS에서 제목 검색 | 우선 가사 JSON 제외. 검색 조건을 DB에서 적용하는 방향 검토. 기존 대소문자·부분문자열 의미와 특수문자 처리 보존 |
| 중간 | Mono getAgentCatalog | 전체 내보내기 목적상 목록 전체는 필요하지만, 곡의 관계에서 소설/만화 전체 행을 읽은 뒤 별도 목록으로도 재조회하며 불필요한 가사 JSON까지 읽음 | API 응답 구조 유지. 관계 ID/가사 존재만 조회하거나 소설·만화 결과를 재사용해 중복 읽기 축소. books는 독립 전체 목록이라 별도 조회 가능 |
| 낮음 | Mono getBookPurchaseInfoById | 단일 서적 관계 조회·기존 캐시는 적절하나 소설/곡 전체 행을 읽은 후 일부 필드만 반환 | 소설 id/title/writer, 곡 korTitle/deletedAt 등 실제 사용 필드만 선택 |
| 낮음 | Mono getSidebarItems | 공유 public catalog의 모든 소설/만화 메타데이터를 얻은 뒤 곡+첫 소설만 사용 | 현재 캐시와 공유 사용 이점이 있어 단순 분리로 쿼리를 늘리지 않도록 주의. 사이드바에 전달하는 소설 필드 축소부터 검토 |
| 정리 | Mono 미호출 함수 4개 | getMusicCatalog, getNovelById, getNovelByMusicId, getBookById의 현재 앱 내 런타임 호출을 찾지 못함. getMusicCatalog에는 불필요한 전체 가사 조회도 존재 | 실제 외부/도구 사용 확인 후 제거 후보. 미호출 함수는 현재 사용자 체감 지연의 원인으로 계산하지 않음 |

Loud는 getPublicCatalog가 React cache로 감싸져 있어 같은 서버 렌더에서 layout/page/generateMetadata의 호출을 재사용합니다. 호출부 세 곳을 보고 DB를 세 번 읽는다고 판단하면 안 됩니다. 요청 간 캐시는 추가하지 않는 기존 사용자 결정을 유지해야 합니다. 병목 후보는 쿼리 개수보다 전곡 데이터 양·전곡 계산·직렬화입니다.

Mono 만화는 각 이미지 요청이 별개 HTTP 요청이므로 React cache로 함수만 감싸도 이미지 요청 사이 DB 결과가 공유되지 않습니다. 20개 이미지가 실제 요청되면 파일 요청 경로에서 DB 접근 확인 20회가 발생하며, 이미지 목록 API의 DB 확인 1회가 별도로 있습니다. 이미지 lazy loading 때문에 모두 한꺼번에 실행된다는 뜻은 아닙니다. 접근 확인을 삭제하거나 비공개 R2 버킷을 공개하는 방안은 제안하지 않습니다.

## LOUDASOBI 전체 조회 함수

| 함수/보조 경로 | 현재 조회 | 호출/캐시 | 판단 |
| --- | --- | --- | --- |
| getPublicCatalog | musics+전용 settings+공통 lyric_tracks+call_guides, 활성+publish 필터, SQL 1회 | PublicMusicPage와 곡 page/metadata. React cache로 동일 렌더 중복 제거, 요청 간 캐시 없음 | 공개 필터와 JOIN은 적절. 전곡 본문/가사·콜 처리 범위가 과도 |
| readSidebarLayout | singleton 정렬 설정 SQL 1회 | PublicMusicPage에서 catalog와 병렬 | 적절. 설정은 곡과 독립 데이터 |
| PublicMusicPage | 위 2함수 병렬 조립 | 공통 공개 layout의 홈·곡 화면 | 홈에도 전곡 상세 전달하는 범위 개선 필요 |
| page 내부 getMusic | getPublicCatalog 결과에서 ID 탐색 | metadata와 page, getPublicCatalog 캐시 공유 | 독립 DB 쿼리는 아님. 존재·메타데이터에 전체 상세 의존은 개선 후보 |
| getRequestLocale | cookie/header 읽기 | React cache | DB 조회 아님, 이번 문제 대상 아님 |

## MONOASOBI 전체 조회 함수

| 파일/함수 | 조회 방식과 SQL | 현재 호출 | 판단 |
| --- | --- | --- | --- |
| publicCatalog/getPublicCatalog | 활성 곡+소설·만화 metadata+가사 musicId, 관계 SQL 1회 | sidebar, 상세 요약, static params, metadata | 일반 공개 목록은 이미 가사 JSON 제외. use cache/hours/public-catalog 태그 재사용이 적절 |
| publicCatalog/getSidebarItems | 위 캐시 결과에서 곡+첫 소설 추출, 추가 SQL 없음 | SidebarContent | 별도 목록쿼리 남발 없음. 전달 필드/불필요한 만화 metadata는 저우선 검토 |
| publicCatalog/getNovelSummaryById | 위 캐시 결과의 소설 ID 탐색, 추가 SQL 없음 | 소설 page/metadata | 정상. 상세마다 전체 DB를 새로 읽는 구조로 단정하지 않음 |
| publicCatalog/getComicSummaryById | 위 캐시 결과의 만화 ID 탐색, 추가 SQL 없음 | 만화 page/metadata | 정상 |
| publicCatalog/getSpecialPageSummaryByMusicId | 위 캐시 결과의 곡 ID 탐색, 추가 SQL 없음 | heartbeat/onthestage/players page/metadata | 정상 |
| publicCatalog/getNovelStaticParams | 위 캐시 결과의 소설 ID 목록, 추가 SQL 없음 | generateStaticParams | 목적에 맞는 전체 ID 목록 |
| publicCatalog/getComicStaticParams | 위 캐시 결과의 만화 ID 목록, 추가 SQL 없음 | generateStaticParams | 목적에 맞는 전체 ID 목록 |
| lyric/getLyricTrackByMusicId | 선택곡 가사 SQL 1회, 활성곡 subquery 포함 | 소설·만화·특수 페이지, 기존 태그/hours 캐시 | 선택곡 기준으로 적절. subquery는 별도 DB 왕복 아님. 반환 시 영어 제거하지만 DB에서는 기존 JSON 전체 읽음 |
| book/getBookPurchaseInfoById | 선택 서적+연결 소설+곡+구매링크 관계 SQL 1회 | 출판 소설 page, 기존 태그/hours 캐시 | 조회 단위 적절. 전체 열 조회는 축소 후보 |
| book/getBookById | 위와 비슷한 단일 서적 관계 SQL 1회, 캐시 없음 | 현재 앱 내 호출 없음 | 중복/미사용 정리 후보 |
| novel/getNovelContentAccess | id/isPublished만 선택, 활성곡 subquery, SQL 1회 | 소설 본문 API | 권한 판단에 필요한 경량 조회. private/no-store와 독자 인증 유지 |
| novel/getNovelById | 소설+곡+서적 관계 SQL 1회, 활성곡 필터 | 현재 앱 내 호출 없음 | 구현상 ID 범위 적절. 미사용 정리 후보 |
| novel/getNovelByMusicId | 선택곡의 첫 소설+곡+서적 관계 SQL 1회 | 현재 앱 내 호출 없음 | 미사용 정리 후보. 복수 소설 전체 조회 함수가 아님 |
| comic/getComicById | 선택 만화+곡 관계 SQL 1회, 활성곡 필터 | 만화 이미지 목록/API 파일별 확인 | 관계 조회는 적절하지만 존재 확인 용도에 비해 반환량 과도, 이미지마다 반복 |
| music/getMusicById | 선택 활성곡 SQL 1회 | 레거시 앨범아트 API의 현재 키 확인 | 범위 적절. 필요한 id/albumArtKey만 읽는 축소는 가능하나 공용 CDN 경로와 분리해서 판단 |
| music/getMusicCatalog | 전곡+소설/만화/가사 전체 관계 SQL 1회 | 현재 앱 내 호출 없음 | 가사 존재만 쓰면서 JSON 조회하는 잔여 코드, 정리 후보 |
| agent/getAgentMusicsRaw (비공개 보조) | 전곡+소설/만화/가사 전체 관계 SQL 1회 | getAgentCatalog/getAgentMusics | 반환 계약에 비해 과조회 |
| agent/getAgentMusics | 위 결과에서 요약 추출, SQL 합계 1회 | 인증된 Agent 목록 API | 과조회 축소 후보 |
| agent/getAgentMusicById | 선택곡+소설/만화/가사 전체 관계 SQL 1회 | 인증된 Agent 곡 API | ID 범위 적절. 관계 열 축소 필요 |
| agent/getAgentCatalog | 곡 관계/소설/만화/서적 관계 총 4회 병렬 | 인증된 Agent 전체 export API | 전체 내보내기 자체는 정상. 중복 소설·만화 및 미사용 가사 JSON 조회는 개선 후보 |
| agent/searchAgentMusics | getAgentMusics 후 JS 제목 필터, SQL 합계 1회 | 인증된 Agent 검색 API | 검색 결과에 비해 전체 조회 범위 과도. 빈 검색은 SQL 0회 |
| activeMusic/activeMusicIds | 활성 ID subquery 구성, 단독 실행하지 않음 | 소설/만화/가사/Agent 필터 | 별도 SQL 요청으로 세지 않음 |
| mapper/toMusic·toNovel·toComic | 객체 변환만, SQL 0회 | 위 함수들 | DB 병목 대상 아님 |
| sidebar/getSidebarItems | publicCatalog 함수 re-export | Sidebar | 추가 구현/추가 SQL 없음 |

## 파일 제공·인증 경계

- Mono 소설 API: 경량 DB 공개/활성 확인 → 필요 시 독자 세션 확인 → R2 스트리밍. private/no-store는 자료 보호 의도가 있으므로 성능 이유로 제거하지 않습니다. 개발 로컬 Markdown 우선/원격 fallback 계약도 유지 대상입니다.
- Mono 만화 목록 API: DB 활성 확인 → R2 키 목록 → URL 배열. 목록은 no-store. 이미지마다 comic-file API가 DB+R2를 다시 거칩니다. 파일 크기·R2 응답시간·이미지 총량은 미측정입니다.
- Mono 레거시 앨범아트 API: ID/현재 albumArtKey 일치 확인 → R2. 응답은 immutable 캐시. 현재 공용 앨범아트 컴포넌트의 asset CDN 사용과 구분해야 하며, 이 경로가 일반 앨범아트 전체의 병목이라고 단정하지 않습니다.
- Mono Agent 인증과 독자 세션 확인은 코드상 비밀값/HMAC 처리이며 DB 사용자 테이블 조회가 아닙니다. 공개 두 앱에는 기존 관리자 쓰기 경로가 없습니다.
- Mono 태그 무효화는 기존 public-catalog 범위만 유지합니다. Loud에 새 요청 간 캐시·폴링을 추가하는 방안을 이번 점검 결론으로 삼지 않습니다.

## 권장 진행 순서

1. Loud의 목록과 선택곡 상세 분리: 전곡 JSON 읽기/계산/전달 제거. URL 이동·메타데이터·선택곡·재생기·언어 상태 보존을 함께 검증해야 합니다.
2. Mono 만화 파일 확인을 경량 조회로 분리: 즉시 개선 범위는 열/관계 축소입니다. 요청 횟수까지 줄이는 구조는 파일 접근 정책을 유지하며 설계해야 합니다.
3. Mono Agent 목록/단일/검색/전체 export의 가사 JSON·관계 중복 읽기 축소: 기존 API 응답 계약 유지.
4. Mono 구매 정보·사이드바 전달 필드 축소와 미호출 함수 정리: 기존 캐시 이점을 유지하고 실제 사용 경로부터 우선합니다.

이번 보고서는 코드상 조회 구조 점검입니다. 운영 지연·사용량·쿼리 실행 계획·브라우저 전송량을 측정한 성능 진단 결과는 아닙니다. 공개 앱 리팩토링/배포는 수행하지 않았습니다.
