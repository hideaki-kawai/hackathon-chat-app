/**
 * JSONレスポンスを作成する関数
 *
 * @param data レスポンスデータ
 * @param status HTTPステータスコード
 * @returns Response オブジェクト
 */
export const createResponse = (data: any, status: number = 200): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * エラーレスポンスを作成する関数
 *
 * @param message エラーメッセージ
 * @param status HTTPステータスコード
 * @returns Response オブジェクト
 */
export const createErrorResponse = (
  message: string,
  status: number = 500
): Response => {
  return createResponse({ error: message }, status);
};
