import axios from 'axios';
import Cache from '../dist';
const cache = new Cache({
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
  cache.set(response.config.url || '', response.data);
  return response;
});

// Access the response and cached data manually
(async function () {
  const response = await instance.get('/todos/1');
  const cachedData = await cache.get('/todos/1');
  console.log(response);
  console.log(cachedData);
  process.exit(0);
})();
