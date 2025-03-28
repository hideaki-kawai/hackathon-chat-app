---
marp: true
theme: default
paginate: true
style: |
  :root {
    --primary: #074877;
    --secondary: #FF630B;
    --background: #fff
  }
  section {
    background: var(--background);
    font-family: 'Helvetica Neue', Arial, sans-serif;
    color: #333;
  }
  h1 {
    color: var(--primary);
    font-size: 2.5em;
    border-bottom: 4px solid var(--secondary);
    padding-bottom: 12px;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.1);
  }
  h2 {
    color: var(--primary);
    font-size: 1.8em;
    margin-top: 0.8em;
  }
  strong {
    color: var(--secondary);
  }
  ul, ol {
    margin-left: 1em;
  }
  li {
    margin-bottom: 0.5em;
    line-height: 1.5;
  }
  section.title {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }
  section.title h1 {
    border: none;
    font-size: 3em;
    margin-bottom: 0.5em;
  }
  section.title h2 {
    font-size: 1.5em;
    color: var(--secondary);
    margin-top: 0;
  }
  .tech-stack {
    display: inline-block;
    background-color: var(--primary);
    color: white;
    padding: 5px 12px;
    border-radius: 4px;
    margin: 5px;
    font-weight: bold;
  }
  .highlight {
    background: rgba(255, 99, 11, 0.2);
    padding: 2px 5px;
    border-radius: 3px;
  }
---

<!-- _class: title -->

# ハッカソン共有会 2025.03.28

## Hideaki Kawai

---

## テーマ

LLMを使って各々持ち寄った課題を解決する

- 論文解析
- データ解析
- etc...

---

## 課題

**正しい情報のみを提供できるチャットボットがほしい**

---

## アプローチ

特定のサイトのみから情報を収集するLLMの回答を特定のサイトからのみ取得したい

- RAG作る？→<span class="highlight">更新が大変、応用が効かない</span>
- OpenAIの<strong>ResponseAPI</strong>（2025/03/11リリース）が使えそう
- アプリ作っちゃおう〜

---

## 技術

<div style="display: flex; justify-content: center; gap: 20px; margin-top: 40px;">
  <div class="tech-stack">OpenAI ResponseAPI</div>
  <div class="tech-stack">React Router v7</div>
</div>

### 技術採用理由

せっかくの機会だしRRv7もがっつり触りたくなった（笑）

---

## 成果物・達成できたこと

- OpenAI ResponseAPIを使用して、Web検索も実装できた
- URLを先に与えることで特定URLとそのドメインから情報を取得できるようになった
- React Router（WAF）を習得できた

---

## 今後の課題

- コードが激しく汚いからリファクタリング。。デザイン (UIUX)改修
- プロンプト調整。どこまで指定したドメイン中から情報を取得してくれるかテスト
- ChatGPTようにチャンク単位で画面出力
- ChatGPTように会話履歴管理
- 実用化するならデータベースで永続化
- デプロイするなら認証機能実装
- OpenAI APIキー自前ため、リミットも必要かも
  - search_context_size high: $50.00 / 1,000回の呼び出し
- etc...