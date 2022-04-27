const { resolve } = require('path');
const { defineConfig } = require('vite');

module.exports = defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        faust_ui: resolve(__dirname, 'faust-ui.html'),
        gc_test: resolve(__dirname, 'gc-test.html'),
        mfcc_test: resolve(__dirname, 'mfcc-test.html')
      }
    }
  }
})