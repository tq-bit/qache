declare type ValidSchemaType = 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function' | 'array' | null;
declare type ValidationMethod = 'quick' | 'deep';
export interface Schema {
    type: ValidSchemaType;
    properties?: {
        [key: string]: Schema;
    };
    items?: Schema[];
}
export default class Validator<T> {
    private schema;
    private method;
    constructor(original: T, method?: ValidationMethod);
    validate(data: T): boolean | undefined;
    validateList(data: T[]): boolean;
    private constructSchema;
    private quickSchemaValidation;
    private getDataType;
    getSchema(): Schema;
}
export {};
