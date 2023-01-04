import Phaser from "phaser";
import { Player } from "../characters/player";
import { CDN_PATH, PROD, TILE_SIZE } from "../constants";
import Stats from "stats.js";
import { PodHUD } from "../objects/hud/PodHUD";

// FPS Counter
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

// Debug text
let text: any;

export default class PodScene extends Phaser.Scene {
  private player!: Player;
  private map!: Phaser.Tilemaps.Tilemap;
  private mode: "normal" | "builder" = "normal";

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
  }

  create() {
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

      this.input.on("pointermove", (p: any) => {
        if (!p.isDown) return;

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
      text.setText(
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
