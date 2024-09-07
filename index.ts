import { readdir } from "node:fs/promises";

const PAGES_DIR = "./pages";
const CONTROLLER_DIR = "./controllers";

const pagesFiles = await readdir(PAGES_DIR);
const controllerPaths = await readdir(CONTROLLER_DIR, { recursive: true });
const controllerFiles = controllerPaths.filter((f) => f.endsWith("controller.ts"));

const pagesToBundle = pagesFiles.map((f) => PAGES_DIR + "/" + f);

const x = await Bun.build({
  entrypoints: [...pagesToBundle],
  outdir: "./public",
});
console.log("Build result: ");
console.log(x);

const urlControllerMap: { [key: string]: Controller } = {};
for (const controllerFile of controllerFiles) {
  const { controller } = await import(CONTROLLER_DIR + "/" + controllerFile);
  if (!controller) {
    throw new Error("Controller not found in " + controllerFile);
  }
  const url = "/" + controllerFile.replace("controller.ts", "").slice(0, -1);
  urlControllerMap[url] = controller;
}

const htmlHeaders = new Headers();
htmlHeaders.set("Content-Type", "text/html");

export type Controller = { [key: string]: Function };

const server = Bun.serve({
  port: 3000,
  fetch(request) {
    const { method, url } = request;
    const { pathname, searchParams } = new URL(url);
    console.log(pathname, method);
    if (pathname === "/index.js") {
      const file = Bun.file("./public/client-lib/index.js");
      return new Response(file);
    }
    if (pathname === "/public/pages/hello.js") {
      const file = Bun.file("./public/pages/hello.js");
      return new Response(file);
    }
    for (const [path, controller] of Object.entries(urlControllerMap)) {
      console.error(path, pathname);
      if (pathname === path) {
        const func = controller[method.toLowerCase()];
        console.error(path, controller);
        if (typeof func !== "function") {
          return new Response("405 Method Not Allowed", { status: 405 });
        } else {
          return func(request);
        }
      }
    }
    return new Response("404 Not Found", { status: 404 });
  },
});
