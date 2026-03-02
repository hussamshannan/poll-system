export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export const ok = <T>(data: T): ActionResult<T> => ({ success: true, data });

export const err = <T>(
  error: string,
  fieldErrors?: Record<string, string[]>
): ActionResult<T> => ({ success: false, error, fieldErrors });
