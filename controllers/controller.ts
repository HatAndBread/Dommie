import { templater } from "../lib/templater";
import { t } from "../public/pages/hello";

const htmlHeaders = new Headers();

htmlHeaders.set("Content-Type", "text/html");
export const controller = {
  get: async (request: Request) => {
    return new Response(t(templater()), { headers: htmlHeaders });
  },
};
