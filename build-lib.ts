await Bun.build({
  entrypoints: ["./lib/app.ts"],
  outdir: "./build",
});
