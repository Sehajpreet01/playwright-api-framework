const env = process.env.ENV || 'dev';

export const baseUrl   = process.env[`BASE_URL_${env}`]   || '';
export const projectId = parseInt(process.env[`PROJECT_ID_${env}`], 10);
export const brandId   = parseInt(process.env[`BRAND_ID_${env}`],   10);
