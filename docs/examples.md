---
title: Examples
editLink: true
---


# {{ $frontmatter.title }}

## A simple HTTP cache with fetch

The primary purpose of Qache is HTTP caching. Let's start with an example that uses a service module to fetch data from **jsonplaceholder**.

This example uses the project structure below. You can create a [Codesandbox](https://codesandbox.io/) to get started or create a local Typescript project:

```bash
/
| - /src
|   | - /services
|   |   | - post.api.ts
|   | - index.ts
| - index.html
```

### The HTTP module without Qache

First, build the service module without caching. It'll include

- A Typescript interface named **post**
- CRUD methods for the resource **post** of the **jsonplaceholder** API

Add the following code into the `post.api.ts` file:

<details>
<summary>
Toggle code
</summary>

```ts
interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export async function getPostById(postId: string): Promise<Post> {
  const response = await fetch(`${url}/${postId}`);
  return response.json();
}

export async function getPosts(): Promise<Post[]> {
  const response = await fetch(url);
  return response.json();
}

export async function getPostsByUserId(userId: string): Promise<Post[]> {
  const response = await fetch(`${url}?userId=${userId}`);
  return response.json();
}

export async function createPost(payload: Post): Promise<Post> {
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "content-type": "application/json" }
  });
  return response.json();
}

export async function deletePost(postId: string): Promise<Post> {
  const response = await fetch(`${url}/${postId}`);
  return response.json();
}

export async function updatePost(postId: string, payload: Post): Promise<Post> {
  const response = await fetch(`${url}/${postId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: { "content-type": "application/json" }
  });
  return response.json();
}
```
</details>

### Import Qache and initialize it

At the top if `post.api.ts` file, add the following.

```ts
import Qache from "@tq-bit/qache";

const url = "https://jsonplaceholder.typicode.com/posts";
const cache = new Qache<Post>({ cacheKey: "posts", entryKey: "id" });

interface Post { ... }

// -- snip --
```

This will initialize a new cache instance to store posts we will fetch in a second.

Now, let's refactor all the above methods to fit the new cache functionality.

### Cache GET requests

- Each time a function is invoked that returns data, we'll check if there's a matching entry in the cache.
- If so, we'll return it
- Else, we'll send the HTTP request and cache the response

<details>
<summary>
Toggle code
</summary>

```ts
export async function getPostById(postId: string): Promise<Post> {
  const resourceKey = `${url}/${postId}`;
  const cachedData = cache.get(resourceKey) as Post;
  if (cachedData) {
    return cachedData;
  }
  const response = await fetch(resourceKey);
  const data = await response.json()
  cache.set(url, data);
  return data;
}

export async function getPosts(): Promise<Post[]> {
  const cachedData = cache.get(resourceKey) as Post[];
  if (cachedData) {
    return cachedData;
  }
  const response = await fetch(url);
  const data = await response.json()
  cache.set(url, data);
  return data;
}

export async function getPostsByUserId(userId: string): Promise<Post[]> {
  const resourceKey = `${url}?userId=${userId}`;
  const cachedData = cache.get(resourceKey) as Post[];
  if(cachedData) {
    return cachedData;
  }
  const response = await fetch(resourceKey);
  const data = await response.json();
  cache.set(url, data);
  return data;
}
```

</details>

### Cache POST responses

It's common for servers to return a newly created resource in response to a `POST` request. Since our cache is keyed by the resource's `id`, we'll need to update it with the new entry.

For this, we'll

- create the resource on the server
- read out the response data and create a `resourceKey` based on the entry's `id`
- write the data to the cache instance

<details>
<summary>
Toggle code
</summary>

```ts
export async function createPost(payload: Post): Promise<Post> {
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "content-type": "application/json" }
  });
  const data = await response.json();
  const resourceKey = `${url}/${data.id}`;
  cache.set(resourceKey, data);
  return data;
}
```

</details>

::: tip About related data
When changing data in the cache, related entries of a cache resource will be updated as well, see [Automatic cache updates](#automatic-cache-updates). In this case, when you create a new post, Qache will try to update all cached post collections.
:::

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

### Disable automated cache updates

There might be cases in which related entries should not be updated. This is also true for our paginated example. **We don't want Qache to add a new entry to *all* cached pages**. Depending on your caching strategy, you will want to have more control over what gets updated and what doesn't.

There is a configuration object you can pass when `set`ting new entries. It implements `CacheSetOptions`:

```ts
interface CacheSetOptions {
  customLifetime?: number;
  ignoreCreate?: boolean;
  ignoreUpdate?: boolean;
  ignoreDelete?: boolean;
}
```

Let's try it:

```ts {9-11}
async function getContactList(page: number, per_page: number): Promise<Contact[]> {
  const url = `/api/contact?page=${page}&per_page=${per_page}`
  const cachedContactList = contactCache.get(url)
  if(cachedContactList) {
    return cachedContactList
  }
  const response = await fetch();
  const contacts = await response.json();
  contactCache.set(url, contacts, {
    ignoreCreate: true,
    ignoreUpdates: true,
    ignoreDelete: true
  });
  return contacts;
}
```

Now, if you CRUD on your contact resource, this collection will not be updated.

### The final result

After making a POST and a PUT request, you can call `getContact` and `getContactList` again. Instead of making immediate API calls, both functions will first try to find a matching entry in the cache.

::: tip Sync successful
Unless you set `ignoreUpdates` to `true`, Qache took care of synchronizing new and updated entries automaticlly. There's no delta between your local- and the server's state.
:::