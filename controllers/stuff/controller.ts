import { templater } from "../../lib/templater";

const htmlHeaders = new Headers();

htmlHeaders.set("Content-Type", "text/html");

export const controller = {
  get: async (request: Request) => {
    return new Response("", { headers: htmlHeaders });
  },
};
