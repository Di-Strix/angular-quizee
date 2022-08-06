// https://thymikee.github.io/jest-preset-angular/docs/guides/troubleshooting/#resolver-needed-for-some-javascript-library-or-nested-dependencies
module.exports = (path, options) => {
  return options.defaultResolver(path, {
    ...options,
    packageFilter: (pkg) => {
      const pkgNamesToTarget = new Set([
        'uuid',
        '@firebase/auth',
        '@firebase/storage',
        '@firebase/functions',
        '@firebase/functions-compat',
        '@firebase/database',
        '@firebase/auth-compat',
        '@firebase/database-compat',
        '@firebase/app-compat',
        '@firebase/firestore',
        '@firebase/firestore-compat',
        '@firebase/messaging',
        '@firebase/util',
        'firebase',
      ]);

      if (pkgNamesToTarget.has(pkg.name)) {
        delete pkg['exports'];
        delete pkg['module'];
      }

      return pkg;
    },
  });
};
