export type CoberturaLineAttributes = {
  number: string;
  hits: string;
  branch?: string;
  'condition-coverage'?: string;
};

export type CoberturaLine = { $: CoberturaLineAttributes };

export type CoberturaMethod = {
  $: { name: string };
  lines: [{ line: CoberturaLine[] }];
};

export type CoberturaClass = {
  $: { name: string; filename: string };
  methods?: [{ method: CoberturaMethod[] }];
  lines?: [{ line: CoberturaLine[] }];
};

export type CoberturaPackage = {
  classes: [{ class: CoberturaClass[] }];
};

export type CoberturaPackages = {
  package: CoberturaPackage[];
};

export type CoberturaXml = {
  coverage: {
    $: {
      'lines-valid': string;
      'lines-covered': string;
      'branches-valid': string;
      'branches-covered': string;
    };
    sources: [{ source: string[] }];
    packages: CoberturaPackages[];
  };
};
