export const success = (message = "ok", data = null) => ({
  success: true,
  message,
  data,
});

export const failure = (message = "error", error = null) => ({
  success: false,
  message,
  error,
});
