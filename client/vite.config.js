import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';


// https://vitejs.dev/config/

export default ({ mode }) => {
  // Provide access to environment variables inside config.
  const env = loadEnv(mode, path.join(__dirname, '../environment'), '');

  return defineConfig({
    envDir: '../environment',
    plugins: [vue()],
    server: {
      port: env.VITE_PORT,
      cors: true,
      proxy: {
        '/api': {
          target: `http://localhost:${env.VITE_SERVER_PORT}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ""),
        }
      }
    },
    preview: {
      port: env.VITE_PORT
    },
    resolve: {
      alias: {
        '@': process.cwd()
      }
    }
  })
}
