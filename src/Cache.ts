/**
 * @class
 *
 * @description A custom class for general- and HTTP caching.
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
  cacheKey: string;
  entryKey: string;
  lifetime: number;
  datatype:
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
  cacheMap: {
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
    this.cacheMap = {};
  }

  public set(key: string, value: T | T[]) {
    const timeoutKey = this.scheduleEntryDeletion(key);
    this.cacheMap[key] = { data: value, timeoutKey };

    this.handleSchemaValidation(value);
    if (!Array.isArray(value)) {
      this.updateRelatedCacheEntries(key, value);
    }
  }

  public get(key: string): any {
    if (!!this.cacheMap[key]) {
      return this.cacheMap[key]?.data;
    } else {
      throw new Error(`Key ${key} not found in cache`);
    }
  }

  public deleteValue(key: string) {
    const { [key]: value, ...rest } = this.cacheMap;
    this.cacheMap = rest;
    return value;
  }

  private scheduleEntryDeletion(key: string): ReturnType<typeof setTimeout> {
    return setTimeout(() => {
      this.deleteValue(key);
    }, this.lifetime);
  }

  private handleSchemaValidation(value: T | T[]) {
    if (!this.datatype) {
      this.setDatatype(value);
    } else {
      this.validateDatatype(value);
    }
  }

  private setDatatype(value: T | T[]) {
    this.datatype = typeof value;
  }

  private validateDatatype(value: T | T[]) {
    const hasCorrectType: boolean = this.datatype === typeof value;
    if (!hasCorrectType) {
      throw new Error(
        `Attempted to assign ${typeof value} to ${this.datatype} cache`,
      );
    }
  }

  private updateRelatedCacheEntries(key: string, value: T) {
    for (const cacheMapKey in this.cacheMap) {
      const entryData = this.cacheMap[cacheMapKey]?.data;
      const cachedEntryIsArray = Array.isArray(entryData);

      if (cachedEntryIsArray) {
        const entries = entryData as T[];
        const indexOfRelevantElement = entries.findIndex((entry: T) => {
          return (entry as any)[this.entryKey] === key;
        });

        entries.splice(indexOfRelevantElement, 1);
        if (value) {
          entries.push({ ...value } as T);
        }

        this.cacheMap[cacheMapKey] = {
          ...this.cacheMap[cacheMapKey],
          data: [...entries],
        };
      }
    }
  }
}
