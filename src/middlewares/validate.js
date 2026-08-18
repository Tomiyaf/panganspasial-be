/**
 * Middleware factory to validate request against a Zod schema
 * @param {import("zod").ZodSchema} schema
 */
export const validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (validated.body !== undefined && req.body) {
      req.body = validated.body;
    }
    if (validated.params !== undefined && req.params) {
      req.params = validated.params;
    }

    req.validated = validated;
    next();
  } catch (err) {
    next(err);
  }
};
