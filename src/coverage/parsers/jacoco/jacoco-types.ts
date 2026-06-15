export type JacocoCounter = {
  $: { type: string; missed: string; covered: string };
};

export type JacocoLine = {
  $: { nr: string; mi: string; ci: string; mb: string; cb: string };
};

export type JacocoSourceFile = {
  $: { name: string };
  line?: JacocoLine[];
  counter: JacocoCounter[];
};

export type JacocoPackage = {
  $: { name: string };
  sourcefile: JacocoSourceFile[];
};

export type JacocoReport = {
  report: { package: JacocoPackage[]; counter: JacocoCounter[] };
};
