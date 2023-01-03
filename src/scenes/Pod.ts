import Phaser from "phaser";
import { Player } from "../characters/player";
import { CDN_PATH, PROD, TILE_SIZE } from "../constants";
import Stats from "stats.js";
import { PodHUD } from "../objects/hud/PodHUD";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";

// FPS Counter
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

// Debug text
let text: any;

export default class PodScene extends Phaser.Scene {
  private player!: Player;
  private map!: Phaser.Tilemaps.Tilemap;
  public mode: "normal" | "builder" = "normal";
  public rexUI!: RexUIPlugin;

  constructor() {
    super({
      key: "pod",
      physics: {
        matter: {
          gravity: { y: 0 },
          debug: !PROD,
          // @ts-ignore
          debugShowBody: true,
          debugBodyColor: 0x0000ff,
        },
      },
      loader: {
        baseURL: CDN_PATH,
      },
    });
  }

  preload() {
    this.player = new Player(this);

    // Now load assets
    const tilesetSource = Object.fromEntries(
      this.cache.tilemap
        .get("pod")
        ?.data.tilesets.map((ts: any) => [ts.name, ts.image]) ?? []
    );

    this.map = this.make.tilemap({
      key: "pod",
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    const { tilesets = [] } = this.map;

    // Load tilesets
    tilesets.forEach((tileset) => {
      // Do nothing if texture was already loaded
      if (this.textures.exists(tileset.name)) {
        return;
      }

      this.load.image(tileset.name, `/tiles/${tilesetSource[tileset.name]}`);
    });

    // Load some mock exterior items for the builder mode
    [
      "bench-1",
      "bench-2",
      "bench-3",
      "plant-1",
      "plant-2",
      "street-light",
      "trash-bin",
      "vending-machine",
      "ice-cream-cart",
      "flower-bed",
    ].forEach((key) => {
      // Do nothing if texture was already loaded
      if (this.textures.exists(key)) {
        return;
      }

      this.load.atlas(
        key,
        `/tiles/exterior/sprites/${key}/${key}.png`,
        `/tiles/exterior/sprites/${key}/${key}.json`
      );
    });
  }

  create() {
    this.scene.pause("interaction");
    // Fade in
    this.cameras.main.fadeIn(500, 0, 0, 0);

    const { layers = [], tilesets = [] } = this.map;

    // Add loaded tilesets to the map
    tilesets.forEach((tileset) => this.map.addTilesetImage(tileset.name));

    // Loop through the layers & create them (& the sprites they refer to)
    layers.forEach((layer) => {
      const tilesets =
        // @ts-ignore
        layer.properties.find((p) => p.name === "tilesets")?.value ?? "";

      this.map.createLayer(layer.name, tilesets.split(","), 0, 0);
    });

    // Load characters

    this.player.loadCharacters(["tv-head", "neko", "fukuro", "ghost-neko"], {
      x: 500,
      y: 500,
      scale: 0.4,
    });

    // Load HUD
    new PodHUD(this);
  }

  toggleBuildMode() {
    if (this.mode === "normal") {
      this.player.setActive(false);
      this.player.characters.forEach((char) =>
        char.instance.setActive(false).setVisible(false)
      );
      this.mode = "builder";

      const camera = this.cameras.main;
      text = this.add
        .text(window.innerWidth - 200, 0, "", {
          font: "16px monospace",
          color: "#00ffff",
          backgroundColor: "#000c",
          fixedWidth: 200,
          fixedHeight: 300,
        })
        .setScale(1 / camera.zoom)
        .setScrollFactor(0);

      this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
        // We do nothing if:
        // 1. Pointer is not down
        // 2. Pointer is over certain regions (e.g. HUD)
        // FIXME: Move the region checking logic into an util
        if (
          !p.isDown ||
          [
            // For example, the left HUD region has these bounds
            {
              max: { x: 500, y: window.innerHeight },
              min: { x: 0, y: window.innerHeight - 100 },
            },
          ].some(
            (bounds) =>
              p.x > bounds.min.x &&
              p.y > bounds.min.y &&
              p.x < bounds.max.x &&
              p.y < bounds.max.y
          )
        ) {
          return;
        }

        camera.scrollX -= (p.x - p.prevPosition.x) / camera.zoom;
        camera.scrollY -= (p.y - p.prevPosition.y) / camera.zoom;
      });

      camera.stopFollow();
    } else {
      this.player.setActive(true);
      this.player.characters.forEach((char) =>
        char.instance.setActive(true).setVisible(true)
      );
      this.mode = "normal";

      // Clean up debug stuff
      this.input.off("pointermove");
      text.destroy();
      this.cameras.main.startFollow(
        this.player.characters[0].instance,
        true,
        0.1,
        0.1
      );
    }
  }

  update() {
    stats.begin();

    if (!this.player) {
      return;
    }

    if (this.mode !== "builder") {
      this.player.update();
    } else {
      text?.setText(
        JSON.stringify(
          this.input.activePointer,
          [
            "isDown",
            "downX",
            "downY",
            "worldX",
            "worldY",
            "x",
            "y",
            "position",
            "prevPosition",
          ],
          2
        )
      );
    }

    stats.end();
  }
}
