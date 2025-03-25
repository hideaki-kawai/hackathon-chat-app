import { z } from "zod";

export const parseFormWithZod = <T>(
  formData: FormData,
  schema: z.ZodSchema<T>
): T => {
  const formObject: Record<string, unknown> = {};
  const arrayParams: Record<string, string[]> = {};

  for (const [key, value] of formData.entries()) {
    // 配列パラメータの処理（urls[]など）
    if (key.endsWith("[]")) {
      const arrayKey = key.slice(0, -2);
      if (!arrayParams[arrayKey]) {
        arrayParams[arrayKey] = [];
      }
      arrayParams[arrayKey].push(value.toString());
    } else {
      formObject[key] = value;
    }
  }

  // 配列パラメータをformObjectに追加
  Object.entries(arrayParams).forEach(([key, values]) => {
    formObject[key] = values;
  });

  return schema.parse(formObject);
};
