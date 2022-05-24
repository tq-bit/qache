/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  title: 'Qache',
  description:
    'Zero-dependency, lightweight caching module for Node.js and the browser - built with Typescript',
  base: '/docs/',
  markdown: {
    lineNumbers: true,
  },
  themeConfig: {
    nav: [
      {
        text: 'API',
        link: '/api',
      },
      {
        text: 'Examples',
        link: '/examples',
      },
      {
        text: 'GitHub',
        link: 'https://github.com/tq-bit/qache',
      }
    ],
  },
};

export default config;
