declare type CacheDataType = 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function' | 'array' | null;
export interface CacheOptions {
    cacheKey?: string;
    entryKey?: string;
    lifetime?: number;
    validate?: boolean;
    debug?: boolean;
    original?: any;
}
interface CacheStats {
    cacheKey: string;
    entryKey: string;
    lifetime: number;
    datatype: CacheDataType;
    schema: string[];
    count: number;
    hits: number;
}
/**
 * @class
 *
 * @description A simple key-value cache. Built to store typed and structured data.
 *              Qache combines simplicity and security - it clones all data and stores them
 *              instead of keeping their references in memory.
 *
 * @property    {cacheKey} string A unique identifier for the Cache instance.
 * @property    {entryKey} string The property that defines the cache entry
 * @property    {lifetime} number The entry's lifetime in milliseconds
 * @property    {original} any An object based on which the cache's validation can be set
 *
 * @example
 * const cache = new Cache<{
 *   id: string;
 *   firstName: string;
 *   secondName: string;
 * }>({
 *   cacheKey: 'default',
 *   entryKey: 'id',
 *   lifetime: 1000 * 60 * 5,
 * });
 */
export default class Cache<T> {
    private cacheKey;
    private entryKey;
    private lifetime;
    private datatype;
    private validate;
    private schema;
    private cacheMap;
    private validator;
    private hits;
    private debug;
    constructor({ cacheKey, entryKey, lifetime, validate, debug, original, }: CacheOptions);
    /**
     * @description Adds an entry to the cache.
     *
     * @param       key Identifier of the cache entry
     * @param       value Value of the cache entry
     * @param       customLifetime Custom lifetime for this entry
     *
     * @example
     * cache.set('/users/1', {
     *  id: '1',
     *  firstName: 'John',
     *  secondName: 'Doe',
     * })
     */
    set(key: string, value: T | T[], customLifetime?: number): void;
    /**
     * @description Get a value from the cache.
     *
     * @param       key Identifier of the cache entry
     *
     * @returns {T | T[]} The value of the cache entry
     *
     * @example
     * const user = cache.get('/users/1');
     * console.log(user);
     * // Prints
     * // {
     * //  id: '1',
     * //  firstName: 'John',
     * //  secondName: 'Doe',
     * // }
     *
     */
    get(key: string): T | T[] | undefined;
    /**
     * @description Deletes a single entry from the cache
     *
     * @param       key Identifier of the cache entry
     *
     * @returns     {boolean} Whether the entry was deleted
     *
     * @example
     * cache.del('/users/1');
     * // Returns true
     */
    del(key: string): boolean;
    /**
     * @description Get details about the cache instance
     *
     * @returns {CacheStats} A list of details about the current cache instance
     */
    stats(): CacheStats;
    /**
     * @description Resets the cache instance.
     *              Does not reset schemata and datatype.
     */
    flush(): void;
    private scheduleEntryDeletion;
    private handleValidation;
    private updateRelatedCacheEntries;
    private log;
}
export {};
