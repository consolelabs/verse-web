import Phaser from "phaser";
import { Player } from "../../characters/player";
import { CDN_PATH, PROD, TILE_SIZE } from "../../constants";
import Stats from "stats.js";
import { Item } from "./HUD";
import { SceneKey } from "../../constants/scenes";
import { IBound } from "matter";

// FPS Counter
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

// Debug text
let text: any;

interface PodItem {
  data: Item;
  object: Phaser.GameObjects.Image;
}

export default class PodMap extends Phaser.Scene {
  private player!: Player;
  private map!: Phaser.Tilemaps.Tilemap;
  public bounds!: IBound;

  // Build-mode related props
  public mode: "normal" | "build" = "normal";
  public itemToPlace?: PodItem;
  private placedItems: PodItem[] = [];

  constructor() {
    super({
      key: SceneKey.POD,
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
    // Fade in
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Load HUD
    const hudScene = this.scene.get(SceneKey.POD_HUD);
    // @ts-ignore
    hudScene.mainScene = this;
    this.scene.launch(hudScene);

    // Load tilesets & map layers
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

    // Set world bounds
    this.bounds = {
      min: { x: 0, y: 0 },
      max: { x: this.map.widthInPixels, y: this.map.heightInPixels },
    };
    this.matter.world.setBounds(
      this.bounds.min.x,
      this.bounds.min.y,
      this.bounds.max.x,
      this.bounds.max.y
    );
  }

  toggleBuildMode() {
    if (this.mode === "normal") {
      this.player.setActive(false);
      this.player.characters.forEach((char) =>
        char.instance.setActive(false).setVisible(false)
      );
      this.mode = "build";

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
        // TODO: Move the region checking logic into an util
        if (
          !p.isDown ||
          [
            // For example, the left HUD region has these bounds
            {
              max: { x: 500, y: window.innerHeight },
              min: { x: 0, y: window.innerHeight - 100 },
            },
          ].some((bounds) =>
            this.matter.bounds.contains(bounds, { x: p.x, y: p.y })
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

  setItemToUpdate() {
    console.log("Hi");
  }

  setItemToPlace(item: Item) {
    const object = this.add.image(0, 0, item.key);
    object.setAlpha(0.5);

    // Destroy previous itemToPlace if it exists
    if (this.itemToPlace) {
      this.itemToPlace.object.destroy();
      this.itemToPlace = undefined;
    }

    this.itemToPlace = {
      data: item,
      object,
    };

    this.input.on("pointerup", (p: Phaser.Input.Pointer) => {
      if (!this.itemToPlace) {
        return;
      }

      // Check if user is clicking onto a valid point
      // First, check if the point is within world bounds
      if (
        !this.matter.bounds.contains(this.bounds, { x: p.worldX, y: p.worldY })
      ) {
        return;
      }

      // Second, check if the point is not within the area of any other items
      if (
        this.placedItems.some((item) => {
          return this.matter.bounds.contains(
            // @ts-ignore, prop exists but the type is not correctly mapped
            item.object.body.bounds,
            {
              x: p.worldX,
              y: p.worldY,
            }
          );
        })
      ) {
        return;
      }

      // If it's valid, we should place the item there

      // Reset alpha & add world body for this item to make sure it's interactive
      this.matter.add.gameObject(this.itemToPlace.object, { isStatic: true });
      this.itemToPlace.object.setAlpha(1);

      // Save it to the array
      this.placedItems.push(this.itemToPlace);
      console.log(this.placedItems);

      // Reset the itemToPlace object
      this.itemToPlace = undefined;
      this.input.off("pointerup");
    });
  }

  update() {
    stats.begin();

    if (!this.player) {
      return;
    }

    if (this.mode !== "build") {
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

      // Move itemToPlace along with the pointer
      if (this.itemToPlace) {
        // Snap to grid?
        const x =
          this.input.activePointer.worldX -
          (this.input.activePointer.worldX % TILE_SIZE);
        const y =
          this.input.activePointer.worldY -
          (this.input.activePointer.worldY % TILE_SIZE);

        this.itemToPlace.object.x = x;
        this.itemToPlace.object.y = y;
        this.itemToPlace.object.setDepth(
          (y + this.itemToPlace.object.height / 2) / TILE_SIZE
        );
      }
    }

    stats.end();
  }
}
