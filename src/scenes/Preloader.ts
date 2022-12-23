import Phaser from "phaser";
import { buildings } from "../objects/Building";

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }

  preload() {
    this.load.tilemapTiledJSON("map", "tiles/map.json");
    this.load.image("floor", "tiles/floor.png");

    // this.load.image("airport", "tiles/buildings/airport/airport.png");
    // this.load.json(
    //   "airport-shapes",
    //   "tiles/buildings/airport/airport-shapes.json"
    // );

    buildings.forEach((building) => {
      // Load the part that are defined in Tiled
      this.load.image(
        `${building.key}-tiled`,
        `tiles/buildings/${building.key}/tiled/${building.key}-tiled.png`
      );

      // Load the part that should be rendered as (animated) sprites
      building.sprites.forEach((sprite) => {
        const combinedKey = `${building.key}-${sprite.key}`;
        const path = `tiles/buildings/${building.key}/sprites/${combinedKey}`;

        if (sprite.count) {
          this.load.multiatlas(
            `${combinedKey}-sprite`,
            `${path}/${combinedKey}-sprite.json`,
            path
          );
        } else {
          this.load.atlas(
            `${combinedKey}-sprite`,
            `${path}/${combinedKey}-sprite.png`,
            `${path}/${combinedKey}-sprite.json`
          );
        }
      });
    });
  }

  create() {
    this.scene.start("game");
  }
}
