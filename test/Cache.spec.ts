import Cache from '../src/Cache';
import { expect } from 'chai';

const options = {
  cacheKey: 'default',
  entryKey: 'id',
  lifetime: 5000,
};

const urlUsers = '/api/v1/users';
const urlUserOne = '/api/v1/users/1';
const urlUserTwo = '/api/v1/users/2';
const urlUserThree = '/api/v1/users/3';

const payloadUserOne = {
  id: '1',
  firstName: 'John',
  secondName: 'Smith',
};
const payloadUserTwo = {
  id: '2',
  firstName: 'Jane',
  secondName: 'Doe',
};
const payloadUserThree = {
  id: '3',
  firstName: 'Jack',
  secondName: 'Miller',
};
const payloadWithAdditionalProperty = {
  id: '4',
  firstName: 'Jack',
  secondName: 'Turpin',
  familyName: 'Miller',
};

const payloadUsers = [{ ...payloadUserOne }, { ...payloadUserTwo }];

const payloadUserOneUpdated = {
  id: '1',
  firstName: 'John',
  secondName: 'Doe',
};

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
    expect(() => cache.get(urlUserOne)).to.throw();
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
    expect(() => cache.get('invalid')).to.throw();
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
    expect(() => cache.get(urlUserOne)).to.throw();
    expect(() => cache.get(urlUserTwo)).to.throw();
    expect(() => cache.get(urlUsers)).to.throw();
  });
});
