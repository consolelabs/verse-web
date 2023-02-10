import Phaser from "phaser";
import { Player } from "../../characters/player";
import { PROD } from "../../constants";
import { SceneKey } from "../../constants/scenes";
import { IBound } from "matter";
import { PodPlacedItem } from "objects/PodPlacedItem";
import { useGameState } from "stores/game";
import { initWallAndFloorSprites, PodWall } from "objects/Pod/PodWall";
import { getMockFloorData, getMockWallData } from "./mockData";
import { initGroundSprites } from "objects/Pod/PodFloor/utils";
import { PodFloor } from "objects/Pod/PodFloor";

export const POD_TILE_SIZE = 64;
export const WORLD_SIZE = 16;
const WORLD_WIDTH = WORLD_SIZE * POD_TILE_SIZE;
const WORLD_HEIGHT = WORLD_SIZE * POD_TILE_SIZE;

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
  public spatialMap!: Phaser.GameObjects.RenderTexture[][][];
  public wallSprites: Record<string, Phaser.GameObjects.Group | undefined> = {};
  public floorSprites: Record<string, Phaser.GameObjects.Group | undefined> =
    {};

  public floorTexture!: Phaser.GameObjects.RenderTexture;

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

    /**
     * Test
     */

    // Load cyber walls
    [
      "bottom-mid",
      "corner-bottom-left",
      "corner-bottom-right",
      "corner-top-left",
      "corner-top-right",
      "left-bottom",
      "left-mid",
      "left-top",
      "right-bottom",
      "right-mid",
      "right-top",
      "top-mid",
      "wall",
    ].forEach((key) => {
      const finalKey = `cyber/${key}`;

      // Do nothing if texture was already loaded
      if (this.textures.exists(finalKey)) {
        return;
      }

      this.load.image(finalKey, `/tiles/pod/walls/cyber/${key}.png`);
    });

    // Load cyber floor
    ["ground"].forEach((key) => {
      const finalKey = `cyber/${key}`;
      this.load.image(finalKey, `/tiles/pod/floors/cyber/${key}.png`);
    });
  }

  create() {
    // Fade in
    this.cameras.main.fadeIn(500);

    // Load characters
    const { players, previewChar } = useGameState.getState();
    let player = players[0];
    if (!player) {
      player = previewChar;
    }
    if (player) {
      this.player = new Player({
        scene: this,
        spine: player.type,
        id: player.token_id,
        spineConfig: {
          x: 200,
          y: 200,
          scale: 0.4,
        },
        animSuffix: player.animSuffix,
        collection: player.token_address,
        urls: player.urls,
      });

      this.player.character?.loadPromise.then((instance) => {
        this.matter.add.gameObject(instance);
        instance.setFixedRotation();

        // Follow the first character
        this.cameras.main.startFollow(instance, true, 0.05, 0.05);
      });
    }

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

    /**
     * Test
     */

    this.spatialMap = new Array(WORLD_SIZE).fill(0).map(() => {
      return new Array(WORLD_SIZE).fill(0).map(() => new Array(0));
    });

    // Load floors
    const mockFloorData = getMockFloorData(WORLD_SIZE);
    this.floorTexture = this.add.renderTexture(
      0,
      0,
      WORLD_SIZE * POD_TILE_SIZE,
      WORLD_SIZE * POD_TILE_SIZE
    );

    // Loop through the wall sprites & populate the spatial map
    // NOTE: This will also need to be done while users are building the pod
    // e.g. whenever users move/put/delete a piece
    mockFloorData.forEach((sprite: any) => {
      this.spatialMap[sprite.position.y][sprite.position.x].push(sprite);
    });

    this.floorSprites = initGroundSprites(this);
    mockFloorData.forEach((sprite: any) => {
      new PodFloor({ ...sprite, scene: this, collection: "cyber" });
    });

    // Load walls
    const mockWallData = getMockWallData(WORLD_SIZE);

    // Loop through the wall sprites & populate the spatial map
    // NOTE: This will also need to be done while users are building the pod
    // e.g. whenever users move/put/delete a piece
    mockWallData.forEach((sprite: any) => {
      this.spatialMap[sprite.position.y][sprite.position.x].push(sprite);
    });

    this.wallSprites = initWallAndFloorSprites(this);
    // NOTE: We are using BOTTOM LEFT origin, with coord NOT in pixel but in GRID SIZE UNIT
    // for the sake of calculation. We'll be converting the unit to actual world pixel
    // in the PodWall class
    mockWallData.forEach((sprite: any) => {
      new PodWall({ ...sprite, scene: this, collection: "cyber" });
    });
  }

  toggleBuildMode() {
    if (this.mode === "normal") {
      this.player.setActive(false);
      this.player.character?.hide();
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
      this.player.character?.show();
      this.mode = "normal";

      this.input.off("pointermove");
      if (this.player.character?.instance) {
        this.cameras.main.startFollow(
          this.player.character.instance,
          true,
          0.05,
          0.05
        );
      }
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
          (this.input.activePointer.worldX % POD_TILE_SIZE);
        const y =
          this.input.activePointer.worldY -
          (this.input.activePointer.worldY % POD_TILE_SIZE);

        this.itemToPlace.object.x = x;
        this.itemToPlace.object.y = y;
        this.itemToPlace.object.setDepth(
          (y + this.itemToPlace.object.height / 2) / POD_TILE_SIZE
        );
      }
    }
  }
}
