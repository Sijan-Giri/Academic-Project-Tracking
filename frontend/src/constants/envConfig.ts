const metaEnv = (import.meta as any).env;

export const envConfig = {
  VITE_API_URL: metaEnv?.VITE_API_URL || 'http://localhost:4000/api',
  VITE_SOCKET_URL: metaEnv?.VITE_SOCKET_URL || (metaEnv?.VITE_API_URL ? metaEnv.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:4000'),
  IS_DEV: metaEnv?.DEV ?? true,
  IS_PROD: metaEnv?.PROD ?? false,
};

export default envConfig;
