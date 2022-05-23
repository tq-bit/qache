// @ts-nocheck
import Validator from '../src/Validator';
import { expect } from 'chai';

import {
  userSchema,
  payloadUserOne,
  payloadUserTwo,
  payloadWithAdditionalProperty,
} from './data/users.data';

describe('Validator class', () => {
  it('Should create a new instance of Validator', () => {
    const validator = new Validator({});
    expect(validator).instanceOf(Validator);
  });

  it('Should create a schema from an Javascript object passed into it', () => {
    const validator = new Validator(payloadUserOne);
    expect(validator.getSchema()).to.deep.equal(userSchema);
  });

  it('Should return true if two distinct object have the same structure', () => {
    const validator = new Validator(payloadUserOne, 'quick');
    expect(validator.validate(payloadUserTwo)).to.be.true;
  });

  it('Should return false if two distinct object have a different structure', () => {
    const validator = new Validator(payloadUserOne, 'quick');
    expect(validator.validate(payloadWithAdditionalProperty)).to.be.false;
  });
});
