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

  constructor(original: T) {
    this.original = original;
    this.schema = this.constructSchema(original);
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
