import Phaser from "phaser";
import { Player } from "../characters/player";
import { Building } from "../objects/Building";
import { buildings } from "./Preloader";

export default class Game extends Phaser.Scene {
  private player!: Player;
  private buildings: Building[] = [];

  constructor() {
    super("game");
  }

  preload() {
    this.player = new Player("neko", this);
  }

  create() {
    const map = this.make.tilemap({
      key: "map",
      tileWidth: 16,
      tileHeight: 16,
    });

    const blackTileset = map.addTilesetImage("BlackTile", "BlackTile");
    const fenceTileset = map.addTilesetImage("FenceCyber", "FenceCyber");

    map.createLayer("Ground", blackTileset, 0, 0);

    const wallsLayer = map.createLayer("Walls", fenceTileset, 0, 0);
    wallsLayer.setCollisionByProperty({ collides: true });

    const player = this.player.spawn({
      x: 200,
      y: 200,
      scale: 0.3,
    });
    this.physics.add.existing(player);
    this.physics.add.collider(player, wallsLayer);
    this.cameras.main.startFollow(player, true);

    // Test Building
    const buildingTilesets: Phaser.Tilemaps.Tileset[] = [];
    buildings.forEach((key) => {
      const building = new Building({ game: this, map, key });
      buildingTilesets.push(...building.staticTilesets);
      this.buildings.push(building);
    });
    // FIXME: 2 layer of buildings layer for now, 1 for the ground, 1 for stuff above the ground
    // (not including the animated building sprite)
    const buildingsLayer01 = map.createLayer(
      "Buildings - 0",
      buildingTilesets,
      0,
      0
    );
    const buildingsLayer02 = map.createLayer(
      "Buildings - 1",
      buildingTilesets,
      0,
      0
    );
    buildingsLayer01.setCollisionByProperty({ collides: true });
    buildingsLayer02.setCollisionByProperty({ collides: true });
    this.physics.add.collider(this.player.instance, [
      buildingsLayer01,
      buildingsLayer02,
    ]);
  }

  update() {
    if (!this.player) {
      return;
    }

    // Check player vs buildings overlap
    // FIXME: Should have some preliminary check to avoid performance struggle. We don't want
    // to check for overlap every round of render, on every building
    this.buildings.forEach((building) => {
      // https://phaser.discourse.group/t/check-collision-overlap-between-sprites-without-physics/6696/4
      const playerBounds = new Phaser.Geom.Rectangle(
        this.player.instance.body.x,
        this.player.instance.body.y,
        this.player.instance.body.width,
        this.player.instance.body.height
      );
      building.sprites.forEach((sprite) => {
        const spriteBounds = sprite.getBounds();

        if (
          Phaser.Geom.Intersects.RectangleToRectangle(
            playerBounds,
            spriteBounds
          )
        ) {
          sprite.alpha = 0.5;
        } else {
          sprite.alpha = 1;
        }
      });
    });

    this.player.update();
  }
}
