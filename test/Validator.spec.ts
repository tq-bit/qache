// @ts-nocheck
import Validator from '../src/Validator';
import { expect } from 'chai';

import {
  userSchema,
  payloadUserOne,
  payloadUserTwo,
  payloadWithAdditionalProperty,
  payloadUserInDifferentOrder,
  payloadUserWrongType,
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

  it('Should create a schema from a Javascript array passed into it', () => {
    const validator = new Validator([
      { ...payloadUserOne },
      { ...payloadUserTwo },
    ]);
    expect(validator.getSchema()).to.deep.equal({
      ...userSchema,
      type: 'object',
    });
  });

  describe('Quick validation', () => {
    it('Should return true if two distinct object have the same structure', () => {
      const validator = new Validator(payloadUserOne, 'quick');
      expect(validator.validate(payloadUserTwo)).to.be.true;
    });

    it('Should return false if two distinct object have a different structure', () => {
      const validator = new Validator(payloadUserOne, 'quick');
      expect(validator.validate(payloadWithAdditionalProperty)).to.be.false;
    });
  });

  describe('Deep validation', () => {
    it('Should return true if two distinct objects have the same structure', () => {
      const validator = new Validator(payloadUserOne, 'deep');
      expect(validator.validate(payloadUserTwo)).to.be.true;
    });

    it('Should return true if two distinct objects have the same structure, but in a different order', () => {
      const validator = new Validator(payloadUserOne, 'deep');
      expect(validator.validate(payloadUserInDifferentOrder)).to.be.true;
    });

    it('Should return false if two distinct objects have a different structure', () => {
      const validator = new Validator(payloadUserOne, 'deep');
      expect(validator.validate(payloadWithAdditionalProperty)).to.be.false;
    });

    it("Should return false if at least one of the object's properties has the incorrect type", () => {
      const validator = new Validator(payloadUserOne, 'deep');
      expect(validator.validate(payloadUserWrongType)).to.be.false;
    });
  });
});
