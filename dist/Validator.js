"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @class
 *
 * @description Creates minimal object-validation schemata from primitive and complex types.
 *              There are two kinds of validation: `quick` and `deep`.
 *              - `quick` should be used when objects look exactly alike, including their property structure
 *              - `deep` should be used when objects are alike structurally, but their properties are mixed up
 *
 * @property    {schema} Schema A schema object
 * @property    {validate} ValidationMethod `quick` or `deep`
 */
class Validator {
    constructor(original, method) {
        this.method = method || 'quick';
        this.schema = this.constructSchema(original);
    }
    /**
     * @description Validates an item against the currently active schema
     *
     * @param data The item to validate
     */
    validate(data) {
        const localSchema = this.constructSchema(data);
        if (this.method === 'quick') {
            return this.quickSchemaValidation(this.schema, localSchema);
        }
        if (this.method === 'deep') {
            return this.deepSchemaValidation(this.schema, localSchema);
        }
    }
    /**
     * @description Validates an array of items against the currently active schema
     *
     * @param data An array of items to validate
     */
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
    deepSchemaValidation(schemaOne, schemaTwo, level = 0) {
        const errors = [];
        const schemaOneKeys = Object.keys(schemaOne);
        const schemaTwoKeys = Object.keys(schemaTwo);
        if (schemaOneKeys.length !== schemaTwoKeys.length) {
            errors.push({
                title: `Schema keys do not match at level ${level}`,
                text: `${schemaOneKeys} !== ${schemaTwoKeys}`,
            });
            return false;
        }
        for (const key of schemaOneKeys) {
            const schemaOneValue = schemaOne[key];
            const schemaTwoValue = schemaTwo[key];
            if (schemaOneValue.type !== schemaTwoValue.type) {
                errors.push({
                    title: `Schema types do not match at level ${level} for key ${key}`,
                    text: `${schemaOneValue.type} !== ${schemaTwoValue.type}`,
                });
            }
        }
        if (schemaOne.properties) {
            return this.deepSchemaValidation(schemaOne.properties, schemaTwo.properties, level + 1);
        }
        if (errors.length > 0) {
            errors.forEach((error) => {
                console.error('\x1b[31m', error.title);
                console.error('\x1b[31m', `↪ ${error.text}`);
            });
            return false;
        }
        return true;
    }
    getDataType(original) {
        if (Array.isArray(original)) {
            return 'array';
        }
        return typeof original;
    }
    /**
     * @description Get the currently active schema of this validator instance
     */
    getSchema() {
        return this.schema;
    }
}
exports.default = Validator;
//# sourceMappingURL=Validator.js.map