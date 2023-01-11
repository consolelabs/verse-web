import Phaser from "phaser";
import { SceneKey } from "../constants/scenes";

export default class CharSelect extends Phaser.Scene {
  constructor() {
    super({
      key: SceneKey.CHAR_SELECT,
    });
  }

  // preload() {}

  // create() {}
}
