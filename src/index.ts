import Cache from './Cache';

const cache = new Cache<{
  id: string;
  firstName: string;
  secondName: string;
}>({
  cacheKey: 'default',
  entryKey: 'id',
  lifetime: 1000 * 60 * 5,
});

cache.set('1', {
  id: '1',
  firstName: 'John',
  secondName: 'Updated',
});
cache.set('2', [
  { id: '1', firstName: 'John', secondName: 'Smith' },
  {
    id: '2',
    firstName: 'Jane',
    secondName: 'Doe',
    // @ts-ignore
    finalName: 'Smith',
  },
]);

process.exit(0);
