if (process.env.API_BASE_URL === undefined) throw new Error('process.env.API_BASE_URL is undefined');

export const apiBaseUrl = process.env.API_BASE_URL;
