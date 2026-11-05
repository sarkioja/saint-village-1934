// Tipos para o módulo .mjs compartilhado entre o app, os scripts e os testes.

export type Query = (text: string, params?: unknown[]) => Promise<any[]>;

export type Tabela = { nome: string; cols: string[] };
export declare const TABELAS: Tabela[];
export declare const VERSAO: number;

export type Dump = {
  versao: number;
  exportadoEm: string;
  tabelas: Record<string, Array<Record<string, unknown>>>;
};

export declare function exportar(query: Query): Promise<Dump>;
export declare function importar(query: Query, dados: unknown): Promise<Record<string, number>>;
