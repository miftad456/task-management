export const success = (message, data = null) => ({
    success: true,
    message,
    data,
});

export const failure = (message) => ({
    success: false,
    message,
});
