class ApiError extends Error {
  constructor(
    statuscode,
    message = "something went wrong",
    errors = [],
    statck = ""
  ) {
    super(message);
    this.statuscode = statuscode;
    this.message = message;
    this.errors = errors;
    this.success = false;
    this.data = null;

    if (statck) {
      this.stack = statck;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
