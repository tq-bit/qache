import Cache from '../src/index';
import { expect } from 'chai';

const options = {
  cacheKey: 'default',
  entryKey: 'id',
  lifetime: 5000,
};

import {
  payloadUserOne,
  payloadUserOneUpdated,
  payloadUserThree,
  payloadUserTwo,
  payloadUsers,
  payloadUsersWithAdditionalProperty,
  urlUserOne,
  payloadWithAdditionalProperty,
  urlUserThree,
  urlUserTwo,
  urlUsers,
} from './data/users.data';

describe('Cache class', () => {
  it('Should create a new instance of Cache', () => {
    const cache = new Cache(options);
    expect(cache).instanceOf(Cache);
  });

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

  it('Should create a data-type and a schema when the first entry is added', () => {
    const cache = new Cache(options);
    cache.set(urlUserOne, { ...payloadUserOne });
    expect(cache.stats().datatype).to.equal('object');
    expect(cache.stats().schema).to.deep.equal([
      'id',
      'firstName',
      'secondName',
    ]);
  });

  it('Should throw an error if an entry is to be added that has too many properties', () => {
    const cache = new Cache(options);
    cache.set(urlUserOne, { ...payloadUserOne });
    expect(() =>
      cache.set('invalid', payloadWithAdditionalProperty),
    ).to.throw();
    expect(cache.get('invalid')).to.be.undefined;
  });

  it('Should throw an error if a list of entries is to be added that has too many properties', () => {
    const cache = new Cache(options);
    cache.set(urlUserOne, { ...payloadUserOne });
    expect(() =>
      cache.set(urlUsers, payloadUsersWithAdditionalProperty),
    ).to.throw();
    expect(cache.get(urlUsers)).to.be.undefined;
  });

  it('Should throw an error if an unknown datatype is added to a cache', () => {
    const cache = new Cache(options);
    cache.set(urlUserOne, { ...payloadUserOne });
    expect(() => cache.set('invalid', 'invalid')).to.throw();
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
