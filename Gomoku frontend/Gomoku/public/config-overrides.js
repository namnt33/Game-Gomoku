module.exports = function override(config) {
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        "child_process": false, // Bỏ qua child_process
        "fs": false,           // Bỏ qua fs (nếu cần)
        "path": require.resolve("path-browserify"), // Polyfill cho path
      },
    };
    return config;
  };