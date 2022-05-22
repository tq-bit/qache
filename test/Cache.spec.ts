import Cache from '../src/Cache';
import { expect } from 'chai';

const options = {
  cacheKey: 'default',
  entryKey: 'id',
  lifetime: 1000 * 60 * 5,
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

  it('Should be able to store a value for a unique key and retreive it', () => {
    const cache = new Cache(options);
    cache.set(urlUserOne, payloadUserOne);
    expect(cache.get(urlUserOne)).to.deep.equal(payloadUserOne);
  });

  it('Should add a related cache entry if a new, single entry is added', () => {
    const cache = new Cache(options);
    cache.set(urlUsers, payloadUsers);
    cache.set(urlUserThree, payloadUserThree);
    expect(cache.get(urlUsers)).to.deep.include(payloadUserThree);
  });

  it('Should update related cache entries if a single entry is updated by its key', () => {
    const cache = new Cache(options);
    cache.set(urlUserOne, payloadUserOne);
    cache.set(urlUsers, payloadUsers);

    cache.set(urlUserOne, payloadUserOneUpdated);
    expect(cache.get(urlUsers)).to.deep.include(payloadUserOneUpdated);
  });
});
