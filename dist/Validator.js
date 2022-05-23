"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Validator {
    constructor(original, method) {
        this.method = method || 'quick';
        this.schema = this.constructSchema(original);
    }
    validate(data) {
        const localSchema = this.constructSchema(data);
        if (this.method === 'quick') {
            return this.quickSchemaValidation(this.schema, localSchema);
        }
    }
    validateList(data) {
        return data.every((item) => {
            return this.validate(item);
        });
    }
    constructSchema(original, level = 0) {
        const dataType = this.getDataType(original);
        const constructObjectSchema = (original) => {
            const localType = (() => {
                // Overwrite array type if the first item to be passed in is an array
                const isArrayOnFirstLevel = dataType === 'array' && level === 0;
                if (isArrayOnFirstLevel) {
                    return 'object';
                }
                return dataType;
            })();
            const schema = {
                type: localType,
                properties: {},
            };
            Object.keys(original).forEach((key) => {
                schema.properties[key] = this.constructSchema(original[key], level + 1);
            });
            return schema;
        };
        const constructArraySchema = (original) => {
            return constructObjectSchema(original[0]);
        };
        if (dataType === 'object') {
            return constructObjectSchema(original);
        }
        if (dataType === 'array') {
            return constructArraySchema(original);
        }
        return {
            type: dataType,
        };
    }
    quickSchemaValidation(schemaOne, schemaTwo) {
        return JSON.stringify(schemaOne) === JSON.stringify(schemaTwo);
    }
    getDataType(original) {
        if (Array.isArray(original)) {
            return 'array';
        }
        return typeof original;
    }
    getSchema() {
        return this.schema;
    }
}
exports.default = Validator;
//# sourceMappingURL=Validator.js.map