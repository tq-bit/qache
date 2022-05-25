---
title: Examples
editLink: true
---


# {{ $frontmatter.title }}

## Automatic cache updates

### An example case

To showcase this feature, let's assume the following scenario:

- you're using Qache on a frontend app to show a list of `contacts`
- you have an API endpoint your app fetches data from
- you'd like to use a cache instance that takes care of the API resource `contact`
- each contact entry has a unique property of `id`.
  - you can access single contacts by the API URL `/api/contact/{id}`
  - you can access a subset of all contacts by the API URL `/api/contact?page={page}&per_page={per_page}`

Whenever you add/update/delete a new entry, you must
1. POST/PUT/DELETE the contact on the server
2. GET one or several lists of entries back from the server
3. Sync local and remote state

### The HTTP module without Qache

Your service module might look something like this. As you can see, each `Contact` has a unique `id` property assigned.

```ts
interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// person.api.ts
async function getContact(id: string): Promise<Contact> {
  const url = `/api/contact/${id}`
  const response = await fetch(url);
  const contact = await response.json();
  return contact;
}

async function getContactList(page: number, per_page: number): Promise<Contact[]> {
  const url = `/api/contact?page=${page}&per_page=${per_page}`
  const response = await fetch();
  const contacts = await response.json();
  return contacts;
}

async function addContact(contact: Contact): Promise<Contact> {
  const url = `/api/contact`
  const options = {
    method: 'POST',
    body: JSON.stringify(person),
    headers: {
      'Content-Type': 'application/json'
    }
  }
  const response = await fetch(url, options);
  const contact = await response.json();
  return contact;
}
// ... and so on
```

### The HTTP module with Qache

We can now use the `url` as a cache key to store the respective responses. Create a new cache object and start storing values

#### Get & cache a single contact

```ts {6,11-14,17,23-26,29,44}
import Qache from '@tq-bit/qache';
interface Contact {
  // ...
}

const contactCache = new Qache<Contact>({cacheKey: 'contacts', entryKey: 'id'})

// person.api.ts
async function getContact(id: string): Promise<Contact> {
  const url = `/api/contact/${id}`
  const cachedContact = contactCache.get(url)
  if(cachedContact) {
    return cachedContact;
  }
  const response = await fetch(url);
  const contact = await response.json();
  contactCache.set(url, contact);
  return contact;
}
```

#### Get & cache multiple contacts

If your API is built to accept query parameters, you can use the whole url as a cache key again. This creates a new array entry.

```ts {3-6,9}
async function getContactList(page: number, per_page: number): Promise<Contact[]> {
  const url = `/api/contact?page=${page}&per_page=${per_page}`
  const cachedContactList = contactCache.get(url)
  if(cachedContactList) {
    return cachedContactList
  }
  const response = await fetch();
  const contacts = await response.json();
  contactCache.set(url, contacts);
  return contacts;
}
```

#### Add a new contact

Now it gets interesting. If you have an array item in your cache and create a new contact, you can directly cache the API response. Like so, there's no need to sync remote and local state. As long as the `entryKey` you specified in the cache is available on all contact items, Qache will handle these updates automatically.

```ts {11}
async function addContact(contact: Contact): Promise<Contact> {
  const url = `/api/contact`
  const options = {
    method: 'POST',
    body: JSON.stringify(contact),
    headers: {
      'Content-Type': 'application/json'
    }
  }
  const response = await fetch(url, options);
  const contact = await response.json();
  contactCache.set(`${url}/${contact.id}`, contact);
  return contact;
}
```

#### Update an existing contact

The same is true for existing contacts. Instead of using the response from the API, you can also use the contact item that was passed into `update`.

```ts {12}
async function update(contact: Contact): Promise<Contact> {
  const url = `/api/contact${contact.id}`
  const options = {
    method: 'PUT',
    body: JSON.stringify(contact),
    headers: {
      'Content-Type': 'application/json'
    }
  }
  const response = await fetch(url, options);
  const updatedContact = await response.json();
  contactCache.set(`${url}/${updatedContact.id}`, updatedContact);
  return contact;
}
```

### The final result

After making a POST and a PUT request, you can call `getContact` and `getContactList` again. Instead of making immediate API calls, both functions will first try to find a matching entry in the cache. Qache took care of synchronizing new and updated entries automaticlly, there's no deviation between your local and the server state.

::: tip Sync successful
When setting new entries, Qache iterated through all array elements in its cache and updates the respective entry.
:::