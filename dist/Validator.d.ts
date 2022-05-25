declare type ValidSchemaType = 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function' | 'array' | null;
declare type ValidationMethod = 'quick' | 'deep';
export interface Schema {
    type: ValidSchemaType;
    properties?: {
        [key: string]: Schema;
    };
    items?: Schema[];
}
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
export default class Validator<T> {
    private schema;
    private method;
    constructor(original: T, method?: ValidationMethod);
    /**
     * @description Validates an item against the currently active schema
     *
     * @param data The item to validate
     */
    validate(data: T): boolean | undefined;
    /**
     * @description Validates an array of items against the currently active schema
     *
     * @param data An array of items to validate
     */
    validateList(data: T[]): boolean;
    private constructSchema;
    private quickSchemaValidation;
    private deepSchemaValidation;
    private getDataType;
    /**
     * @description Get the currently active schema of this validator instance
     */
    getSchema(): Schema;
}
export {};
