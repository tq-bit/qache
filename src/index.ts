import Cache from './Cache';

const cache = new Cache<String>({
  cacheKey: 'default',
  entryKey: 'id',
  lifetime: 1000 * 60 * 5,
});

cache.set('2', 'Test');

// @ts-ignore
cache.set('1', { id: '1', firstName: 'John', secondName: 'Updated' });

console.log(cache.get('2'));

console.log(cache.datatype);
process.exit(0);
