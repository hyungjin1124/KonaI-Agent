# Demos

이 디렉토리는 KonaI Agent 프로젝트의 데모 화면과 영상을 저장하는 공간입니다.

## 📸 용도

- UI/UX 스크린샷
- 기능 데모 영상
- 사용자 플로우 시연
- 프레젠테이션 자료

## 📂 파일 구조 권장사항

```
demos/
├── screenshots/        # 스크린샷 이미지
├── videos/            # 데모 영상
└── presentations/     # 발표 자료
```

## 🎯 파일 명명 규칙

- 날짜 포함: `YYYY-MM-DD-feature-name.png`
- 명확한 설명: `login-flow-step1.png`
- 버전 관리: `dashboard-v1.0.png`

## 🔧 스크린샷 캡처

Puppeteer를 사용한 자동 스크린샷 캡처 예제:

```javascript
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://example.com');
await page.screenshot({ path: 'demos/example.png' });
await browser.close();
```

## 📝 주의사항

- 민감한 정보(개인정보, API 키 등)가 포함되지 않도록 주의
- 고해상도 이미지 사용 권장
- 파일 크기가 큰 영상은 외부 링크 사용 고려
