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
    set(key: string, value: T | T[], customLifetime?: number): void;
    get(key: string): T | T[] | undefined;
    del(key: string): boolean;
    stats(): CacheStats;
    flush(): void;
    private scheduleEntryDeletion;
    private handleValidation;
    private updateRelatedCacheEntries;
    private log;
}
export {};
