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

interface CacheStats {
  cacheKey: string;
  entryKey: string;
  lifetime: number;
  datatype: CacheDataType;
  schema: string[];
  count: number;
}

/**
 * @class
 *
 * @description A simple key-value cache. Built to store typed and structured data.
 *              Qache is built for simplicity - it clones all data and stores them
 *              instead of keeping their references in memory.
 *
 * @property    {cacheKey} string A unique identifier for the Cache instance.
 * @property    {entryKey} string The property that defines the cache entry
 * @property    {lifetime} number The entry's lifetime in milliseconds
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
  private schema: string[];
  private cacheMap: {
    [key: string]: {
      data: T | T[];
      timeoutKey: ReturnType<typeof setTimeout>;
    };
  };

  constructor({
    cacheKey,
    entryKey,
    lifetime,
  }: {
    cacheKey: string;
    entryKey: string;
    lifetime: number;
  }) {
    this.cacheKey = cacheKey || 'default';
    this.entryKey = entryKey || 'id';
    this.lifetime = lifetime || 1000 * 60 * 5;
    this.datatype = null;
    this.schema = [];
    this.cacheMap = {};
  }

  /**
   * @description Adds an entry to the cache.
   *
   * @param       key Identifier of the cache entry
   * @param       value Value of the cache entry
   * @param       customLifetime? Custom lifetime for this entry
   */
  public set(key: string, value: T | T[], customLifetime?: number) {
    this.handleSchemaValidation(value);

    const timeoutKey = this.scheduleEntryDeletion(key, customLifetime);
    this.cacheMap[key] = { data: value, timeoutKey };

    if (!Array.isArray(value)) {
      this.updateRelatedCacheEntries(key, value);
    }
  }

  /**
   * @description Get a value from the cache.
   *
   * @param       key Identifier of the cache entry
   *
   * @returns {T | T[]} The value of the cache entry
   */
  public get(key: string): T | T[] | undefined {
    if (!!this.cacheMap[key]) {
      return this.cacheMap[key]?.data;
    } else {
      this.throwError(`Key ${key} not found in cache`);
    }
  }

  /**
   * @description Deletes a single entry from the cache
   *
   * @param       key Identifier of the cache entry
   *
   * @returns     {boolean} Whether the entry was deleted
   */
  public del(key: string): boolean {
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
    };
  }

  /**
   * @description Resets the cache instance.
   *              Does not reset schemata and datatype.
   */
  public flush() {
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

  private handleSchemaValidation(value: T | T[]) {
    if (!this.datatype) {
      this.setDatatype(value);
      this.setSchema(value);
    } else {
      this.validateDatatype(value);
      this.validateSchema(value);
    }
  }

  private setDatatype(value: T | T[]) {
    this.datatype = typeof value;
  }

  private validateDatatype(value: T | T[]) {
    const hasCorrectType: boolean = this.datatype === typeof value;
    if (!hasCorrectType) {
      this.throwError(
        `Attempted to assign ${typeof value} to ${this.datatype} cache`,
      );
    }
  }

  private setSchema(value: T | T[]) {
    if (Array.isArray(value)) {
      this.schema = Object.keys(value[0]);
    } else {
      this.schema = Object.keys(value);
    }
  }

  private validateSchema(value: T | T[]) {
    const validateItemArray = (value: T[]) => {
      value.forEach((entry, index) => {
        const hasCorrectSchema: boolean = Object.keys(entry).every(
          (valueKey) => {
            return this.schema.includes(valueKey);
          },
        );
        if (!hasCorrectSchema) {
          this.throwError(
            `Schema mismatch for item at position ${index} - [${Object.keys(
              value[index],
            )}] does not match schema [${this.schema}]`,
          );
        }
      });
    };

    const validateItem = (value: T) => {
      const hasCorrectSchema: boolean = Object.keys(value).every((valueKey) => {
        return this.schema.includes(valueKey);
      });

      if (!hasCorrectSchema) {
        this.throwError(
          `Schema mismatch for item - [${Object.keys(
            value,
          )}] does not match schema [${this.schema}]`,
        );
      }
    };

    if (Array.isArray(value)) {
      validateItemArray(value);
    } else {
      validateItem(value);
    }
  }

  private updateRelatedCacheEntries(key: string, value?: T) {
    for (const cacheMapKey in this.cacheMap) {
      const entryData = this.cacheMap[cacheMapKey]?.data;
      const cachedEntryIsArray = Array.isArray(entryData);

      if (cachedEntryIsArray) {
        const entries = entryData as T[];
        const indexOfRelevantElement = entries.findIndex((entry: T) => {
          if (!!value) {
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

  private throwError(message: string) {
    throw new Error(`Error in cache ${this.cacheKey}: \n ${message}`);
  }
}
