import { appTools, defineConfig } from '@modern-js/app-tools';
import { tailwindcssPlugin } from '@modern-js/plugin-tailwindcss';
import { ssgPlugin } from '@modern-js/plugin-ssg';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  dev: {
    port: 8000,
  },
  tools: {
    devServer: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          pathRewrite: { '^/api': '' },
        },
      },
    },
  },
  runtime: {
    router: true,
  },
  output: {
    ssg: true,
  },
  plugins: [appTools(), tailwindcssPlugin(), ssgPlugin()],
});
