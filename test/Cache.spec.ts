import Cache from '../src/Cache';
import { expect } from 'chai';

describe('Cache class', () => {
  it('Should create a new instance of Cache', () => {
    const cache = new Cache({
      cacheKey: 'default',
      entryKey: 'id',
      lifetime: 1000 * 60 * 5,
    });

    expect(cache).instanceOf(Cache);
  });
});
