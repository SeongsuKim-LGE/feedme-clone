# 02 — 내보내기 (복사 · 다운로드 · ChatGPT/Claude로 열기)

## Outcome

결과 화면에서 프리셋 또는 직접 입력 프롬프트를 선택할 수 있고, 복사하기·.md
다운로드·ChatGPT로 열기·Claude로 열기로 변환된 Markdown을 내보낼 수 있다.

## Blockers

01 — 내보낼 실제 변환 결과(제목·저자·Markdown)가 있어야 내보내기 동작을 검증할
수 있다.

## Acceptance criteria

- [ ] "복사하기"로 클립보드에 담기는 내용에는 프롬프트가 섞이지 않는다.
- [ ] ".md 다운로드"로 받은 파일 내용에는 프롬프트가 섞이지 않는다.
- [ ] 프롬프트를 선택한 상태에서 "ChatGPT로 열기"/"Claude로 열기"를 누르면
      프롬프트와 Markdown 본문이 함께 클립보드에 복사되고, 각 서비스의 새 대화
      페이지가 새 탭으로 열린다.
- [ ] 프롬프트를 선택하지 않은 상태에서 같은 버튼을 누르면 Markdown 본문만
      복사되고 새 탭이 열린다.
- [ ] "직접 입력" 프롬프트는 새로고침 후 남아있지 않다.

## Constraints

- LLM 핸드오프는 클립보드 복사 + 새 탭 열기로 통일한다(자동 프리필 금지). 근거는
  spec의 "결정된 제약과 근거"와 [llm-handoff-export](../../../decisions/llm-handoff-export.md)
  결정 참고.

## Verification

- 프롬프트를 선택하지 않은 상태에서 복사/다운로드/열기 각각 본문만 포함하는지
  확인.
- 프리셋 선택 후 "~로 열기" 클릭 시 클립보드에 프롬프트+본문이 함께 담기고
  올바른 서비스의 새 탭이 열리는지 확인.
- 직접 입력 프롬프트를 넣은 뒤 새로고침하면 입력값이 남아있지 않은지 확인.

## Review checkpoint

None.

## Status

pending

## Execution

- Verification: —
- Blocker: —
- Revision: —
