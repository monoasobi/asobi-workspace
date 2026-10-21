# 마이그레이션 최종 인계

2026-10-21 기준입니다. 0~8단계의 코드 이관·공용화·로컬 검증, 사용자 최초 Vercel 배포와 운영 캐시 문제 해결을 확인했습니다. 9단계의 옛 관리자 종료 코드는 로컬 완료했고 운영 반영 확인이 남습니다. 수동 QA를 모두 완료했다는 뜻은 아닙니다.

## 확인된 상태

| 항목 | 근거 | 상태 |
| --- | --- | --- |
| 세 앱 최초 배포 | 사용자 완료 확인 | 완료 |
| 관리자 소설 저장 | 사용자 제공 소설 38 수정 응답의 ok=true | 완료 확인 |
| 운영 캐시 문제 | 사용자 해결 확인 | 해결 확인 |
| Mono 캐시 API 설정 누락 | 무인증 POST가 기존 503에서 401로 변경 | 해소 확인; 인증된 초기화는 사용자 확인 기준 |
| 옛 관리자/쓰기 API | 로컬 제거 및 종료 경계·HTTP 검사 통과 | 로컬 완료 |
| 운영 옛 관리자 종료 | Mono 곡 API POST 401, Loud 405, /admin 이전 안내 미확인 | 운영 반영 확인 필요 |
| 새 관리자 접근 | https://minasobi.vercel.app/login HTTP 200 | 로그인 화면 접근 확인; 실제 로그인 재검증 아님 |
| 관리자 전용 의존성 | Loud 전용 사본의 소비 제거 및 MINASOBI 소비 보존 | 정리 완료 |
| 소설 스타일 | 기존 소설 보존 검사 통과 | 보존; 실제 기기별 QA는 아래 범위 |

## 사용자의 다음 배포

1. 기존 관리자 종료 커밋 `35b2cea`와 이후 후속 정리를 포함한 브랜치를 사용자가 푸시·배포합니다. 공개 두 앱이 해당 코드로 배포됐는지 확인합니다. MINASOBI Root Directory는 `apps/minasobi`이고 workspace 이름 `@asobi/adminasobi`는 유지합니다.
2. Mono/Loud에서 `/admin`과 옛 편집기 하위 주소가 MINASOBI 이전 안내를 표시하고 `/api/admin/*`가 404인지 확인합니다. 401/405는 종료 완료를 뜻하지 않습니다.
3. 종료 배포 후 공개 두 앱의 `ADMIN_PASSWORD`, `ADMIN_VIEWER_PASSWORDS`, `ADMIN_SESSION_SECRET`을 제거합니다. Loud의 미사용 캐시 secret과 MINASOBI의 `LOUDASOBI_REVALIDATION_SECRET`/운영 `LOUDASOBI_URL`도 남아 있다면 정리합니다. 로컬에서는 이미 불필요한 비밀값을 제거했으며 `LOUDASOBI_URL`만 로컬 검사 도구 때문에 유지합니다.
4. MINASOBI의 `ADMIN_*`, Mono의 `REVALIDATION_SECRET`, MINASOBI의 `MONOASOBI_REVALIDATION_SECRET` 및 운영 Mono origin은 유지합니다. 독자/Agent/R2 키도 유지합니다. 상세 목록은 [운영 환경변수](production-environment.md)를 따릅니다.

운영 환경변수 삭제 여부나 실제 Vercel 배포 커밋은 에이전트가 직접 조회하지 않았습니다. 이번 후속 정리에서 빌드·푸시·배포·운영 데이터 쓰기를 실행하지 않았습니다.

## 남은 사용자 기능 QA

기존에 사용자가 확인한 항목을 반복할 필요는 없습니다. 아직 결과가 기록되지 않은 범위만 남깁니다.

| 범위 | 확인할 핵심 동작 | 상세 계약 |
| --- | --- | --- |
| 두 편집기 | 실제 재생·스냅·선택/분할·undo/redo·영어 필드·SRT | [편집기 이관](editor-migration.md) |
| 이동·충돌 | 미저장 이동 취소, 뒤로/앞으로, 저장 중 이동 차단, 두 창 저장 충돌 시 초안 보존 | [편집기 이관](editor-migration.md) |
| 콘텐츠 관리 | 소설/만화/서적 연결·추천 정렬·viewer 쓰기 거부 | [콘텐츠 이관](content-migration.md) |
| 실제 파일 처리 | 새 이미지 업로드/교체/삭제 후 공개 반영, 실패 시 기존 데이터/파일 보존 | [이미지 전환](album-art-delivery.md) |
| 공개 읽기·재생 | 소설/만화 위치 복원·폰트/테마·모바일 전체화면·ko/ja/en 전환 중 플레이어 유지 | [UI 이관](ui-migration.md) |

계획에 없던 테스트 프레임워크·브라우저 자동화·DB/R2 환경 분리는 추가하지 않습니다. 원본 저장소·이전 배포·기존 R2 파일은 보존합니다. 파일 보존 기한이 확정되지 않았으므로 자동 삭제하지 않습니다. 소설 읽기 색상과 기본값을 보존하는 Radix Theme/CSS도 현재 예외로 유지합니다.
