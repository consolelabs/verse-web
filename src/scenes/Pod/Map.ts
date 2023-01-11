import Phaser from "phaser";
import { Player } from "../../characters/player";
import { PROD, TILE_SIZE } from "../../constants";
import { SceneKey } from "../../constants/scenes";
import { IBound } from "matter";
import { PodPlacedItem } from "objects/PodPlacedItem";

// 64 tiles * tile size
const WORLD_WIDTH = 64 * TILE_SIZE;
const WORLD_HEIGHT = 64 * TILE_SIZE;

export interface PodItem {
  key: string;
  object: Phaser.GameObjects.Image;
}

export default class PodMap extends Phaser.Scene {
  private player!: Player;
  public bounds!: IBound;

  // Build-mode related props
  public mode: "normal" | "build" = "normal";
  private placedItems: PodPlacedItem[] = [];
  public itemToPlace?: PodItem;

  // Mock
  floorKey?: string;
  floorSprite?: Phaser.GameObjects.TileSprite;
  wallKey?: string;
  wallSprite?: Phaser.GameObjects.TileSprite;
  onPlacingItem?: (item: PodItem) => void;

  init(params: Record<string, any>) {
    this.wallKey = params.wallKey;
    this.floorKey = params.floorKey;
  }

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
    });
  }

  preload() {
    this.player = new Player(this);

    // Load some mock floors texture for the builder mode
    ["1", "2", "3"].forEach((key) => {
      // Do nothing if texture was already loaded
      if (this.textures.exists(key)) {
        return;
      }

      this.load.image(`floor-${key}`, `/tiles/pod/floors/${key}.png`);
    });

    // Load some mock walls texture for the builder mode
    ["1", "2", "3"].forEach((key) => {
      // Do nothing if texture was already loaded
      if (this.textures.exists(key)) {
        return;
      }

      this.load.image(`wall-${key}`, `/tiles/pod/walls/${key}.png`);
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

    // Load characters
    this.player.loadCharacters(["tv-head", "fukuro", "ghost-neko"], {
      x: 500,
      y: 500,
      scale: 0.4,
    });

    // Follow the first character
    this.cameras.main.startFollow(
      this.player.characters[0].instance,
      true,
      0.05,
      0.05
    );

    // Set world bounds

    this.bounds = {
      min: { x: 0, y: 0 },
      max: { x: WORLD_WIDTH, y: WORLD_HEIGHT },
    };
    this.matter.world.setBounds(
      this.bounds.min.x,
      this.bounds.min.y,
      this.bounds.max.x,
      this.bounds.max.y
    );

    this.loadFloor();
    this.loadWall();
  }

  loadFloor() {
    this.floorSprite?.destroy();

    // Generate floor texture
    this.floorSprite = this.add.tileSprite(
      0,
      0,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      this.floorKey || ""
    );
    this.floorSprite.setOrigin(0, 0);
    this.floorSprite.setTileScale(0.5, 0.5);
  }

  loadWall() {
    this.wallSprite?.destroy();

    // Generate wall texture
    this.wallSprite = this.add.tileSprite(
      0,
      0,
      WORLD_WIDTH,
      // This is the wall texture's height
      // TODO: Get this from API
      196,
      this.wallKey || ""
    );
    this.wallSprite.setOrigin(0, 1);
    this.wallSprite.setTileScale(0.75, 0.75);
  }

  setFloor(key: string) {
    this.floorKey = key;
    this.loadFloor();
  }

  setWall(key: string) {
    this.wallKey = key;
    this.loadWall();
  }

  toggleBuildMode() {
    if (this.mode === "normal") {
      this.player.setActive(false);
      this.player.characters.forEach((char) => char.hide());
      this.mode = "build";

      const camera = this.cameras.main;

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
      this.itemToPlace?.object.destroy();
      this.player.setActive(true);
      this.player.characters.forEach((char) => char.show());
      this.mode = "normal";

      this.input.off("pointermove");
      this.cameras.main.startFollow(
        this.player.characters[0].instance,
        true,
        0.05,
        0.05
      );
    }
  }

  setItemToPlace(key?: string, callback?: () => void) {
    // Destroy previous itemToPlace if it exists
    if (this.itemToPlace) {
      this.itemToPlace.object.destroy();
      this.itemToPlace = undefined;
    }

    if (!key) {
      return;
    }

    const object = this.add.image(0, 0, key);
    object.setAlpha(0.5);

    this.itemToPlace = {
      key,
      object,
    };

    // Add an event listener to wait for click to place item
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
            item.instance.body.bounds,
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
      this.placeItem();
      callback && callback();

      // Remove the event listener
      this.input.off("pointerup");
    });
  }

  setItemToEdit(id: number) {
    this.placedItems.find((i) => i.id === id)?.startEditing();

    this.placedItems.forEach((item) => {
      if (id !== item.id) {
        item.stopEditing();
      }
    });
  }

  placeItem() {
    if (!this.itemToPlace) {
      return;
    }

    const itemId = Date.now();

    // Reset alpha & add world body for this item to make sure it's interactive
    const placedItem = new PodPlacedItem({
      key: this.itemToPlace.key,
      id: itemId,
      scene: this,
      object: this.itemToPlace.object,
      onClick: () => this.setItemToEdit(itemId),
      onRemove: () => this.removeItem(itemId),
      onMove: () => this.moveItem(itemId),
    });

    // Callback
    this.onPlacingItem?.(this.itemToPlace);

    // Save it to the array
    this.placedItems.push(placedItem);

    // Reset the itemToPlace object
    this.itemToPlace = undefined;
  }

  removeItem(id: number) {
    const itemToRemove = this.placedItems.find((i) => i.id === id);
    this.placedItems = this.placedItems.filter((i) => i.id !== id);

    // Destroy the item
    // TODO: An API call to update the inventory
    itemToRemove?.destroy();
  }

  moveItem(id: number) {
    const itemToMove = this.placedItems.find((i) => i.id === id);
    this.placedItems = this.placedItems.filter((i) => i.id !== id);

    if (itemToMove) {
      itemToMove.destroy();
      this.setItemToPlace(itemToMove.key);
    }
  }

  update() {
    if (!this.player) {
      return;
    }

    if (this.mode !== "build") {
      this.player.update();
    } else {
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
  }
}
