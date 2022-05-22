<div id="top"></div>

[![License][license-shield]][license-shield]
[![Size][size-shield]][size-shield]
[![Github Commits][commit-shield]][commit-shield]

<!-- ABOUT THE PROJECT -->
## About The Project

Qache was created to provide secure and predictable HTTP - caching for one of my Vue apps. Besides caching single values, it also needed to keep related entries in sync. As a consequence, it comes with a few opinionated (but optional) default features:

- **One cache per API resource** -> Each endpoint an application targets must have its own Qache instance
- **Schema validation** -> The first entry that is added into the cache defines the schema for other entries
- **Default TTL** -> Default TTL for entries is set to 15 minutes
- **Type safety** -> You can use Typescript Generics to improve Qache's intellisense
- **Automatic cache updates** -> When a single entry is created or updated by its key, related entries are automatically updated as well

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

Qache has a tiny footprint (8.5kb zipped) and no dependencies. It can be used in any Browser or Node environment.

### Installation

Run the following command in a project of your choice:

```bash
npm install @tq-bit/qache
```

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage


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

### Add and update entries to the cache

Each cache entry is saved a simple Javascript Object. It is identified by a `key` and has a dedicated `timeout` instance. This prevents the process from running through every entry to check for individual timeouts.

New entries can be created the same way updates are done:

```ts
// The first entry's structure will be used to validate
// all further entries
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

If you assign an array if items, the structure of the first entry will be used for validation.

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



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[size-shield]: https://img.shields.io/bundlephobia/min/@tq-bit/qache?style=plastic
[license-shield]: https://img.shields.io/github/license/tq-bit/qache?style=plastic
[license-url]: https://github.com/tq-bit/qache/blob/master/LICENSE
[commit-shield]: https://img.shields.io/github/last-commit/tq-bit/qache?style=plastic&logo=git