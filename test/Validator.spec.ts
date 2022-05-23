// @ts-nocheck
import Validator from '../src/Validator';
import { expect } from 'chai';

const payloadUserOne = {
  id: '1',
  firstName: 'John',
  secondName: 'Smith',
  adresses: [
    {
      id: 1,
      street: 'Street 1',
    },
    {
      id: 2,
      street: 'Street 2',
    },
  ],
};

describe('Validator class', () => {
  it('Should create a new instance of Validator', () => {
    const validator = new Validator({});
    expect(validator).instanceOf(Validator);
  });

  it('Should create a schema from an Javascript object passed into it', () => {
    const validator = new Validator(payloadUserOne);
    expect(validator.getSchema()).to.deep.equal({
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        firstName: {
          type: 'string',
        },
        secondName: {
          type: 'string',
        },
        adresses: {
          type: 'array',
          properties: {
            id: {
              type: 'number',
            },
            street: {
              type: 'string',
            },
          },
        },
      },
    });
  });
});
