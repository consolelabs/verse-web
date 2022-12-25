import Phaser from "phaser";
import { Player } from "../characters/player";
import { Building, buildings } from "../objects/Building";
// import { Building } from "../objects/Building";

export default class Game extends Phaser.Scene {
  private player!: Player;
  private sprites: any[] = [];
  private keys!: any;

  constructor() {
    super({
      key: "game",
      physics: {
        matter: {
          debug: true,
          gravity: { y: 0 },
          // @ts-ignore
          debugShowBody: true,
          debugBodyColor: 0x0000ff,
        },
      },
    });
  }

  spawnPlayer(character?: string) {
    const player = this.player.spawn({
      x: 200,
      y: 200,
      scale: 0.3,
      character,
    });

    this.matter.add.gameObject(player);

    player.setFixedRotation(0);
    this.cameras.main.startFollow(player, true);
  }

  preload() {
    this.player = new Player(this);
    this.keys = this.input.keyboard.addKeys("H,J,K,L");
  }

  create() {
    const map = this.make.tilemap({
      key: "map",
      tileWidth: 16,
      tileHeight: 16,
    });

    const floorTileset = map.addTilesetImage("floor", "floor");
    map.createLayer("Ground", floorTileset, 0, 0);

    this.spawnPlayer();

    // Buildings
    const buildingTilesets: Phaser.Tilemaps.Tileset[] = [];
    buildings.forEach((building) => {
      const object = new Building({ game: this, map, ...building });
      buildingTilesets.push(...object.tilesets);
      this.sprites.push(...object.sprites);
    });

    const floorLayer = map.createLayer(
      `Buildings - Floor`,
      buildingTilesets,
      0,
      0
    );
    map.createLayer(`Buildings - Ground`, buildingTilesets, 0, 0);

    floorLayer.setCollisionByProperty({ collides: true });
    this.matter.world.convertTilemapLayer(floorLayer);
  }

  update() {
    if (!this.player) {
      return;
    }

    if (this.keys.H.isDown) {
      this.spawnPlayer("neko");
    } else if (this.keys.J.isDown) {
      this.spawnPlayer("fukuro");
    } else if (this.keys.K.isDown) {
      this.spawnPlayer("ghost-neko");
    } else if (this.keys.L.isDown) {
      this.spawnPlayer("tv-head");
    }

    // Check player vs buildings overlap
    // FIXME: Should have some preliminary check to avoid performance struggle. We don't want
    // to check for overlap every round of render, on every building
    this.sprites.forEach((sprite) => {
      // https://phaser.discourse.group/t/check-collision-overlap-between-sprites-without-physics/6696/4
      const playerBounds = new Phaser.Geom.Rectangle(
        this.player.instance.x,
        this.player.instance.y,
        this.player.instance.width,
        this.player.instance.height
      );

      try {
        const spriteBounds = sprite.getBounds();
        if (
          Phaser.Geom.Intersects.RectangleToRectangle(
            playerBounds,
            spriteBounds
          )
        ) {
          sprite.setAlpha(0.5);
        } else {
          sprite.setAlpha(1);
        }
      } catch {
        // Do nothing
      }
    });

    this.player.update();
  }
}
