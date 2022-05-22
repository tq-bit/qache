import Cache from '../dist';

const cache = new Cache<{
  userId: number;
  id: number;
  title: string;
  body: string;
}>({
  cacheKey: 'posts',
  entryKey: 'id',
  lifetime: 1000 * 60 * 5,
});

const posts = [
  {
    userId: 1,
    id: 1,
    title:
      'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
    body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto',
  },
  {
    userId: 1,
    id: 2,
    title: 'qui est esse',
    body: 'est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla',
  },
  {
    userId: 1,
    id: 3,
    title: 'ea molestias quasi exercitationem repellat qui ipsa sit aut',
    body: 'et iusto sed quo iure\nvoluptatem occaecati omnis eligendi aut ad\nvoluptatem doloribus vel accusantium quis pariatur\nmolestiae porro eius odio et labore et velit aut',
  },
];

const invalidPost = {
  userId: 1,
  id: 4,
  title: 'ea molestias quasi exercitationem repellat qui ipsa sit aut',
  description:
    'et iusto sed quo iure\nvoluptatem occaecati omnis eligendi aut ad\nvoluptatem doloribus vel accusantium quis pariatur\nmolestiae porro eius odio et labore et velit aut',
};

// Here, the cache's schema will be set to the first item in the posts - array
// -> [userId,id,title,body]
cache.set('/posts', posts);

// This assignment will fail and throw an error
// [userId,id,title,description] !== [userId,id,title,body]
// cache.set('/invalid', invalidPost);

// You can turn off validation by setting the 'validate' option to false
// and leaving the type out of the Cache constructor
const cacheWithoutValidation = new Cache({
  cacheKey: 'posts',
  entryKey: 'id',
  lifetime: 1000 * 60 * 5,
  validate: false,
});

cacheWithoutValidation.set('/posts', posts);

// This assignment will now succeed
cacheWithoutValidation.set('/invalid', invalidPost);
