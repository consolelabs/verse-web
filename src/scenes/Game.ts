import Phaser from "phaser";
import { Player } from "../characters/player";
import { Building, buildings } from "../objects/Building";
// import { Building } from "../objects/Building";

export default class Game extends Phaser.Scene {
  private player!: Player;
  private sprites: any[] = [];

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

  preload() {
    this.player = new Player("neko", this);
  }

  create() {
    const map = this.make.tilemap({
      key: "map",
      tileWidth: 16,
      tileHeight: 16,
    });

    const floorTileset = map.addTilesetImage("floor", "floor");
    map.createLayer("Ground", floorTileset, 0, 0);

    const player = this.player.spawn({
      x: 200,
      y: 200,
      scale: 0.3,
    });
    this.matter.add.gameObject(player);
    player.setFixedRotation(0);
    this.cameras.main.startFollow(player, true);

    // const airportTileset = map.addTilesetImage("airport", "airport");
    // const buildingsLayer = map.createLayer("Buildings", airportTileset, 0, 0);
    // this.matter.world.convertTilemapLayer(map.objects);

    // const shapes = this.cache.json.get("airport-shapes");
    // const object = this.matter.add.sprite(500, 500, "airport", "airport", {
    //   // @ts-ignore
    //   shape: shapes.airport,
    //   isStatic: true,
    // });
    // object.setDepth(object.y);
    // this.buildings.push(object);

    player.body.position.y = player.body.position.y * 1.15;

    // Test Buildings
    const buildingTilesets: Phaser.Tilemaps.Tileset[] = [];
    buildings.forEach((building) => {
      const object = new Building({ game: this, map, ...building });
      buildingTilesets.push(...object.tilesets);
      this.sprites.push(...object.sprites);
    });

    map.createLayer(`Buildings - Floor`, buildingTilesets, 0, 0);
  }

  update() {
    if (!this.player) {
      return;
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
