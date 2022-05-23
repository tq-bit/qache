type ValidSchemaType =
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

type ValidationMethod = 'quick' | 'deep';

export interface Schema {
  type: ValidSchemaType;
  properties?: {
    [key: string]: Schema;
  };
  items?: Schema[];
}

export default class Validator<T> {
  private original: T;
  private schema: Schema;
  private method: ValidationMethod;

  constructor(original: T, method?: ValidationMethod) {
    this.original = original;
    this.method = method || 'quick';
    this.schema = this.constructSchema(original);
  }

  public validate(data: T) {
    const localSchema = this.constructSchema(data);
    if (this.method === 'quick') {
      return this.quickSchemaValidation(this.schema, localSchema);
    }
  }

  public validateList(data: T[]) {
    return data.every((item: T) => {
      return this.validate(item);
    });
  }

  private constructSchema(original: T | T[]): Schema {
    const dataType = this.getDataType(original);

    const constructObjectSchema = (original: T) => {
      const schema: Schema = {
        type: dataType,
        properties: {},
      };
      Object.keys(original).forEach((key: string) => {
        (schema.properties as any)[key] = this.constructSchema(
          (original as any)[key],
        );
      });
      return schema;
    };
    const constructArraySchema = (original: T[]) => {
      const schema: Schema = {
        type: dataType,
        properties: {},
      };
      Object.keys(original[0]).forEach((key: string) => {
        (schema.properties as any)[key] = this.constructSchema(
          (original as any)[0][key],
        );
      });
      return schema;
    };

    if (dataType === 'object') {
      return constructObjectSchema(original as T);
    }

    if (dataType === 'array') {
      return constructArraySchema(original as T[]);
    }
    return {
      type: dataType,
    };
  }

  private quickSchemaValidation(schemaOne: Schema, schemaTwo: Schema) {
    return JSON.stringify(schemaOne) === JSON.stringify(schemaTwo);
  }

  private getDataType(original: T | T[]): ValidSchemaType {
    if (Array.isArray(original)) {
      return 'array';
    }
    return typeof original;
  }

  public getSchema() {
    return this.schema;
  }
}
