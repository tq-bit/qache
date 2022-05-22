"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
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
class Cache {
    constructor({ cacheKey = 'default', entryKey = 'id', lifetime = 1000 * 60 * 5, validate = true, debug = false, }) {
        this.cacheKey = cacheKey;
        this.entryKey = entryKey;
        this.lifetime = lifetime;
        this.datatype = null;
        this.validate = validate;
        this.schema = [];
        this.cacheMap = {};
        this.debug = debug;
    }
    /**
     * @description Adds an entry to the cache.
     *
     * @param       key Identifier of the cache entry
     * @param       value Value of the cache entry
     * @param       customLifetime? Custom lifetime for this entry
     */
    set(key, value, customLifetime) {
        if (this.validate) {
            this.handleSchemaValidation(value);
        }
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
    get(key) {
        var _a;
        if (this.cacheMap[key]) {
            this.log(`Retrieving key ${key} from cache ${this.cacheKey}`);
            return (_a = this.cacheMap[key]) === null || _a === void 0 ? void 0 : _a.data;
        }
        else {
            this.log(`Key ${key} not found in cache`);
        }
    }
    /**
     * @description Deletes a single entry from the cache
     *
     * @param       key Identifier of the cache entry
     *
     * @returns     {boolean} Whether the entry was deleted
     */
    del(key) {
        this.log(`Deleting key ${key} from cache ${this.cacheKey}`);
        const _a = this.cacheMap, _b = key, value = _a[_b], rest = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
        this.cacheMap = rest;
        if (!Array.isArray(value)) {
            this.updateRelatedCacheEntries(key);
        }
        return !!(value === null || value === void 0 ? void 0 : value.data);
    }
    /**
     * @description Get details about the cache instance
     *
     * @returns {CacheStats} A list of details about the current cache instance
     */
    stats() {
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
    flush() {
        this.cacheMap = {};
    }
    scheduleEntryDeletion(key, customLifetime) {
        return setTimeout(() => {
            this.del(key);
        }, customLifetime || this.lifetime);
    }
    handleSchemaValidation(value) {
        if (!this.datatype) {
            this.log(`Setting datatype to ${typeof value} in cache ${this.cacheKey}`);
            this.setDatatype(value);
            this.setSchema(value);
        }
        else {
            this.log(`Validating datatype in cache ${this.cacheKey}`);
            this.log(value);
            this.validateDatatype(value);
            this.validateSchema(value);
        }
    }
    setDatatype(value) {
        this.datatype = typeof value;
    }
    validateDatatype(value) {
        const hasCorrectType = this.datatype === typeof value;
        if (!hasCorrectType) {
            this.throwError(`Attempted to assign ${typeof value} to ${this.datatype} cache`);
        }
    }
    setSchema(value) {
        if (Array.isArray(value)) {
            this.schema = Object.keys(value[0]);
        }
        else {
            this.schema = Object.keys(value);
        }
    }
    validateSchema(value) {
        const validateItemArray = (value) => {
            value.forEach((entry, index) => {
                const hasCorrectSchema = Object.keys(entry).every((valueKey) => {
                    return this.schema.includes(valueKey);
                });
                if (!hasCorrectSchema) {
                    this.throwError(`Schema mismatch for item at position ${index} - [${Object.keys(value[index])}] does not match schema [${this.schema}]`);
                }
            });
        };
        const validateItem = (value) => {
            const hasCorrectSchema = Object.keys(value).every((valueKey) => {
                return this.schema.includes(valueKey);
            });
            if (!hasCorrectSchema) {
                this.throwError(`Schema mismatch for item - [${Object.keys(value)}] does not match schema [${this.schema}]`);
            }
        };
        if (Array.isArray(value)) {
            validateItemArray(value);
        }
        else {
            validateItem(value);
        }
    }
    updateRelatedCacheEntries(key, value) {
        var _a;
        for (const cacheMapKey in this.cacheMap) {
            const entryData = (_a = this.cacheMap[cacheMapKey]) === null || _a === void 0 ? void 0 : _a.data;
            const cachedEntryIsArray = Array.isArray(entryData);
            if (cachedEntryIsArray) {
                const entries = entryData;
                const indexOfRelevantElement = entries.findIndex((entry) => {
                    if (value) {
                        return (entry[this.entryKey] === value[this.entryKey]);
                    }
                    else {
                        return -1;
                    }
                });
                if (!value && indexOfRelevantElement !== -1) {
                    entries.splice(indexOfRelevantElement, 1);
                }
                else if (!!value && indexOfRelevantElement !== -1) {
                    entries[indexOfRelevantElement] = value;
                }
                else {
                    entries.push(Object.assign({}, value));
                }
                this.cacheMap[cacheMapKey] = Object.assign(Object.assign({}, this.cacheMap[cacheMapKey]), { data: [...entries] });
            }
        }
    }
    throwError(message) {
        throw new Error(`Error in cache ${this.cacheKey}: \n ${message}`);
    }
    log(message) {
        if (this.debug === true) {
            console.dir(message);
        }
    }
}
exports.default = Cache;
