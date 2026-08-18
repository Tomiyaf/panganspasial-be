// Allow JSON.stringify to handle BigInt values seamlessly
if (!BigInt.prototype.toJSON) {
  BigInt.prototype.toJSON = function () {
    return Number(this) <= Number.MAX_SAFE_INTEGER ? Number(this) : this.toString();
  };
}

/**
 * Standard success response format
 */
export const sendSuccess = (res, data = null, message = "Success", statusCode = 200, meta = undefined) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Standard error response format
 */
export const sendError = (res, message = "Internal Server Error", statusCode = 500, code = "INTERNAL_ERROR", details = null) => {
  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details !== null && details !== undefined) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};
