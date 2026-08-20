# LLM 핸드오프 내보내기 방식

## Decisions

- "ChatGPT로 열기"와 "Claude로 열기"는 두 서비스 모두 동일하게 **클립보드 복사 + 새 대화 페이지 새 탭 열기** 방식으로 구현한다. 프롬프트를 URL 파라미터나 딥링크로 자동 채우지 않는다.

## Boundaries

- 이 결정은 "URL→Markdown 변환 서비스"의 LLM 핸드오프 내보내기 기능에 적용된다.
- ChatGPT/Claude 외 다른 LLM 서비스를 내보내기 대상으로 추가할 때도 동일한 접근(자동 프리필 대신 복사+새 탭)을 기본값으로 재사용한다.

## Why

- ChatGPT는 `https://chatgpt.com/?q=텍스트`로 웹에서 프롬프트 자동 채우기가 되지만 비공식 동작이며 URL 길이 제한으로 긴 본문은 잘릴 수 있다.
- Claude는 웹(claude.ai)에 프롬프트 자동 채우기 공식 방법이 없다. `claude://claude.ai/new?q=...` 딥링크가 있지만 Claude 데스크톱 앱 설치가 전제조건이라, 앱이 없는 대다수 웹 사용자에게는 동작하지 않는다 (참고: https://support.claude.com/en/articles/14729294-open-claude-desktop-with-a-link).
- 두 서비스를 자동 채우기로 구현하면 앱 설치 여부·글자 수에 따라 동작이 갈리는 신뢰할 수 없는 기능이 된다. 복사+새 탭은 앱 설치 여부나 본문 길이와 무관하게 항상 동작하고, 두 서비스의 UX를 대칭적으로 유지한다.

## Reconsider when

- ChatGPT 또는 Claude가 웹 브라우저에서 공식적으로 새 대화 프리필 URL 파라미터를 지원하기 시작하면.

## Still-rejected alternatives

- ChatGPT `?q=` + Claude `claude://` 딥링크 자동 채우기 — Claude 쪽이 데스크톱 앱 미설치 사용자에게 실패하고, 긴 본문은 양쪽 다 URL 길이 문제로 잘릴 위험; 웹 표준 프리필 파라미터가 생기면 재검토.
- ChatGPT만 자동 채우기, Claude만 복사+새 탭 — 서비스 간 UX가 비대칭적이라 기각.

## Evidence worth preserving

- Anthropic 공식 지원 문서 확인: `claude://` 스킴은 Claude Desktop(macOS/Windows/Linux) 전용이며 `q` 파라미터는 약 14,000자에서 잘린다.
