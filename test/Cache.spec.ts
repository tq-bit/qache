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
  User,
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

  describe('Automatic cache updates', () => {
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

    it('Should delete a value from a related cache entry if an existing value is deleted', () => {
      const cache = new Cache(options);
      cache.set(urlUserOne, { ...payloadUserOne });
      cache.set(urlUsers, [...payloadUsers]);
      cache.del(urlUserOne);
      expect(cache.get(urlUsers)).to.not.deep.include(payloadUserOne);
    });

    it('Should not add an item to collections if create is disabled', () => {
      const cache = new Cache<User>({ ...options, validate: true });

      cache.set(urlUserOne, payloadUserOne);
      cache.set(urlUsers, [payloadUserTwo, payloadUserThree], {
        ignoreCreate: true,
      });

      const cachedUserEntry = cache.get(urlUserOne) as User;
      const cachedUserList = cache.get(urlUsers) as User[];

      expect(cachedUserEntry).to.deep.equal(payloadUserOne);
      expect(cachedUserList).to.not.deep.include(cachedUserEntry);
    });

    it('Should not update a collection if update is disabled', () => {
      const cache = new Cache<User>({ ...options, validate: true });
      const newFirstName = 'This update should be ignored!';

      cache.set(urlUsers, [...payloadUsers], { ignoreUpdate: true });
      cache.set(urlUserOne, {
        ...payloadUserOne,
        firstName: newFirstName,
      });
      const cachedUserEntry = cache.get(urlUserOne) as User;
      const cachedUserList = cache.get(urlUsers) as User[];
      const entryToBeIgnored = cachedUserList.find(
        (user) => user.id === cachedUserEntry.id,
      ) as User;

      expect(cachedUserEntry.firstName === newFirstName).to.be.true;
      expect(entryToBeIgnored.firstName === newFirstName).to.be.false;
    });

    it('Should not delete from a collection if delete is disabled', () => {
      const cache = new Cache<User>({ ...options, validate: true });

      cache.set(urlUserOne, payloadUserOne);
      cache.set(urlUsers, [...payloadUsers], { ignoreDelete: true });
      cache.del(urlUserOne);

      const cachedUserEntry = cache.get(urlUserOne) as User;
      const cachedUserList = cache.get(urlUsers) as User[];

      const entryToBeIgnored = cachedUserList.find(
        (user) => user.id === payloadUserOne.id,
      ) as User;

      expect(cachedUserEntry).to.be.undefined;
      expect(entryToBeIgnored).to.deep.equal(payloadUserOne);
    });
  });

  describe('Schema validation', () => {
    it('Should activate a new validator instance when validation is enabled and an object item is passed in first', () => {
      const cache = new Cache({ ...options, validate: true });
      cache.set(urlUserOne, { ...payloadUserOne });
      cache.set(urlUserTwo, { ...payloadUserTwo });
      cache.set(urlUsers, [...payloadUsers]);
      expect(cache.get(urlUserOne)).to.deep.equal(payloadUserOne);
      expect(cache.get(urlUserTwo)).to.deep.equal(payloadUserTwo);
      expect(cache.get(urlUsers)).to.deep.include(payloadUserOne);
    });

    it('Should activate a new validator instance when when validation is enabled and an array item is passed in first', () => {
      const cache = new Cache({ ...options, validate: true });
      cache.set(urlUsers, [...payloadUsers]);
      cache.set(urlUserOne, { ...payloadUserOne });
      cache.set(urlUserTwo, { ...payloadUserTwo });
      cache.set('invalid', { ...payloadWithAdditionalProperty });
      expect(cache.get(urlUsers)).to.deep.include(payloadUserOne);
      expect(cache.get(urlUserOne)).to.deep.equal(payloadUserOne);
      expect(cache.get(urlUserTwo)).to.deep.equal(payloadUserTwo);
      expect(cache.get('invalid')).to.be.undefined;
    });

    it('Should activate a new validator instance when validation is enabled and an object item is passed in to the constructor', () => {
      const cache = new Cache({
        ...options,
        validate: true,
        original: payloadUserOne,
      });
      cache.set(urlUsers, [...payloadUsers]);
      cache.set(urlUserOne, { ...payloadUserOne });
      cache.set(urlUserTwo, { ...payloadUserTwo });
      cache.set('invalid', { ...payloadWithAdditionalProperty });
      expect(cache.get(urlUsers)).to.deep.include(payloadUserOne);
      expect(cache.get(urlUserOne)).to.deep.equal(payloadUserOne);
      expect(cache.get(urlUserTwo)).to.deep.equal(payloadUserTwo);
      expect(cache.get('invalid')).to.be.undefined;
    });

    it('Should not add or update an entry if it does not match the schema', () => {
      const cache = new Cache({ ...options, validate: true });
      cache.set(urlUserOne, { ...payloadUserOne });
      cache.set('invalid', { ...payloadWithAdditionalProperty });
      cache.set('invalid-list', [...payloadUsersWithAdditionalProperty]);
      expect(cache.get('invalid')).to.be.undefined;
      expect(cache.get('invalid-list')).to.be.undefined;
    });
  });
});
