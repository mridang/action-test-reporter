export type CloverMetricsAttributes = {
  statements: string;
  coveredstatements: string;
  conditionals: string;
  coveredconditionals: string;
  methods: string;
  coveredmethods: string;
};

export type CloverLineAttributes = {
  num: string;
  count: string;
};

export type CloverLine = { $: CloverLineAttributes };

export type CloverFile = {
  $: { name: string };
  metrics: [{ $: CloverMetricsAttributes }];
  line?: CloverLine[];
};

export type CloverPackage = {
  file?: CloverFile[];
};

export type CloverProject = {
  metrics: [{ $: CloverMetricsAttributes }];
  package?: CloverPackage[];
  file?: CloverFile[];
};

export type CloverXml = {
  coverage: {
    project: [CloverProject];
  };
};
