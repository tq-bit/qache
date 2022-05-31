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
const Validator_1 = require("./Validator");
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
class Cache {
    constructor({ cacheKey = 'default', entryKey = 'id', lifetime = 1000 * 60 * 5, validate = false, debug = false, original = null, }) {
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
            this.validator = new Validator_1.default(original);
        }
    }
    /**
     * @description Adds an entry to the cache.
     *
     * @param       key Identifier of the cache entry
     * @param       value Value of the cache entry
     * @param       options Custom options for this cache entry
     *
     * @example
     * cache.set('/users/1', {
     *  id: '1',
     *  firstName: 'John',
     *  secondName: 'Doe',
     * })
     */
    set(key, value, options) {
        this.hits++;
        const mustValidate = this.validate;
        const handleSet = () => {
            var _a, _b, _c;
            const timeoutKey = this.scheduleEntryDeletion(key, options === null || options === void 0 ? void 0 : options.customLifetime);
            const ignoreCreate = (_a = options === null || options === void 0 ? void 0 : options.ignoreCreate) !== null && _a !== void 0 ? _a : false;
            const ignoreUpdate = (_b = options === null || options === void 0 ? void 0 : options.ignoreUpdate) !== null && _b !== void 0 ? _b : false;
            const ignoreDelete = (_c = options === null || options === void 0 ? void 0 : options.ignoreDelete) !== null && _c !== void 0 ? _c : false;
            this.cacheMap[key] = {
                data: value,
                timeoutKey,
                ignoreCreate,
                ignoreUpdate,
                ignoreDelete,
            };
            if (!Array.isArray(value)) {
                this.updateRelatedCacheEntries(key, value);
            }
        };
        if (mustValidate) {
            const isValidEntry = this.handleValidation(value);
            if (isValidEntry === false) {
                this.log(`Invalid entry: ${key}`);
            }
            else {
                handleSet();
            }
        }
        else {
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
    get(key) {
        var _a;
        this.hits++;
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
     *
     * @example
     * cache.del('/users/1');
     * // Returns true
     */
    del(key) {
        this.hits++;
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
            hits: this.hits,
        };
    }
    /**
     * @description Resets the cache instance.
     *              Does not reset schemata and datatype.
     */
    flush() {
        this.hits = 0;
        this.cacheMap = {};
    }
    scheduleEntryDeletion(key, customLifetime) {
        return setTimeout(() => {
            this.del(key);
        }, customLifetime || this.lifetime);
    }
    handleValidation(value) {
        if (this.validator === null) {
            this.log(`Setting datatype to ${typeof value} in cache ${this.cacheKey}`);
            if (Array.isArray(value)) {
                this.validator = new Validator_1.default(value[0]);
            }
            else {
                this.validator = new Validator_1.default(value);
            }
            return true;
        }
        else {
            if (Array.isArray(value)) {
                return this.validator.validateList(value);
            }
            else {
                return this.validator.validate(value);
            }
        }
    }
    updateRelatedCacheEntries(key, value) {
        for (const cacheMapKey in this.cacheMap) {
            const cacheMapEntry = this.cacheMap[cacheMapKey];
            const entryData = cacheMapEntry === null || cacheMapEntry === void 0 ? void 0 : cacheMapEntry.data;
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
                const entryMustBeDeleted = !value &&
                    indexOfRelevantElement !== -1 &&
                    !cacheMapEntry.ignoreDelete;
                const entryMustBeUpdated = !!value &&
                    indexOfRelevantElement !== -1 &&
                    !cacheMapEntry.ignoreUpdate;
                const entryMustBeAdded = !!value &&
                    indexOfRelevantElement === -1 &&
                    !cacheMapEntry.ignoreCreate;
                if (entryMustBeDeleted) {
                    entries.splice(indexOfRelevantElement, 1);
                }
                else if (entryMustBeUpdated) {
                    entries[indexOfRelevantElement] = value;
                }
                else if (entryMustBeAdded) {
                    entries.push(Object.assign({}, value));
                }
                this.cacheMap[cacheMapKey] = Object.assign(Object.assign({}, this.cacheMap[cacheMapKey]), { data: [...entries] });
            }
        }
    }
    log(message) {
        if (this.debug === true) {
            console.dir(message);
        }
    }
}
exports.default = Cache;
//# sourceMappingURL=Cache.js.map