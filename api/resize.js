/* this api is used to resize the image that will be used in TV-Head's screen */
/* eslint-disable no-undef */
import sharp from "sharp";
import fetch from "isomorphic-unfetch";

export default async function handler(req, res) {
  const textureURL = decodeURI(req.query.textureURL);

  const image = await fetch(
    textureURL
    // `${process.env.VITE_TV_HEAD_IMAGE_PATH}/${collection}/${id}`
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
