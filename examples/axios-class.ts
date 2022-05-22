import axios, { Axios } from 'axios';
import Cache from '../dist';

interface Todo {
  userId: string;
  id: string;
  title: string;
  completed: boolean;
}

class Client {
  private cache: Cache<Todo>;
  private client: Axios;

  constructor() {
    this.cache = new Cache<Todo>({
      cacheKey: 'todos',
      entryKey: 'id',
      lifetime: 1000 * 60 * 5,
    });
    this.client = axios.create({
      baseURL: 'https://jsonplaceholder.typicode.com/todos',
    });
  }

  public async getTodo(id: string): Promise<Todo | Todo[]> {
    const url = `${this.client.defaults.baseURL}/${id}`;

    // Check if there's a cached entry.
    const cached = this.cache.get(url);
    if (cached) {
      // If there's one, return it
      console.log('Receiving value from cache');
      return cached;
    } else {
      // If not, fetch it from the URL
      const response = await this.client.get(`/${id}`);
      const todo = response.data;

      // Then, cache it for later
      this.cache.set(url, todo);
      console.log('Receiving value from server');
      return todo;
    }
  }

  public getCache() {
    return this.cache;
  }
}

// Create a client instance and attempt to fetch the data twice
// The first time, data will be fetched from the server
// The second time, it will be taken from the cache
(async function () {
  const client = new Client();
  await client.getTodo('1');
  await client.getTodo('1');
  process.exit(0);
})();
