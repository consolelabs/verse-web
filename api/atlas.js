/* this api is used to rewrite the first line of the atlas file to be scoped to spine/collection/id */
/* eslint-disable no-undef */
import { Buffer } from "node:buffer";
import fetch from "isomorphic-unfetch";
import path from "path";
import { readFileSync } from "fs";

export default async function handler(req, res) {
  const atlasURL = decodeURI(req.query.atlasURL);
  const spine = req.query.spine;
  const id = req.query.id;
  const collection = req.query.collection;
  let text = "";
  if (spine !== "TV-head") {
    // const url = `${process.env.VITE_CHARACTER_ASSET_PATH}/${spine}/Web/${id}/${spine}.atlas`;

    const atlasRes = await fetch(atlasURL);

    if (!atlasRes.ok) return res.status(404).end();

    text = await atlasRes.text();
  } else {
    text = readFileSync(
      path.join(process.cwd(), "public", "characters", "tv-head", "char.atlas"),
      "utf8"
    );
  }

  // rewrite
  text = text.replace(`${spine}.png`, `${spine}/${collection}/${id}.png`);
  const buffer = Buffer.from(text);

  return res.status(200).end(buffer);
}
