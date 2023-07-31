const path = require('path')

module.exports = {
  i18n: {
    defaultLocale: 'en-EN',
    locales: ['en-EN', 'pt-PT'],
    localeDetection: false,
  },
  localePath: path.resolve('./src/locales'),
}
