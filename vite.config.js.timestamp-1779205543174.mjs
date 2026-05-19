// vite.config.js
import { defineConfig } from "file:///C:/Vektor/threejs-webxr-ar-main/node_modules/vite/dist/node/index.js";
var vite_config_default = defineConfig({
  root: ".",
  resolve: {
    alias: {
      "@": "/src",
      "@core": "/src/core",
      "@ar": "/src/ar",
      "@math": "/src/math",
      "@vectors": "/src/vectors",
      "@scenes": "/src/scenes",
      "@animations": "/src/animations",
      "@ui": "/src/ui",
      "@utils": "/src/utils",
      "@assets": "/src/assets"
    }
  },
  server: {
    port: 3e3,
    open: true
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    minify: "esbuild"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxWZWt0b3JcXFxcdGhyZWVqcy13ZWJ4ci1hci1tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxWZWt0b3JcXFxcdGhyZWVqcy13ZWJ4ci1hci1tYWluXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9WZWt0b3IvdGhyZWVqcy13ZWJ4ci1hci1tYWluL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIC8vIFJvb3QgaXMgdGhlIHByb2plY3Qgcm9vdCAoaW5kZXguaHRtbCBsaXZlcyBoZXJlKVxuICByb290OiAnLicsXG5cbiAgLy8gU291cmNlIGNvZGUgbGl2ZXMgaW4gc3JjL1xuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogJy9zcmMnLFxuICAgICAgJ0Bjb3JlJzogJy9zcmMvY29yZScsXG4gICAgICAnQGFyJzogJy9zcmMvYXInLFxuICAgICAgJ0BtYXRoJzogJy9zcmMvbWF0aCcsXG4gICAgICAnQHZlY3RvcnMnOiAnL3NyYy92ZWN0b3JzJyxcbiAgICAgICdAc2NlbmVzJzogJy9zcmMvc2NlbmVzJyxcbiAgICAgICdAYW5pbWF0aW9ucyc6ICcvc3JjL2FuaW1hdGlvbnMnLFxuICAgICAgJ0B1aSc6ICcvc3JjL3VpJyxcbiAgICAgICdAdXRpbHMnOiAnL3NyYy91dGlscycsXG4gICAgICAnQGFzc2V0cyc6ICcvc3JjL2Fzc2V0cycsXG4gICAgfSxcbiAgfSxcblxuICAvLyBEZXYgc2VydmVyIGNvbmZpZ1xuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwLFxuICAgIG9wZW46IHRydWUsXG4gICAgLy8gSFRUUFMgbmVlZGVkIGZvciBXZWJYUiBvbiBub24tbG9jYWxob3N0XG4gICAgLy8gaHR0cHM6IHRydWUsXG4gIH0sXG5cbiAgLy8gQnVpbGQgY29uZmlnXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgc291cmNlbWFwOiB0cnVlLFxuICAgIG1pbmlmeTogJ2VzYnVpbGQnLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXFSLFNBQVMsb0JBQW9CO0FBRWxULElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBRTFCLE1BQU07QUFBQSxFQUdOLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUs7QUFBQSxNQUNMLFNBQVM7QUFBQSxNQUNULE9BQU87QUFBQSxNQUNQLFNBQVM7QUFBQSxNQUNULFlBQVk7QUFBQSxNQUNaLFdBQVc7QUFBQSxNQUNYLGVBQWU7QUFBQSxNQUNmLE9BQU87QUFBQSxNQUNQLFVBQVU7QUFBQSxNQUNWLFdBQVc7QUFBQSxJQUNiO0FBQUEsRUFDRjtBQUFBLEVBR0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBR1I7QUFBQSxFQUdBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLFFBQVE7QUFBQSxFQUNWO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
