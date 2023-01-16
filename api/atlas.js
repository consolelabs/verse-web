/* eslint-disable no-undef */
import { Buffer } from "node:buffer";
import fetch from "isomorphic-unfetch";

export default async function handler(req, res) {
  const id = req.query.id;
  const spine = req.query.spine;

  const atlasRes = await fetch(
    `${process.env.VITE_CHARACTER_ASSET_PATH}/${spine}/Web/${
      spine === "TV-head" ? "" : `${id}/`
    }${spine}.atlas`
  );

  if (atlasRes.ok) {
    let text = await atlasRes.text();
    text = text.replace(`${spine}.png`, `${spine}/${id}.png`);
    const buffer = Buffer.from(text);

    return res.status(200).end(buffer);
  } else {
    return res.status(404).end();
  }
}
