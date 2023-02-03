/* eslint-disable no-undef */
import sharp from "sharp";
import fetch from "isomorphic-unfetch";

export default async function handler(req, res) {
  const id = req.query.id;
  const collection = req.query.collection;

  const image = await fetch(
    `${process.env.VITE_TV_HEAD_IMAGE_PATH}/${collection}/${id}`
  );
  const uintArray = new Uint8Array(await image.arrayBuffer());
  if (image.ok) {
    const buffer = await sharp(uintArray)
      .resize(140, 140, {
        fit: "contain",
        background: {
          r: 0,
          b: 0,
          g: 0,
          alpha: 0,
        },
      })
      .webp()
      .toBuffer();

    return res.status(200).end(buffer);
  } else {
    return res.status(404).end();
  }
}