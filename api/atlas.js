/* eslint-disable no-undef */
import { Buffer } from "node:buffer";
import fetch from "isomorphic-unfetch";
import path from "path";
import { readFileSync } from "fs";

export default async function handler(req, res) {
  const id = req.query.id;
  const spine = req.query.spine;
  const collection = req.query.collection;
  let text = "";
  if (spine !== "TV-head") {
    const url = `${process.env.VITE_CHARACTER_ASSET_PATH}/${spine}/Web/${id}/${spine}.atlas`;

    const atlasRes = await fetch(url);

    if (!atlasRes.ok) return res.status(404).end();

    text = await atlasRes.text();
  } else {
    text = readFileSync(
      path.join(process.cwd(), "public", "characters", "tv-head", "char.atlas"),
      "utf8"
    );
  }

  text = text.replace(`${spine}.png`, `${spine}/${collection}/${id}.png`);
  const buffer = Buffer.from(text);

  return res.status(200).end(buffer);
}
