import Cache from '../src/index';
import { CacheOptions } from '../src/Cache';
import { expect } from 'chai';

const options: CacheOptions = {
  cacheKey: 'default',
  entryKey: 'id',
  lifetime: 5000,
  validate: false,
};

import {
  payloadUserOne,
  payloadUserOneUpdated,
  payloadUserThree,
  payloadUserTwo,
  payloadUsers,
  urlUserOne,
  urlUserThree,
  urlUserTwo,
  urlUsers,
  payloadUsersWithAdditionalProperty,
  payloadWithAdditionalProperty,
} from './data/users.data';

describe('Cache class', () => {
  it('Should create a new instance of Cache', () => {
    const cache = new Cache(options);
    expect(cache).instanceOf(Cache);
  });

  describe('Core functionality', () => {
    it('Should store a value for a unique key and retreive it', () => {
      const cache = new Cache(options);
      cache.set(urlUserOne, { ...payloadUserOne });
      expect(cache.get(urlUserOne)).to.deep.equal(payloadUserOne);
    });

    it('Should delete a value for a unique key', () => {
      const cache = new Cache(options);
      cache.set(urlUserOne, { ...payloadUserOne });
      cache.del(urlUserOne);
      expect(cache.get(urlUserOne)).to.be.undefined;
    });

    it('Should add a related cache entry if a new, single entry is added', () => {
      const cache = new Cache(options);
      cache.set(urlUsers, [...payloadUsers]);
      cache.set(urlUserThree, { ...payloadUserThree });
      expect(cache.get(urlUsers)).to.deep.include(payloadUserThree);
    });

    it('Should update related cache entries if a single entry is updated by its key', () => {
      const cache = new Cache(options);
      cache.set(urlUserOne, { ...payloadUserOne });
      cache.set(urlUsers, [...payloadUsers]);

      cache.set(urlUserOne, { ...payloadUserOneUpdated });
      expect(cache.get(urlUsers)).to.deep.include(payloadUserOneUpdated);
    });

    it('Should delete a value from a related cache entry if an existing value is delted', () => {
      const cache = new Cache(options);
      cache.set(urlUserOne, { ...payloadUserOne });
      cache.set(urlUsers, [...payloadUsers]);
      cache.del(urlUserOne);
      expect(cache.get(urlUsers)).to.not.deep.include(payloadUserOne);
    });

    it('Should delete all entries in the cache and reset schemata when flushed', () => {
      const cache = new Cache(options);
      cache.set(urlUserOne, { ...payloadUserOne });
      cache.set(urlUserTwo, { ...payloadUserTwo });
      cache.set(urlUsers, [...payloadUsers]);
      cache.flush();
      expect(cache.get(urlUserOne)).to.be.undefined;
      expect(cache.get(urlUserTwo)).to.be.undefined;
      expect(cache.get(urlUsers)).to.be.undefined;
    });

    it('Should increment its hit-counter whenever a set, get or delete method is used', () => {
      const cache = new Cache(options);
      cache.set(urlUserOne, { ...payloadUserOne });
      cache.get(urlUserOne);
      cache.del(urlUserOne);
      expect(cache.stats().hits).to.equal(3);
    });
  });

  describe('Schema validation', () => {
    it('Should validate each payload against its schema, if validation is enabled', () => {
      const cache = new Cache({ ...options, validate: true });
      cache.set(urlUserOne, { ...payloadUserOne });
      cache.set(urlUserTwo, { ...payloadUserTwo });
      cache.set(urlUsers, [...payloadUsers]);
    });

    it('Should not an entry if it does not match the schema', () => {
      const cache = new Cache({ ...options, validate: true });
      cache.set(urlUserOne, { ...payloadUserOne });
      cache.set('invalid', { ...payloadWithAdditionalProperty });
      cache.set('invalid-list', [...payloadUsersWithAdditionalProperty]);
      expect(cache.get('invalid')).to.be.undefined;
      expect(cache.get('invalid-list')).to.be.undefined;
    });
  });
});
