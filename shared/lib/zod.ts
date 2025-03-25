import { z } from "zod";

export const parseFormWithZod = <T>(
  formData: FormData,
  schema: z.ZodSchema<T>
): T => {
  const formObject: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    formObject[key] = value;
  }

  return schema.parse(formObject);
};
