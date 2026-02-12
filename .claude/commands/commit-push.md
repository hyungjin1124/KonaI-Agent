# /commit-push

모든 변경 사항을 분석하여 커밋 메시지를 자동 생성하고, commit & push를 수행한다.

## 워크플로우

1. Git 상태 확인 (status, diff, recent commits)
2. 변경 내용 분석 및 커밋 메시지 자동 생성
3. 사용자 확인 후 commit & push

## 실행 단계

### 1. 변경 사항 분석
- `git status`로 변경/추가/삭제 파일 확인
- `git diff --stat`으로 변경 규모 파악
- `git diff`로 실제 변경 내용 분석
- `git log --oneline -5`로 최근 커밋 스타일 참고

### 2. 커밋 메시지 생성
변경 내용을 분석하여 다음 형식으로 커밋 메시지를 작성한다:

```
<요약 제목 (한 줄, 영문)>

- 주요 변경 사항 1
- 주요 변경 사항 2
- ...

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**규칙:**
- 제목은 영문, 50자 이내, 동사 원형으로 시작 (Add, Fix, Refactor, Update 등)
- 본문은 변경의 "무엇"과 "왜"를 설명
- `.env`, credentials 등 민감 파일은 커밋하지 않음
- 변경 사항이 없으면 커밋하지 않음

### 3. 사용자 확인
커밋 전에 다음을 사용자에게 보여주고 확인받는다:
- 스테이징 대상 파일 목록
- 생성된 커밋 메시지

### 4. Commit & Push
```bash
git add <files>
git commit -m "<message>"
git push
```

### 5. 결과 보고
```
Commit & Push 완료

커밋: <hash> <제목>
파일: N개 변경 (+additions, -deletions)
브랜치: main -> origin/main
```

## 옵션
- `$ARGUMENTS`가 있으면 커밋 메시지에 참고하여 반영한다
- 예: `/commit-push 사이드바 기능 추가` → 해당 설명을 커밋 메시지에 반영

## 주의사항
- force push 하지 않음
- `--no-verify` 사용하지 않음
- amend 하지 않음 (항상 새 커밋 생성)
- 민감 파일 (.env, credentials 등) 커밋 방지
