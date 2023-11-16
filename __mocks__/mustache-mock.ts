import fs from "fs";
import url from "url";

const rawContent = fs.readFileSync(
  url.fileURLToPath(
    new url.URL("../src/indexHtml.mustache", import.meta.url).href
  ),
  "utf-8"
);

export default rawContent;
