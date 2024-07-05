export interface FieldConfiguration {
  ignore: readonly string[];
  select: boolean;
  name?: string;
  type?: string;
  filterType?: string;
}

export interface ModelConfiguration {
  ignore: boolean;
  interfaces: readonly string[];
  fields: Record<string, FieldConfiguration>;
}

export type DocumentConfiguration = Record<string, ModelConfiguration>;
