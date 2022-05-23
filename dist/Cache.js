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
    set(key, value, customLifetime) {
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
            }
            else {
                handleSet();
            }
        }
        else {
            handleSet();
        }
    }
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
    log(message) {
        if (this.debug === true) {
            console.dir(message);
        }
    }
}
exports.default = Cache;
//# sourceMappingURL=Cache.js.map