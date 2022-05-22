import axios from 'axios';
import Cache from '../dist';

interface Post {
  userId: string;
  id: number;
  title: string;
  body: string;
}

const cache = new Cache<Post>({
  cacheKey: 'posts',
  entryKey: 'id',
  lifetime: 1000 * 60 * 5,
});

// Create a custom axios instance
const instance = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
});

// Add a single interceptor that sets cache data for a single request URL
instance.interceptors.response.use((response) => {
  console.log('Setting cache data');
  cache.set(response.config.url || '', response.data as Post | Post[]);
  return response;
});

// Access the response and cached data manually
(async function () {
  const response = await instance.get('/posts/1');
  const cachedData = cache.get('/posts/1');
  console.log(response.data);
  console.log(cachedData);
  process.exit(0);
})();
