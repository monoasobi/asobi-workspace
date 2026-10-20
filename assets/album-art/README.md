# 고해상도 앨범아트 수집본

2026-10-20 공개 MONOASOBI 목록(https://monoasobi.vercel.app)에서 확인한 **36곡(ID 0–35)**입니다. 소스 seed의 35곡에 최근 추가된 `咲き誇れ`도 포함했습니다. 운영 DB나 기존 정적 파일은 수정하지 않았습니다.

- `originals/<id>.jpg`: Apple Music 일본 카탈로그가 제공한 **3000×3000 JPEG 그대로** 보존. 총 약 80MiB입니다. 아티스트 제작용 마스터라는 뜻은 아니며, 다운로드 후 확대하지 않았습니다.
- `prepared/albumart/<id>/<sha256 앞 32자리>.webp`: 동일 해상도의 업로드 준비본. 총 약 51.3MiB, 각 파일 3MiB 이하입니다. 기존 앱의 public에 복사하지 않았고 R2 업로드도 하지 않았습니다.
- `manifest.json`: 곡 ID·제목·싱글명·Apple 출처 페이지/이미지 URL·해상도·바이트·SHA-256·준비본 키. `observedKeyAtCollection`은 공개 목록의 수집 시점 키이며, 운영 변경 시 반드시 최신 DB와 다시 비교해야 합니다.
- `comparison.jpg`: 각 쌍의 왼쪽은 기존 정적 파일, 오른쪽은 수집본입니다. ID 35는 기존 파일이 없어 왼쪽이 비어 있습니다. 작은 비교판이므로 실제 품질 확인은 원본 파일로 합니다.

일본어 원곡의 싱글을 선택했습니다. 영어판·리믹스·앨범 커버로 임의 대체하지 않았습니다. **ID 34 Orion만 사용자 지정에 따라 THE BOOK for, 커버**를 사용합니다. 앙코르와 만약 생명을 그릴 수 있다면도 개별 싱글 커버입니다. 출처는 [YOASOBI Apple Music](https://music.apple.com/jp/artist/yoasobi/1490256993), 각 곡의 정확한 페이지는 manifest에 있습니다. 제안받은 나무위키는 이번 조회에서 접근되지 않아 공식 배급 카탈로그로 대체했습니다.

```sh
# 네트워크/DB/R2 없이 원본·준비본의 해시/해상도/키/제한 확인
node scripts/album-art-assets.mjs

# 누락된 원본 다운로드 및 준비본 생성. manifest에 지정된 주소만 사용
node scripts/album-art-assets.mjs --download
```

기존 `packages/storage`의 Sharp 0.34.5를 재사용합니다. Node/Sharp 버전을 바꾸면 WebP 인코딩이 달라질 수 있으므로 기존 해시를 기준으로 비교하고, 기존 파일을 같은 공개 키에 덮어쓰지 않습니다. 새 파일이면 새 키를 사용합니다. 전체 앱 빌드에서 이 보관 폴더를 import하지 않습니다.

수집용 원본의 최대 다운로드 크기는 10MiB/40MP이며, **관리자 업로드의 기존 3MiB/40MP/정지 JPG·PNG·WebP 제한은 유지**됩니다. 일부 원본 JPEG는 3MiB보다 커서 관리 화면에는 `prepared` WebP를 선택해야 합니다. 변환은 품질 90부터 필요할 때 80/70/60/50 순으로 낮추며 픽셀 크기는 유지합니다. 3MiB 안에 들어오지 않으면 실패합니다. 수집본 JPEG는 어떤 경우에도 덮어쓰지 않습니다.

공개 도메인 전환과 운영 앨범아트 교체는 [4단계 연결·검증 절차](../../docs/album-art-delivery.md)를 따릅니다. 이 폴더가 존재한다는 사실은 실제 서비스가 고해상도 파일로 전환됐다는 뜻이 아닙니다.
