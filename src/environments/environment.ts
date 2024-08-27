// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: true,
  apiUrl: 'https://alaam.net:3000/',
  // apiUrl: 'https://localhost:3000/',
  s3_url: 'https://allam-stg.s3.ap-south-1.amazonaws.com/',
  agora: {
    appId: '407deb8eaa634e0482b0f5481eefd1e9'
  }
};
