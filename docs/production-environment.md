# 운영 배포 환경변수·인계

2026-10-21 기준: 사용자가 세 앱 Vercel 배포를 완료했습니다. 기존 Mono/Loud 관리자 제거와 로컬 관리자 키 삭제를 승인했습니다. 아래는 종료 변경을 배포한 이후의 설정입니다. 이번 코드 변경의 빌드·푸시·재배포와 운영 환경변수 삭제는 사용자가 진행합니다. 공개 운영 Mono 캐시 API의 503 / Unavailable을 확인했으며 Mono REVALIDATION_SECRET 설정/재배포가 필요합니다. 인증 성공과 실제 캐시 무효화는 미검증입니다. 통합 관리자 폴더는 `apps/minasobi`, workspace 이름은 `@asobi/adminasobi`입니다.

## 기존 운영에서 달라지는 핵심

- 세 앱은 기존 **같은 운영 Turso URL/토큰**을 사용합니다. 새 DB·스키마 적용·seed는 필요 없습니다.
- 세 앱에 `NEXT_PUBLIC_ASSET_BASE_URL=https://assets.envifloor.uk`, `NEXT_PUBLIC_ASSET_TRANSFORMS=true`를 설정합니다. `NEXT_PUBLIC_*`는 빌드 전에 설정해야 합니다.
- Mono와 Admin에는 기존 R2 인증과 `R2_ALBUM_ART_BUCKET_NAME=asobi-album-art`가 필요합니다. `R2_BUCKET_NAME=monoasobi-contents`는 소설·만화용 비공개 버킷으로 유지합니다. Loud에는 R2 인증이 필요 없습니다. 기존 키가 두 버킷 모두 접근 가능한지는 실제 읽기로 확인했습니다.
- Admin의 `MONOASOBI_URL`은 **실제 운영 Mono 주소**입니다. `MONOASOBI_REVALIDATION_SECRET`은 Mono의 `REVALIDATION_SECRET`과 같은 새 비밀값을 설정합니다. 공개 환경변수가 아닙니다.
- Loud 무효화 API는 제거됐으므로 `LOUDASOBI_REVALIDATION_SECRET`은 필요 없습니다. `LOUDASOBI_URL`은 로컬 검사 도구용이며 운영 앱에서 필요 없습니다.
- `ADMIN_SESSION_SECRET`은 MINASOBI 관리자 세션 서명용이며 캐시 알림 secret과 다릅니다. 공개 두 앱에는 관리자 인증이 없습니다. `ADMIN_VIEWER_PASSWORDS`는 쉼표로 구분한 선택적 읽기 전용 비밀번호입니다.

실제 비밀값은 원본 운영 설정/무시된 `.env.local`에서 Vercel 설정으로 직접 옮기세요. 아래 `<...>`는 실제 값으로 교체할 표시이며 그대로 등록하지 않습니다. 저장소에는 넣지 않습니다.

## Mono — Root Directory `apps/monoasobi`

```dotenv
TURSO_DATABASE_URL=<기존 운영 Turso URL>
TURSO_AUTH_TOKEN=<기존 운영 Turso 토큰>
NEXT_PUBLIC_ASSET_BASE_URL=https://assets.envifloor.uk
NEXT_PUBLIC_ASSET_TRANSFORMS=true
R2_ACCOUNT_ID=<기존 계정 ID>
R2_ACCESS_KEY_ID=<기존 R2 키 ID>
R2_SECRET_ACCESS_KEY=<기존 R2 비밀키>
R2_BUCKET_NAME=monoasobi-contents
R2_ENDPOINT=<기존 R2 S3 endpoint>
R2_ALBUM_ART_BUCKET_NAME=asobi-album-art
REVALIDATION_SECRET=<Admin과 짝을 맞춘 캐시 알림 비밀값>
PRIVATE_READER_PASSWORD=<기존 독자 비밀번호>
PRIVATE_READER_SESSION_SECRET=<기존 독자 세션 비밀값>
AGENT_API_TOKEN=<기존 Agent 읽기 토큰>
```

`R2_ENDPOINT`가 정식 이름이며 기존 `R2_END_POINT`도 호환됩니다. 둘 다 넣을 필요는 없습니다. endpoint 생략 시 계정 ID로 기본 S3 주소를 구성합니다. 독자 비밀번호의 기존 별칭 `PRIVATE_READER_TOKEN`도 읽지만 신규 설정은 `PRIVATE_READER_PASSWORD`를 사용합니다. 독자 세션 비밀값 생략 시 비밀번호 fallback이 있으므로 기존 명시값이 있으면 보존합니다. 이 인증은 관리자 종료 후에도 유지합니다.

Mono 메타데이터의 사이트 주소는 현재 코드에서 `https://monoasobi.vercel.app`로 고정되어 있습니다. `NEXT_PUBLIC_SITE_URL`을 추가해도 Mono에는 적용되지 않습니다. 기존 도메인을 유지하는 전제이며 주소를 바꾼다면 코드 변경을 별도로 합니다.

소설 개발 모드는 `/novel/{id}.md` 로컬 편집 경로를 우선 사용하고, 파일 누락/HTML 응답이면 기존 R2 API로 전환합니다. 사용자 요청으로 로컬 원고는 모두 비웠으며 필요할 때만 추가합니다. 운영 Next 실행에서는 기존 `/api/content/novels/{id}`로 R2를 읽습니다. `NODE_ENV`를 수동으로 development로 지정하거나 로컬 원고를 Git에 추가하지 마세요.

## Loud — Root Directory `apps/loudasobi`

```dotenv
TURSO_DATABASE_URL=<Mono와 같은 운영 URL>
TURSO_AUTH_TOKEN=<Mono와 같은 운영 토큰>
NEXT_PUBLIC_ASSET_BASE_URL=https://assets.envifloor.uk
NEXT_PUBLIC_ASSET_TRANSFORMS=true
NEXT_PUBLIC_MONOASOBI_URL=https://monoasobi.vercel.app
NEXT_PUBLIC_SITE_URL=<기존 Loud 운영 origin>
```

`NEXT_PUBLIC_SITE_URL`은 Loud의 canonical/공유 메타데이터 주소입니다. `NEXT_PUBLIC_MONOASOBI_URL`은 기존 이미지 경로의 fallback이며 CDN 주소가 우선합니다. R2 인증이나 캐시 알림 secret은 추가하지 않습니다. Loud는 기존처럼 요청마다 DB를 읽습니다.

## Admin — Root Directory `apps/minasobi`

```dotenv
TURSO_DATABASE_URL=<Mono와 같은 운영 URL>
TURSO_AUTH_TOKEN=<Mono와 같은 운영 토큰>
ADMIN_PASSWORD=<새 관리자 운영 비밀번호>
ADMIN_VIEWER_PASSWORDS=<선택적 viewer 비밀번호>
ADMIN_SESSION_SECRET=<새 관리자 세션 비밀값>
NEXT_PUBLIC_ASSET_BASE_URL=https://assets.envifloor.uk
NEXT_PUBLIC_ASSET_TRANSFORMS=true
NEXT_PUBLIC_MONOASOBI_URL=https://monoasobi.vercel.app
R2_ACCOUNT_ID=<기존 계정 ID>
R2_ACCESS_KEY_ID=<기존 R2 키 ID>
R2_SECRET_ACCESS_KEY=<기존 R2 비밀키>
R2_BUCKET_NAME=monoasobi-contents
R2_ENDPOINT=<기존 R2 S3 endpoint>
R2_ALBUM_ART_BUCKET_NAME=asobi-album-art
MONOASOBI_URL=https://monoasobi.vercel.app
MONOASOBI_REVALIDATION_SECRET=<Mono REVALIDATION_SECRET과 같은 값>
```

운영에서 loopback/localhost를 지정하지 않습니다. 세션 쿠키는 새 관리자 전용이며 기존 사이트 로그인과 공유하지 않습니다. 관리자 도메인은 공개 이미지 URL에 들어가지 않습니다. 도메인이 결정됐다고 별도의 `NEXT_PUBLIC_ADMIN_URL`이 필요하지는 않습니다.

## 종료 변경 적용 순서와 제거할 키

1. 기존 관리자/쓰기 API 제거 커밋과 캐시 실패 상세 표시 커밋을 사용자가 세 앱에 배포합니다. `/admin` 및 기존 하위 화면은 이전 안내를 표시하고 `/api/admin/*`는 공개 두 앱에서 404가 됩니다. 콘텐츠 쓰기는 MINASOBI만 제공합니다.
2. **Mono/Loud에서만** `ADMIN_PASSWORD`, `ADMIN_VIEWER_PASSWORDS`, `ADMIN_SESSION_SECRET`을 삭제합니다. 로컬 `.env.local`/예시는 이미 정리했습니다. MINASOBI의 같은 세 키는 유지합니다.
3. Loud에 남아 있다면 `REVALIDATION_SECRET`, `LOUDASOBI_REVALIDATION_SECRET`을 삭제합니다. MINASOBI에서도 `LOUDASOBI_REVALIDATION_SECRET`은 삭제합니다. `LOUDASOBI_URL`은 앱 런타임에는 미사용이지만 로컬 회귀 검사 도구가 읽으므로 로컬 예시/설정에는 유지합니다. 운영에는 불필요합니다.
4. Mono의 `REVALIDATION_SECRET`과 MINASOBI의 `MONOASOBI_REVALIDATION_SECRET`은 동일한 값으로 유지합니다. MINASOBI의 `MONOASOBI_URL`은 리다이렉트 없는 실제 운영 Mono origin이어야 합니다. 설정 변경 후 해당 앱을 재배포합니다.
5. 캐시 초기화만 재요청해 새 응답의 `refresh[].error`와 `status`를 확인합니다. 401/403이면 비밀값/접근 보호, 404이면 주소/배포 버전, 3xx이면 최종 origin, 503이면 Mono 비밀값 설정, 시간 초과이면 서버 응답 상태를 확인합니다. HTTP 200과 `{ok:true}`를 함께 확인해야 성공입니다. 콘텐츠를 다시 저장할 필요는 없습니다.

공개 콘텐츠 API·독자 인증·Agent API·R2 읽기·Mono 캐시 알림 비밀값은 유지합니다. Radix Theme/CSS는 소설 읽기 색상·기본값 보존을 위해 유지하며 이번 관리자 종료에서 제거하지 않습니다. 환경별 DB/R2 분리는 요구하지 않습니다.

이전 배포와 기존 R2 파일은 보존합니다. DB 키 복구가 필요하면 [앨범아트 전환 기록](album-art-delivery.md)의 조건부 절차를 따릅니다. 새 업로드 파일을 구버전 버킷에 자동 복제하는 기능은 없으므로 옛 배포로 돌아가기 전에 이미지 호환성을 확인합니다. 이번 작업은 운영 DB/R2/DNS 변경을 포함하지 않습니다.
