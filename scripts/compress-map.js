import { stringify } from "zipson";
import { readFile, writeFile } from "fs/promises";
import p from "path";

console.log("Begin compressing maps");
readFile(new URL("../public/config.json", import.meta.url)).then((content) => {
  const config = JSON.parse(content);

  Object.values(config.maps).forEach((mapConfig) => {
    readFile(p.join("./public", mapConfig.raw), { encoding: "utf8" }).then(
      (jsonString) => {
        const json = JSON.parse(jsonString);
        writeFile(p.join("./public", mapConfig.compress), stringify(json));
        console.log(
          `Done compress map ${mapConfig.raw} -> ${mapConfig.compress}`
        );
      }
    );
  });
});
