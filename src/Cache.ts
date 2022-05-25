import Validator from './Validator';

type CacheDataType =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'undefined'
  | 'object'
  | 'function'
  | 'array'
  | null;

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
  private cacheKey: string;
  private entryKey: string;
  private lifetime: number;
  private datatype: CacheDataType;
  private validate: boolean;
  private schema: string[];
  private cacheMap: {
    [key: string]: {
      data: T | T[];
      timeoutKey: ReturnType<typeof setTimeout>;
    };
  };
  private validator: Validator<T> | null;
  private hits: number;
  private debug: boolean;

  constructor({
    cacheKey = 'default',
    entryKey = 'id',
    lifetime = 1000 * 60 * 5,
    validate = false,
    debug = false,
    original = null,
  }: CacheOptions) {
    this.cacheKey = cacheKey;
    this.entryKey = entryKey;
    this.lifetime = lifetime;
    this.datatype = null;
    this.validator = null;
    this.validate = validate;
    this.schema = [];
    this.cacheMap = {};
    this.debug = debug;
    this.hits = 0;
    if (original) {
      this.validator = new Validator(original);
    }
  }

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
  public set(key: string, value: T | T[], customLifetime?: number) {
    this.hits++;
    const mustValidate = this.validate;
    const handleSet = () => {
      const timeoutKey = this.scheduleEntryDeletion(key, customLifetime);
      this.cacheMap[key] = { data: value, timeoutKey };
      if (!Array.isArray(value)) {
        this.updateRelatedCacheEntries(key, value);
      }
    };

    if (mustValidate) {
      const isValidEntry = this.handleValidation(value);
      if (isValidEntry === false) {
        this.log(`Invalid entry: ${key}`);
      } else {
        handleSet();
      }
    } else {
      handleSet();
    }
  }

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
  public get(key: string): T | T[] | undefined {
    this.hits++;
    if (this.cacheMap[key]) {
      this.log(`Retrieving key ${key} from cache ${this.cacheKey}`);
      return this.cacheMap[key]?.data;
    } else {
      this.log(`Key ${key} not found in cache`);
    }
  }

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
  public del(key: string): boolean {
    this.hits++;
    this.log(`Deleting key ${key} from cache ${this.cacheKey}`);
    const { [key]: value, ...rest } = this.cacheMap;
    this.cacheMap = rest;
    if (!Array.isArray(value)) {
      this.updateRelatedCacheEntries(key);
    }
    return !!value?.data;
  }

  /**
   * @description Get details about the cache instance
   *
   * @returns {CacheStats} A list of details about the current cache instance
   */
  public stats(): CacheStats {
    return {
      cacheKey: this.cacheKey,
      entryKey: this.entryKey,
      lifetime: this.lifetime,
      datatype: this.datatype,
      schema: this.schema,
      count: Object.keys(this.cacheMap).length,
      hits: this.hits,
    };
  }

  /**
   * @description Resets the cache instance.
   *              Does not reset schemata and datatype.
   */
  public flush() {
    this.hits = 0;
    this.cacheMap = {};
  }

  private scheduleEntryDeletion(
    key: string,
    customLifetime?: number,
  ): ReturnType<typeof setTimeout> {
    return setTimeout(() => {
      this.del(key);
    }, customLifetime || this.lifetime);
  }

  private handleValidation(value: T | T[]) {
    if (this.validator === null) {
      this.log(`Setting datatype to ${typeof value} in cache ${this.cacheKey}`);
      if (Array.isArray(value)) {
        this.validator = new Validator<T>(value[0]);
      } else {
        this.validator = new Validator<T>(value);
      }
      return true;
    } else {
      if (Array.isArray(value)) {
        return this.validator.validateList(value);
      } else {
        return this.validator.validate(value);
      }
    }
  }

  private updateRelatedCacheEntries(key: string, value?: T) {
    for (const cacheMapKey in this.cacheMap) {
      const entryData = this.cacheMap[cacheMapKey]?.data;
      const cachedEntryIsArray = Array.isArray(entryData);

      if (cachedEntryIsArray) {
        const entries = entryData as T[];
        const indexOfRelevantElement = entries.findIndex((entry: T) => {
          if (value) {
            return (
              (entry as any)[this.entryKey] === (value as any)[this.entryKey]
            );
          } else {
            return -1;
          }
        });
        if (!value && indexOfRelevantElement !== -1) {
          entries.splice(indexOfRelevantElement, 1);
        } else if (!!value && indexOfRelevantElement !== -1) {
          entries[indexOfRelevantElement] = value;
        } else {
          entries.push({ ...value } as T);
        }

        this.cacheMap[cacheMapKey] = {
          ...this.cacheMap[cacheMapKey],
          data: [...entries],
        };
      }
    }
  }

  private log(message: any) {
    if (this.debug === true) {
      console.dir(message);
    }
  }
}
