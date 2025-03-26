/**
 * デフォルトのプロンプト
 */
const defaultPrompt = `次のウェブページの情報のみを元に、日本語で質問に答えてください。

以下の指示に厳密に従ってください：
1. 指定ドメインやURLからの情報がない場合は、「指定されたウェブページやドメインには該当する情報が見つかりませんでした。」と正直に最初に答えてください。
2. 指定されたウェブページにない情報を作り出したり、想像で補完したりしないでください。
3. 回答には、必ず参照した情報源（URL）を引用してください。
4. 回答の最後に、「参照元: [URLリスト]」の形式で使用した全ての情報源を明記してください。
5. 検索結果で指定されたドメインやURL以外からの情報が表示されても、それは無視してください。`;

/**
 * プロンプトを生成
 * @param prompt 質問
 * @param urls 参照元のURLリスト
 * @returns プロンプト
 */
export const getPrompt = (prompt: string, urls: string[]) => {
  // URLからドメイン名を抽出
  const domains = urls.map((url) => {
    try {
      return new URL(url).hostname;
    } catch (e) {
      console.error(`Invalid URL: ${url}`, e);
      return url; // 無効なURLの場合は元の値を返す
    }
  });

  // ドメイン限定の検索クエリ
  const siteRestrictions = domains
    .map((domain) => `site:${domain}`)
    .join(" OR ");
  const domainSpecificSearchQuery = `(${siteRestrictions}) ${prompt}`;

  // URLのテキスト表現
  const urlsText = urls.map((url) => `- ${url}`).join("\n");
  const domainsText = domains.map((domain) => `- ${domain}`).join("\n");

  return `
${defaultPrompt}

参照ウェブページ:
${urlsText}

検索対象ドメイン:
${domainsText}

検索クエリ: ${domainSpecificSearchQuery}

質問: ${prompt}

重要:
1. 上記で指定したドメインやURLからの情報のみを使用し、それ以外のドメインやURLからの情報は完全に無視してください。
2. 回答は要点を簡潔にまとめ、箇条書きを効果的に活用してください。
3. 専門用語がある場合は、簡単な説明を加えてください。
`;
};
