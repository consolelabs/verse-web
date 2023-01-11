import Phaser from "phaser";
import { Player } from "../../characters/player";
import { Character } from "../../characters/character";
import { COLLISION_CATEGORY, PROD, TILE_SIZE } from "../../constants";
import { BaseSprite } from "../../objects/BaseSprite";
import GameDialogue from "../Game/Dialogue";
import GameInteraction from "./Interaction";
import { SceneKey } from "../../constants/scenes";
import { IBound } from "matter";

function getInteractHandler(properties: any, scene: GameMap) {
  return () => {
    scene.player.idle = true;
    scene.scene.pause(SceneKey.GAME_INTERACTION);
    switch (properties.type) {
      case "open-link":
        window.open(properties.value, "_blank");
        scene.player.idle = false;
        scene.scene.resume(SceneKey.GAME_INTERACTION);
        break;
      case "dialogue": {
        const dialogueScene = scene.scene.get(
          SceneKey.GAME_DIALOGUE
        ) as GameDialogue;
        dialogueScene.show(properties.value, () => {
          scene.player.idle = false;
          scene.scene.resume(SceneKey.GAME_INTERACTION);
        });
        break;
      }
      default:
        window.alert(`${properties.type} - ${properties.value}`);
        scene.player.idle = false;
        scene.scene.resume(SceneKey.GAME_INTERACTION);
        break;
    }
  };
}

export default class GameMap extends Phaser.Scene {
  public player!: Player;
  public map!: Phaser.Tilemaps.Tilemap;
  public bounds!: IBound;

  constructor() {
    super({
      key: SceneKey.GAME,
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
    // Launch interaction scene
    const interactionScene = this.scene.get(
      SceneKey.GAME_INTERACTION
    ) as GameInteraction;
    this.scene.launch(interactionScene);

    // Launch dialog scene
    this.scene.launch(SceneKey.GAME_DIALOGUE);

    const data = this.scene.settings.data as Record<string, any>;
    const { main } = this.cache.json.get("config");
    const interactionMapping = this.cache.json.get("interaction");
    this.player = new Player(this);

    // Now load assets
    const tilesetSource = Object.fromEntries(
      this.cache.tilemap
        .get(data?.main ?? main)
        ?.data.tilesets.map((ts: any) => [ts.name, ts.image]) ?? []
    );

    this.map = this.make.tilemap({
      key: data?.main ?? main,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    const { objects = [], layers = [], tilesets = [] } = this.map;

    // TODO: Move/Divide this into separate classes for better handling, e.g:
    // 1. CollisionObject
    // 2. NPC
    objects.forEach((layer) => {
      const layerPropsRaw = layer.properties;
      const layerProps = Array.isArray(layerPropsRaw)
        ? Object.fromEntries(layerPropsRaw.map((p) => [p.name, p.value]))
        : {};
      if (layerProps.interactive) {
        layer.objects.forEach((object) => {
          const id = object.id;
          const x = object.x ?? 0;
          const y = object.y ?? 0;
          const w = object.width ?? 0;
          const h = object.height ?? 0;
          const properties = interactionMapping.find((i: any) => i.id === id);
          if (!properties) return;

          if (
            object.point &&
            properties.type === "dialogue" &&
            properties.character
          ) {
            // TODO: Move this to a new NPC class
            const char = new Character({
              scene: this,
              type: properties.character,
              spriteConfig: {
                x,
                y,
                scale: 0.4,
              },
            });
            char.playAnimation("idle", "front");
            // since the NPC is not moving we might want to re extend the collision box so the player won't need to
            // stand too close to the NPC to trigger interaction
            char.instance.height *= 5 / 2;

            this.matter.add.gameObject(char.instance, {
              isStatic: true,
              onCollideCallback: () => {
                interactionScene.show({
                  key: properties.key,
                  text: properties.text,
                  onInteract: getInteractHandler(properties, this),
                });
              },
              onCollideEndCallback: () => {
                interactionScene.hide();
              },
            });
            char.instance.setFixedRotation();

            char.instance.setCollisionCategory(COLLISION_CATEGORY.NPC);
            char.instance.setCollidesWith(COLLISION_CATEGORY.PLAYER);
            char.instance.setDepth(y / TILE_SIZE);
          } else if (object.point) {
            this.matter.add.circle(x, y, TILE_SIZE, {
              isStatic: true,
              isSensor: true,
              collisionFilter: {
                category: COLLISION_CATEGORY.INTERACTION_POINT,
                mask: COLLISION_CATEGORY.PLAYER,
              },
              onCollideCallback: () => {
                interactionScene.show({
                  key: properties.key,
                  text: properties.text,
                  onInteract: getInteractHandler(properties, this),
                });
              },
              onCollideEndCallback: () => {
                interactionScene.hide();
              },
            });
          } else if (object.rectangle) {
            const body = this.matter.add.rectangle(x, y, w, h, {
              isStatic: true,
              isSensor: true,
              collisionFilter: {
                category: COLLISION_CATEGORY.INTERACTION_POINT,
                mask: COLLISION_CATEGORY.PLAYER,
              },
              onCollideCallback: () => {
                interactionScene.show({
                  key: properties.key,
                  text: properties.text,
                  onInteract: getInteractHandler(properties, this),
                });
              },
              onCollideEndCallback: () => {
                interactionScene.hide();
              },
            });

            this.matter.alignBody(body, x, y, Phaser.Display.Align.TOP_LEFT);
          }
        });
      } else {
        layer.objects.forEach((object) => {
          const x = object.x ?? 0;
          const y = object.y ?? 0;
          const w = object.width ?? 0;
          const h = object.height ?? 0;
          let body: MatterJS.BodyType | undefined = undefined;

          if (object.rectangle) {
            body = this.matter.add.rectangle(0, 0, w, h, {
              isStatic: true,
            });

            this.matter.alignBody(body, x, y, Phaser.Display.Align.TOP_LEFT);
          } else if (object.polygon) {
            // When converting Tiled polygon objects to game objects with MatterJS.Bodies.fromVertices method,
            // Phaser will recalculate the vertices' positions based on the object position. That means,
            // the final vertices' positions will no longer be the same as they are when we draw them in Tiled.
            // This demands a custom logic to translate them back to their original position.

            // Assuming that the polygon objects exported from Tiled is correct,
            // the polygon points' positions will be relative to the polygon object's position.
            // First, we need to get the original (absolute) coordinates of all vertices.
            const vertices = object.polygon.map((point) => {
              const pX = point.x ?? 0;
              const pY = point.y ?? 0;

              return {
                x: pX + x,
                y: pY + y,
              };
            });

            // Now calculate the original bounds of the object
            const originalBounds = {
              max: {
                x: Math.max(...vertices.map((point) => point.x)),
                y: Math.max(...vertices.map((point) => point.y)),
              },
              min: {
                x: Math.min(...vertices.map((point) => point.x)),
                y: Math.min(...vertices.map((point) => point.y)),
              },
            };

            // Create the body
            body = this.matter.add.fromVertices(x, y, object.polygon, {
              isStatic: true,
            });

            // Now calculate the offset between the created body & the original bounds
            const offset = {
              x: body.bounds.min.x - originalBounds.min.x,
              y: body.bounds.min.y - originalBounds.min.y,
            };

            this.matter.body.setPosition(body, {
              x: body.position.x - offset.x,
              y: body.position.y - offset.y,
            });
          }
        });
      }
    });

    // Load tilesets
    tilesets.forEach((tileset) => {
      // Do nothing if texture was already loaded
      if (this.textures.exists(tileset.name)) {
        return;
      }

      this.load.image(tileset.name, `/tiles/${tilesetSource[tileset.name]}`);
    });

    // Load the sprite in each layer
    layers.forEach((layer) => {
      layer.data.forEach((row) => {
        row.forEach((tile) => {
          const spriteImage = tile.properties.spriteImage;
          const spriteJSON = tile.properties.spriteJSON ?? "";
          const spriteKey = spriteJSON.split("/").pop()?.slice(0, -5);
          const isMultiAtlas = tile.properties.multiatlas ?? false;
          if (spriteKey && spriteJSON) {
            // Do nothing if texture was already loaded
            if (this.textures.exists(spriteKey)) {
              return;
            }

            if (isMultiAtlas) {
              const path = spriteJSON.split("/");
              path.pop();
              path.unshift("tiles");
              this.load.multiatlas(
                spriteKey,
                `/tiles/${spriteJSON}`,
                path.join("/")
              );
            } else {
              this.load.atlas(
                spriteKey,
                `/tiles/${spriteImage}`,
                `/tiles/${spriteJSON}`
              );
            }
          }
        });
      });
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

  create() {
    // Fade in
    this.cameras.main.fadeIn(100, 0, 0, 0);

    const { layers = [], tilesets = [] } = this.map;

    // Add loaded tilesets to the map
    tilesets.forEach((tileset) => this.map.addTilesetImage(tileset.name));

    // Loop through the layers & create them (& the sprites they refer to)
    layers.forEach((layer) => {
      const isStatic =
        // @ts-ignore
        layer.properties.find((p) => p.name === "static")?.value ?? false;

      const tilesets =
        // @ts-ignore
        layer.properties.find((p) => p.name === "tilesets")?.value ?? "";

      this.map.createLayer(layer.name, tilesets.split(","), 0, 0);

      if (!isStatic) {
        layer.data.forEach((row, y) => {
          row.forEach((tile, x) => {
            const spriteJSON = tile.properties.spriteJSON ?? "";
            const spriteKey = spriteJSON.split("/").pop()?.slice(0, -5);
            if (spriteJSON) {
              const atlas = this.textures.get(spriteKey);
              // phaser auto add a "BASE" frame so we need to subtract 1 more
              const animated = atlas.frameTotal - 1 > 1;

              new BaseSprite({
                game: this,
                key: spriteKey,
                anchor: { left: x, bottom: y },
                animated,
                duration: Number(tile.properties.duration),
                depthOffset: tile.properties.depthOffset,
              });
            }
          });
        });
      }
    });

    // Load characters
    // The list of characters will be saved in the global game object
    // Refer to ConfigLoader scene
    // @ts-ignore
    let charsToLoad = this.game.chars;
    // Change rabby and other to some other spines because we don't have spines for those yet
    charsToLoad = charsToLoad.map((c: string) => {
      if (c === "rabby") {
        return "ghost-neko";
      }

      if (c === "other") {
        return "tv-head";
      }

      return c;
    });
    this.player.loadCharacters(charsToLoad, {
      x: 5000,
      y: 5600,
      scale: 0.4,
    });

    // Follow the first character
    this.cameras.main.startFollow(
      this.player.characters[0].instance,
      true,
      0.05,
      0.05
    );
  }

  update() {
    if (!this.player) {
      return;
    }

    this.player.update();
  }
}