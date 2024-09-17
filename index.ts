import { controller } from "./controllers/controller";
import { readdir } from "node:fs/promises";

const PAGES_DIR = "./test-pages";
const LIB_DIR = "./lib";

const pagesFiles = await readdir(PAGES_DIR);
const libFiles = await readdir(LIB_DIR);

const pagesToBundle = pagesFiles.map((f) => PAGES_DIR + "/" + f);
const libToBundle = libFiles.map((f) => LIB_DIR + "/" + f).filter((f) => !f.endsWith(".test.ts"));

const buildResult = await Bun.build({
  entrypoints: [...libToBundle, ...pagesToBundle],
  outdir: "./public",
});
console.log("Build result: ");
console.log(buildResult);

const htmlHeaders = new Headers();
htmlHeaders.set("Content-Type", "text/html");

Bun.serve({
  port: 3000,
  fetch(request) {
    const { method, url } = request;
    const { pathname } = new URL(url);
    console.log(pathname, method);
    if (pathname === "/index.js") {
      const file = Bun.file("./public/client-lib/index.js");
      return new Response(file);
    }
    if (pathname === "/public/test-pages/ui-test.js") {
      const file = Bun.file("./public/test-pages/ui-test.js");
      return new Response(file);
    }
    return controller.get(request);
  },
});
