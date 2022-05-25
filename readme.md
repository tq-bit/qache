---
title: Home
---

<div id="top"></div>

<div align="center">

  <h1 align="center">Qache</h1>

  <p align="center">Zero-dependency, lightweight caching module for Node.js and the browser - built with Typescript</p>

  <div align="center">
    <img alt="License" src="https://img.shields.io/github/license/tq-bit/qache?style=plastic"/>
    <img alt="Size" src="https://img.shields.io/bundlephobia/min/@tq-bit/qache?style=plastic">
    <img alt="npm" src="https://img.shields.io/npm/dm/@tq-bit/qache?style=plastic&logo=npm">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/tq-bit/qache?style=plastic&logo=git"/>
    <img alt="nycrc config on GitHub" src="https://img.shields.io/nycrc/tq-bit/qache?config=.nycrc&preferredThreshold=lines&logo=mocha">

  </div>
</div>

## Table of contents

- [Table of contents](#table-of-contents)
- [About The Project](#about-the-project)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Development](#development)
    - [Build the project + docs (recommended)](#build-the-project--docs-recommended)
    - [Run the documentation locally](#run-the-documentation-locally)
    - [Deploy the documentation to GitHub Pages](#deploy-the-documentation-to-github-pages)
    - [Create a new NPM release](#create-a-new-npm-release)
- [Usage](#usage)
  - [Default configuration example](#default-configuration-example)
  - [Create a new cache instance](#create-a-new-cache-instance)
  - [Add and modify cache entries](#add-and-modify-cache-entries)
  - [Automatic cache updates](#automatic-cache-updates)
- [Roadmap](#roadmap)
- [License](#license)
- [Contact](#contact)

<!-- ABOUT THE PROJECT -->
## About The Project

Qache was created to provide secure and predictable HTTP - caching for my Vue apps. It can be used as a normal Javascript cache. Its however lies in its ability to update collections of items if a single item changes. This approach was heavily inspired by [Apollo's caching system](https://www.apollographql.com/docs/react/data/caching/).

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

Qache has a tiny footprint and no dependencies. It can be used in any Browser or Node (v14+) environment.

### Installation

Run the following command in a project of your choice:

```bash
npm install @tq-bit/qache
```

You can then import the module into your project:

```js
// Using ES6 modules:
import Qache from '@tq-bit/qache';

// Using CommonJS:
const Qache = require('@tq-bit/qache')['default'];

// You can then start using it in your code:
const cache = new Qache({cacheKey: 'default'});
```

### Development

Clone the repository to your local machine. You can find:

- The source code in the `src` folder
- Automated **Mocha** tests in the `test` folder
- Its documentation in the `docs` folder

> **Note:** Parts of the documentation are automatically created during build time.
> - `index` is equal to `readme.md`
> - `api` is extracted from JSDoc comments in the built files


#### Build the project + docs (recommended)

The following command build the project and the documentation files. It applies configured linting rules and runs registered automated tests.

```bash
npm run pre-release
```

#### Run the documentation locally

Qache is documented using [Vitepress](https://vitepress.vuejs.org/). You can run the documentation locally:

```bash
npm run docs:dev
```

#### Deploy the documentation to GitHub Pages

You can find the release documentation under https://tq-bit.github.io/qache. To build it, run

```bash
npm run docs:deploy

# Alternatively, you can just buidl the docs and serve them locally
npm run docs:build && npm run docs:serve
```

#### Create a new NPM release

This command runs the `pre-release` command and pushes a new, built version on NPM

> **Note:** This command requires a 2fa confirmation

```bash
npm run release
```


<p align="right">(<a href="#top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

Besides caching single values, Qache keeps related entries in sync while ensuring type safety. As a consequence, it comes with a few opinionated (but optional) features:

- **One cache per API resource** -> Each cache holds a single validation schema. This implies: Each resource an application targets must have its own Qache instance.
- **Schema validation** -> The first entry that is added into the cache defines the schema for other entries. You can optionally pass an `original` - property into the configuration to build up the schema.
- **Type safety** -> You can use Typescript Generics to supercharge Qache's type safety.
- **Automatic cache updates** -> When a single entry is created or updated by its key, Qache will try to update related entries. See [Automatic cache updates](#automatic-cache-updates)

### Default configuration example

This is the default configuration used by the Qache constructor. I'd recommend you give each cache at least a unique `cacheKey` property.

```ts
{
  cacheKey = 'default',
  entryKey = 'id',
  lifetime = 1000 * 60 * 5,
  validate = false,
  debug = false,
  original = null
}
```

### Create a new cache instance

Once you've installed Qache, you can start creating cache instances in your project.

```ts
import Cache from '@tq-bit/qache'

// Create a basic cache instance
const cache = new Cache();

// Add a custom configuration
const customCache = new Cache({
  cacheKey: 'posts',      // = the key of the cache instance
  entryKey: 'id',         // = the key-property of single cache entries
  lifetime: 1000 * 60 * 5 // = TTL of 5 minutes,
})

// For TS users: Add a generic interface for cache entries
interface Post {
  id: number;
  title: string;
  body: string;
}
const typedCache = new Cache<Post>({
  cacheKey: 'posts',
  entryKey: 'id',
  lifetime: 1000 * 60 * 5
});

// If a cache object is available during cache creation, it can be passed in as an 'original'
const typedCacheWithOriginal = new Cache<Post>({
  cacheKey: 'posts',
  entryKey: 'id',
  lifetime: 1000 * 60 * 5,
  original: { id: 3, title: 'Hello', body: 'World' },
});
```

### Add and modify cache entries

Each cache entry is saved a simple Javascript Object. It is identified by a `key` and has a dedicated `timeout` instance.

> Note: This approach might be replaced by a single check period to remove redundant entries.

New entries can be created the same way updates are done.

```ts
cache.set('api/posts/1', {
  id: 1,
  title: 'Lorem Ipsum',
  body: 'Lorem ipsum dolor sit amet'
});

// You can also cache an array of entries
cache.set('api/posts/', [
  {
    id: 1,
    title: 'Lorem Ipsum',
    body: 'Lorem ipsum dolor sit amet',
  },
  {
    id: 2,
    title: 'Lorem Ipsum',
    body: 'Lorem ipsum dolor sit amet',
  },
]);
```

### Automatic cache updates

When a single entry is created or updated, all related cached entries are automatically updated as well. Qache will iterate through all array-like entries in the cache, try to find matches and update them accordingly. It works like this:

1. A new entry is added to the cache
2. Qache will check if there are one or more collection items (= `Arrays`) in its cache-map
3. It will then either `add` or `update` entries into these collection types

Deleting entries works analogous. If a single entry is removed from the cache, all collections will be updated accordingly.

Check out [the docs](https://tq-bit.github.io/qache/examples.html) for examples

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] Release v0.1.0
- [x] Add a 'strict' mode in which types of entries are validated
- [x] Make it possible to create a manual validation schema
- [ ] Add a more complex validation algorithm
- [ ] Improve logging messages for when validation fails (requires complex validation logic)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Mail: [tobi@q-bit.me](mailto:tobi@q-bit.me) - Twitter: [@qbitme](https://twitter.com/qbitme)

Project Link: [https://github.com/tq-bit/qache](https://github.com/tq-bit/qache)

<p align="right">(<a href="#top">back to top</a>)</p>


