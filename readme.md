<div id="top"></div>

<div align="center">

  <h1 align="center">Qache</h1>

  <p align="center">A lightweight and secure caching module - built with Typescript</p>

  <div align="center">
    <img alt="License" src="https://img.shields.io/github/license/tq-bit/qache?style=plastic"/>
    <img alt="Size" src="https://img.shields.io/bundlephobia/min/@tq-bit/qache?style=plastic">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/tq-bit/qache?style=plastic&logo=git"/>
  </div>
</div>

<!-- ABOUT THE PROJECT -->
## About The Project

Qache was created to provide secure and predictable HTTP - caching for one of my Vue apps.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

Qache has a tiny footprint and no dependencies. It can be used in any Browser or Node (v14+) environment.

### Installation

Run the following command in a project of your choice:

```bash
npm install @tq-bit/qache
```

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

Besides caching single values, it also needed to keep related entries in sync. As a consequence, it comes with a few opinionated (but optional) default features:

- **One cache per API resource** -> Each endpoint an application targets must have its own Qache instance
- **Schema validation** -> The first entry that is added into the cache defines the schema for other entries
- **Default TTL** -> Default TTL for entries is set to 15 minutes
- **Type safety** -> You can use Typescript Generics to improve Qache's intellisense
- **Automatic cache updates** -> When a single entry is created or updated by its key, related entries are automatically updated as well

### Configuration API

#### `cacheKey` {string}

Name of the cache instance. Currently only useful for debugging.

**Default**: `'default'`

#### `cacheKey` {string}

Name of the property Qache uses to try and match entries for [automatic cache updates](#automatic-cache-updates)

**Default**: `'id'`

#### `lifetime` {number}

Lifetime of a single cache entry in MS

**Default**: `1000 * 60 * 15 (= 5 minutes)`

#### `validate` {bool}

Whether or not to validate entries that are added to the cache

**Default**: `true`

#### `debug` {bool}

Set to `true` to enable verbose logging

**Default**: `false`

#### Default configuration example

This is the default configuration used by the Qache constructor:

```ts
{
  cacheKey = 'default',
  entryKey = 'id',
  lifetime = 1000 * 60 * 5,
  validate = true,
  debug = false,
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
```

### Add and update entries to/in the cache

Each cache entry is saved a simple Javascript Object. It is identified by a `key` and has a dedicated `timeout` instance. This prevents the process from running through every entry to check for individual timeouts.

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

> The first entry's structure will be used to validate all further entries. If you assign an array if items, the structure of the first entry will be used for validation.

### Automatic cache updates

When a single entry is created or updated, all related cached entries are automatically updated as well. Qache will iterate through all array-like entries in the cache, try to find matches and update them accordingly. It works like this:

1. A new entry is added to the cache
2. Qache will check if there are one or more collection items (= `Arrays`) in its cache-map
3. It will then either `add` or `update` entries into these collection types

Deleting entries works analogous. If a single entry is removed from the cache, all collections will be updated accordingly.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] Release v0.1.0
- [ ] Add a 'strict' mode in which types of entries are validated
- [ ] Make it possible to create a manual validation schema
- [ ] Improve logging messages for when validation fails

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


