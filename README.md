# DAMAH AI STUDIO v0.5

DAMAH FRAME과 완전히 별개인 사진 배경 합성 웹앱. 사진은 브라우저 안에서 편집하고, AI 배경 생성 시에는 **배경 설명 텍스트만** Cloudflare Worker로 전송합니다.

## 현재 되는 것
- 원본 사진/배경 사진 업로드, 단색 빠른 분리, 외부 모델을 이용한 자동 인물 분리(베타)
- 배경 확대·이동·흐림, 마스크 수정, 조명 프리셋, 그림자, PNG/JPG 저장
- AI 서버 연결용 입력·세로/가로/정사각 배경 생성·응답 사진 자동 합성
- 얼굴 AI 재생성 없음. **조명 효과를 인물에 적용하면 색/밝기 픽셀은 달라짐**

## AI 배경 생성 연결 방법 (계정 및 과금 필요)
1. Cloudflare 계정과 OpenAI API 계정 및 결제 설정을 준비합니다. ChatGPT 구독과 API 이용요금은 별개입니다.
2. `worker/` 폴더의 `index.js`와 `wrangler.toml`을 사용해 Cloudflare Worker를 배포합니다. PC 개발 환경에서 Node.js 설치 후 `cd worker`, `npx wrangler login`, `npx wrangler deploy`를 실행할 수 있습니다.
3. `wrangler.toml`의 `ALLOWED_ORIGIN`을 실제 웹앱의 출처(예: `https://damahphoto.github.io`)로 설정합니다. 파일을 `file://`로 열면 AI 서버의 출처 제한에 걸릴 수 있으므로 GitHub Pages 같은 HTTPS 호스팅에서 여세요.
4. Worker 비밀 설정에서 `OPENAI_API_KEY`와 별도 **긴 랜덤 문자열**인 `STUDIO_ACCESS_TOKEN`을 등록합니다. CLI 예: `npx wrangler secret put OPENAI_API_KEY` / `npx wrangler secret put STUDIO_ACCESS_TOKEN`. 비밀 값을 GitHub, HTML, JavaScript, wrangler.toml에 넣지 마세요.
5. 프론트 앱은 정적 호스팅에 게시합니다. `index.html`, `style.css`, `app.js` 3개를 동일 폴더에 업로드하고 Worker 소스는 공개 앱에 포함하지 않습니다.
6. 웹앱의 'AI 생성 서버 주소'에 Worker 배포 URL(끝에 `/generate`를 붙이지 않음)을 입력하고, '스튜디오 접근 암호'에는 `STUDIO_ACCESS_TOKEN` 값을 입력해 배경을 생성하세요. **OpenAI API 키를 브라우저에 입력하면 안 됩니다.**
7. 생성 전에 인물을 분리하면 결과가 화면에 합성됩니다. 생성 이미지는 원본 사진과 동일한 해상도가 아닐 수 있으며, 내보내기 시 원본 캔버스에 확대되어 적용됩니다.

## 보안 및 비용 주의
- Worker는 출처 검사, 접근 토큰 검사, 프롬프트 길이 제한을 수행하지만 **요금 폭주를 막는 완전한 인증·속도 제한 체계는 아닙니다.** 외부 공개 전 Cloudflare WAF/Rate Limiting, 인증 및 월별 API 사용 한도를 설정하세요.
- 접속 암호는 서버 API 키와 다른 별도 문자열입니다. 공유 PC에서는 입력 후 브라우저를 닫으세요.
- OpenAI API 모델 접근 권한과 정책, 생성 단가는 계정 설정과 API 문서를 확인하세요.
- 브라우저에서 외부 자동 인물 분리 모델을 다운로드할 때 네트워크 연결이 필요합니다.
- 미리보기 화면 및 단색 분리의 품질은 실제 사진으로 검증해야 합니다. 브라우저 메모리에 따라 대용량 출력에 제한이 있습니다.

## 검사
- JS 정적 문법 확인, ID 교차 검사 및 Worker 모의 요청 검사를 수행했습니다. 실제 API 키/Cloudflare 계정이 없으므로 실시간 AI 이미지 생성과 모바일 기기에서의 엔드투엔드 검증은 하지 않았습니다.
