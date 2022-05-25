<a name="Cache"></a>

## Cache
**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| string | <code>cacheKey</code> | A unique identifier for the Cache instance. |
| string | <code>entryKey</code> | The property that defines the cache entry |
| number | <code>lifetime</code> | The entry's lifetime in milliseconds |
| any | <code>original</code> | An object based on which the cache's validation can be set |


* [Cache](#Cache)
    * [new Cache()](#new_Cache_new)
    * [.set(key, value, customLifetime)](#Cache+set)
    * [.get(key)](#Cache+get) ⇒ <code>T</code> \| <code>Array.&lt;T&gt;</code>
    * [.del(key)](#Cache+del) ⇒ <code>boolean</code>
    * [.stats()](#Cache+stats) ⇒ <code>CacheStats</code>
    * [.flush()](#Cache+flush)

<a name="new_Cache_new"></a>

### new Cache()
A simple key-value cache. Built to store typed and structured data.
             Qache is built for simplicity - it clones all data and stores them
             instead of keeping their references in memory.

**Example**  
```js
const cache = new Cache<{
  id: string;
  firstName: string;
  secondName: string;
}>({
  cacheKey: 'default',
  entryKey: 'id',
  lifetime: 1000 * 60 * 5,
});
```
<a name="Cache+set"></a>

### cache.set(key, value, customLifetime)
Adds an entry to the cache.

**Kind**: instance method of [<code>Cache</code>](#Cache)  

| Param | Description |
| --- | --- |
| key | Identifier of the cache entry |
| value | Value of the cache entry |
| customLifetime | Custom lifetime for this entry |

**Example**  
```js
cache.set('/users/1', {
 id: '1',
 firstName: 'John',
 secondName: 'Doe',
})
```
<a name="Cache+get"></a>

### cache.get(key) ⇒ <code>T</code> \| <code>Array.&lt;T&gt;</code>
Get a value from the cache.

**Kind**: instance method of [<code>Cache</code>](#Cache)  
**Returns**: <code>T</code> \| <code>Array.&lt;T&gt;</code> - The value of the cache entry  

| Param | Description |
| --- | --- |
| key | Identifier of the cache entry |

**Example**  
```js
const user = cache.get('/users/1');
console.log(user);
// Prints
// {
//  id: '1',
//  firstName: 'John',
//  secondName: 'Doe',
// }
```
<a name="Cache+del"></a>

### cache.del(key) ⇒ <code>boolean</code>
Deletes a single entry from the cache

**Kind**: instance method of [<code>Cache</code>](#Cache)  
**Returns**: <code>boolean</code> - Whether the entry was deleted  

| Param | Description |
| --- | --- |
| key | Identifier of the cache entry |

**Example**  
```js
cache.del('/users/1');
// Returns true
```
<a name="Cache+stats"></a>

### cache.stats() ⇒ <code>CacheStats</code>
Get details about the cache instance

**Kind**: instance method of [<code>Cache</code>](#Cache)  
**Returns**: <code>CacheStats</code> - A list of details about the current cache instance  
<a name="Cache+flush"></a>

### cache.flush()
Resets the cache instance.
             Does not reset schemata and datatype.

**Kind**: instance method of [<code>Cache</code>](#Cache)  
<a name="Validator"></a>

## Validator
**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| Schema | <code>schema</code> | A schema object |
| ValidationMethod | <code>validate</code> | `quick` or `deep` |


* [Validator](#Validator)
    * [new Validator()](#new_Validator_new)
    * [.validate(data)](#Validator+validate)
    * [.validateList(data)](#Validator+validateList)
    * [.getSchema()](#Validator+getSchema)

<a name="new_Validator_new"></a>

### new Validator()
Creates minimal object-validation schemata from primitive and complex types.
             There are two kinds of validation: `quick` and `deep`.
             - `quick` should be used when objects look exactly alike, including their property structure
             - `deep` should be used when objects are alike structurally, but their properties are mixed up

<a name="Validator+validate"></a>

### validator.validate(data)
Validates an item against the currently active schema

**Kind**: instance method of [<code>Validator</code>](#Validator)  

| Param | Description |
| --- | --- |
| data | The item to validate |

<a name="Validator+validateList"></a>

### validator.validateList(data)
Validates an array of items against the currently active schema

**Kind**: instance method of [<code>Validator</code>](#Validator)  

| Param | Description |
| --- | --- |
| data | An array of items to validate |

<a name="Validator+getSchema"></a>

### validator.getSchema()
Get the currently active schema of this validator instance

**Kind**: instance method of [<code>Validator</code>](#Validator)  
