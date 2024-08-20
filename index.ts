import { readdir } from "node:fs/promises";
import { templater } from "./lib/templater";

const x = await Bun.build({
  entrypoints: ["./client/index.ts", "./pages/hello.ts"],
  outdir: "./public",
});
console.log("Done building!");
console.log(x);

const files = await readdir("./pages");
const paths = files
  .filter((f) => f.endsWith(".ts"))
  .map((f) => f.replace(".ts", ""));

const templates: { [key: string]: string } = {};

for (const path of paths) {
  console.log(path);
  const { init } = await import("./pages/" + path + ".ts");
  if (typeof init === "function" && !templates[path]) {
    templates[path] = init();
  }
  console.log(templates);
}

const htmlHeaders = new Headers();
htmlHeaders.set("Content-Type", "text/html");

const server = Bun.serve({
  port: 3000,
  fetch(request) {
    const url = new URL(request.url);
    const method = request.method;
    console.log(url.pathname, method);
    if (url.pathname === "/public/index.js") {
      const filePath = "." + new URL(request.url).pathname;
      const file = Bun.file(filePath);
      return new Response(file);
    }
    for (const path of paths) {
      if (url.pathname === `/${path}`) {
        return new Response(templates[path], { headers: htmlHeaders });
      }
    }
    return new Response("404 Not Found", { status: 404 });
  },
});

export type Template = ReturnType<typeof templater>;
