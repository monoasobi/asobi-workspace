# 운영 배포 환경변수·인계

2026-10-20 기준 실제 코드에서 사용하는 이름입니다. 배포·GitHub 연결·푸시는 사용자가 진행합니다. 에이전트는 로컬 커밋까지만 수행했으며 production build와 Vercel 설정/배포는 실행하지 않았습니다. QA는 사용자 진행 중입니다.

## 기존 운영에서 달라지는 핵심

- 세 앱은 기존 **같은 운영 Turso URL/토큰**을 사용합니다. 새 DB·스키마 적용·seed는 필요 없습니다.
- 세 앱에 `NEXT_PUBLIC_ASSET_BASE_URL=https://assets.envifloor.uk`, `NEXT_PUBLIC_ASSET_TRANSFORMS=true`를 설정합니다. `NEXT_PUBLIC_*`는 빌드 전에 설정해야 합니다.
- Mono와 Admin에는 기존 R2 인증과 `R2_ALBUM_ART_BUCKET_NAME=asobi-album-art`가 필요합니다. `R2_BUCKET_NAME=monoasobi-contents`는 소설·만화용 비공개 버킷으로 유지합니다. Loud에는 R2 인증이 필요 없습니다. 기존 키가 두 버킷 모두 접근 가능한지는 실제 읽기로 확인했습니다.
- Admin의 `MONOASOBI_URL`은 **실제 운영 Mono 주소**입니다. `MONOASOBI_REVALIDATION_SECRET`은 Mono의 `REVALIDATION_SECRET`과 같은 새 비밀값을 설정합니다. 공개 환경변수가 아닙니다.
- Loud 무효화 API는 제거됐으므로 `LOUDASOBI_REVALIDATION_SECRET`은 필요 없습니다. `LOUDASOBI_URL`은 로컬 검사 도구용이며 운영 앱에서 필요 없습니다.
- `ADMIN_SESSION_SECRET`은 앱별 세션 서명용이며 캐시 알림 secret과 다릅니다. `ADMIN_VIEWER_PASSWORDS`는 쉼표로 구분한 선택적 읽기 전용 비밀번호입니다.

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
# 기존 관리자 종료 커밋 배포 전까지만 유지
ADMIN_PASSWORD=<기존 Mono 관리자 비밀번호>
ADMIN_VIEWER_PASSWORDS=<선택적 viewer 비밀번호>
ADMIN_SESSION_SECRET=<기존 Mono 관리자 세션 비밀값>
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
# 기존 관리자 종료 커밋 배포 전까지만 유지
ADMIN_PASSWORD=<기존 Loud 관리자 비밀번호>
ADMIN_VIEWER_PASSWORDS=<선택적 viewer 비밀번호>
ADMIN_SESSION_SECRET=<기존 Loud 관리자 세션 비밀값>
```

`NEXT_PUBLIC_SITE_URL`은 Loud의 canonical/공유 메타데이터 주소입니다. `NEXT_PUBLIC_MONOASOBI_URL`은 기존 이미지 경로의 fallback이며 CDN 주소가 우선합니다. R2 인증이나 캐시 알림 secret은 추가하지 않습니다. Loud는 기존처럼 요청마다 DB를 읽습니다.

## Admin — Root Directory `apps/adminasobi`

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

## 배포·종료 순서

1. 같은 Git 저장소에서 Vercel 프로젝트 세 개를 준비하고 위 Root Directory를 지정합니다. 기존 `next.config.ts`의 workspace root·transpilePackages·파일 추적 설정과 루트 lockfile을 보존합니다. 앱 밖 공통 소스 포함 설정을 확인하고 앱별 별도 lockfile을 만들지 않습니다. 실제 빌드는 사용자 배포에서 검증합니다.
2. 위 운영 환경값을 앱별로 설정합니다. Mono와 Admin의 캐시 secret 쌍과 실제 Mono origin을 먼저 맞춥니다. 새 Mono가 배포되기 전 기존 Mono에는 새 무효화 API가 없으므로 새 Admin의 저장 알림을 검증 완료로 처리하지 않습니다.
3. 새 Mono/Loud를 기존 공개 주소에 배포한 뒤 Admin을 연결합니다. 배포 간 전환 중에는 앨범아트 추가 교체를 잠시 피합니다. 현재 36곡은 구버전용 200px 호환본까지 준비됐지만 향후 업로드를 기존 버킷에 자동 복제하는 기능은 없습니다. 기존 Mono 관리자에서 추가 교체하면 전용 CDN 대상과 어긋날 수 있으므로 전환 완료 전에는 사용하지 않습니다.
4. 사용자가 정상 배포·공개 기능·새 관리자 저장 및 Mono 캐시 알림을 확인해 알려주면 **지체 없이 기존 두 관리자와 쓰기 API 제거 작업**을 진행합니다. 현재는 기능 복구를 위해 유지합니다. 공개 콘텐츠/독자 인증/Agent API·원본 저장소·기존 파일은 종료 대상이 아닙니다.
5. 종료 커밋을 사용자가 배포한 뒤 공개 앱에서 불필요해진 `ADMIN_*`를 제거합니다. Mono의 독자 인증·Agent 토큰·R2·캐시 secret은 유지합니다. Radix 잔여 정리는 소설의 색상·스타일 보존 계약을 확인하며 진행합니다.

새 배포 실패 시 이전 배포와 현재 호환 이미지를 유지할 수 있습니다. DB 키를 이전으로 되돌려야 한다면 [앨범아트 전환 기록](album-art-delivery.md)의 조건부 복구 절차를 따르며 이전 파일을 먼저 삭제하지 않습니다. Vercel 배포 완료와 사용자 QA를 에이전트가 대신 완료로 기록하지 않습니다.
