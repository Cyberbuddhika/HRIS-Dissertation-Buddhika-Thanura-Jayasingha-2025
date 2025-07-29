require("esbuild")
  .build({
    entryPoints: ["public/scripts/script.js"],
    bundle: true,
    outdir: "public/dist",
    minify: true,
    sourcemap: true,
  })
  .catch(() => process.exit(1));
