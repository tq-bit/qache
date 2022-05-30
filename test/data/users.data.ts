export const urlUsers = '/api/v1/users';
export const urlUserOne = '/api/v1/users/1';
export const urlUserTwo = '/api/v1/users/2';
export const urlUserThree = '/api/v1/users/3';

export interface User {
  id: string;
  firstName: string;
  secondName: string;
  adresses?: {
    street?: string;
    city?: string;
  }[];
  items?: {
    id?: number;
    payments?: {
      id?: number;
      amount?: number;
    }[];
  }[];
}

export const userSchema = {
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
    items: {
      type: 'array',
      properties: {
        id: {
          type: 'number',
        },
        payments: {
          type: 'array',
          properties: {
            id: {
              type: 'number',
            },
            amount: {
              type: 'number',
            },
          },
        },
      },
    },
  },
};

export const payloadUserOne = {
  id: '1',
  firstName: 'John',
  secondName: 'Smith',
  adresses: [
    {
      id: 1,
      street: 'Street 1',
    },
  ],
  items: [
    {
      id: 1,
      payments: [
        {
          id: 1,
          amount: 100,
        },
        {
          id: 2,
          amount: 200,
        },
      ],
    },
  ],
};
export const payloadUserTwo = {
  id: '2',
  firstName: 'Jane',
  secondName: 'Doe',
  adresses: [
    {
      id: 2,
      street: 'Street 2',
    },
  ],
  items: [
    {
      id: 1,
      payments: [
        {
          id: 1,
          amount: 100,
        },
        {
          id: 2,
          amount: 200,
        },
      ],
    },
  ],
};
export const payloadUserThree = {
  id: '3',
  firstName: 'Jack',
  secondName: 'Miller',
  adresses: [
    {
      id: 3,
      street: 'Street 3',
    },
  ],
  items: [
    {
      id: 1,
      payments: [
        {
          id: 1,
          amount: 100,
        },
        {
          id: 2,
          amount: 200,
        },
      ],
    },
  ],
};
export const payloadWithAdditionalProperty = {
  id: '4',
  firstName: 'Jack',
  secondName: 'Turpin',
  familyName: 'Miller',
  adresses: [
    {
      id: 4,
      street: 'Street 4',
    },
  ],
  items: [
    {
      id: 1,
      payments: [
        {
          id: 1,
          amount: 100,
        },
        {
          id: 2,
          amount: 200,
        },
      ],
    },
  ],
};
export const payloadUserInDifferentOrder = {
  id: '5',
  secondName: 'Jones',
  firstName: 'Albert',
  adresses: [
    {
      street: 'Street 5',
    },
  ],
  items: [
    {
      payments: [
        {
          id: 1,
          amount: 100,
        },
        {
          amount: 200,
          id: 2,
        },
      ],
      id: 1,
    },
  ],
};

export const payloadUserWrongType = {
  id: 5,
  secondName: 'Jones',
  firstName: false,
  adresses: [
    {
      street: 'Street 5',
    },
  ],
  items: [
    {
      payments: [
        {
          id: 1,
          amount: '100',
        },
        {
          amount: 200,
          id: true,
        },
      ],
      id: 1,
    },
  ],
};

export const payloadUsers = [{ ...payloadUserOne }, { ...payloadUserTwo }];
export const payloadUsersWithAdditionalProperty = [
  { ...payloadUserOne },
  { ...payloadWithAdditionalProperty },
  { ...payloadUserThree },
];

export const payloadUserOneUpdated = {
  id: '1',
  firstName: 'John',
  secondName: 'Doe',
  adresses: [
    {
      id: 2,
      street: 'Street 2',
    },
  ],
  items: [
    {
      id: 1,
      payments: [
        {
          id: 1,
          amount: 100,
        },
        {
          id: 2,
          amount: 200,
        },
      ],
    },
  ],
};
