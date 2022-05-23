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
  private schema: Schema;
  private method: ValidationMethod;

  constructor(original: T, method?: ValidationMethod) {
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

  private constructSchema(original: T | T[], level: number = 0): Schema {
    const dataType = this.getDataType(original);

    const constructObjectSchema = (original: T) => {
      const localType = (() => {
        // Overwrite array type if the first item to be passed in is an array
        const isArrayOnFirstLevel = dataType === 'array' && level === 0;
        if (isArrayOnFirstLevel) {
          return 'object';
        }
        return dataType;
      })();
      const schema: Schema = {
        type: localType,
        properties: {},
      };
      Object.keys(original).forEach((key: string) => {
        (schema.properties as any)[key] = this.constructSchema(
          (original as any)[key],
          level + 1,
        );
      });
      return schema;
    };
    const constructArraySchema = (original: T[]) => {
      return constructObjectSchema(original[0]);
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
