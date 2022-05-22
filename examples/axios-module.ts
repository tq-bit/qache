import axios from 'axios';
import Cache from '../dist';
const cache = new Cache({
  cacheKey: 'posts',
  entryKey: 'id',
  lifetime: 1000 * 60 * 5,
});

const instance = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
});

instance.interceptors.request.use((config) => {
  const cached = cache.get(config.url || '');
  if (cached) {
    console.log('Receiving value from cache');
    return {
      ...config,
      data: cached,
      // The cancel token throws an error
      cancelToken: new axios.CancelToken((cancel) => cancel()),
    };
  } else {
    console.log('Executing http request');
    return config;
  }
});

instance.interceptors.response.use((response) => {
  console.log('Setting cache data');
  cache.set(response.config.url || '', response.data);
  return response;
});

(async function () {
  try {
    await instance.get('/todos/1');
    await instance.get('/todos/1');
  } catch (error) {
    console.log(error);
  }
  process.exit(0);
})();
