import Phaser from "phaser";
import { Player } from "../../characters/player";
import { COLLISION_CATEGORY, CDN_PATH, PROD, TILE_SIZE } from "../../constants";
import { BaseSprite } from "../../objects/BaseSprite";
import Stats from "stats.js";

function getInteractHandler(properties: any) {
  switch (properties.type) {
    case "open-link":
      return () => window.open(properties.value, "_blank");
    default:
      return () => window.alert(`${properties.type} - ${properties.value}`);
  }
}

// FPS Counter
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

export default class GameMap extends Phaser.Scene {
  private player!: Player;
  private map!: Phaser.Tilemaps.Tilemap;

  constructor() {
    super({
      key: "game",
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
    const hudScene = this.scene.get("game-hud");
    // @ts-ignore
    hudScene.mainScene = this;
    this.scene.launch(hudScene);

    const interactionScene = this.scene.get("game-interaction");
    this.scene.launch(interactionScene);
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

          if (object.point) {
            this.matter.add.circle(x, y, TILE_SIZE, {
              isStatic: true,
              isSensor: true,
              collisionFilter: {
                category: COLLISION_CATEGORY.INTERACTION_POINT,
                mask: COLLISION_CATEGORY.PLAYER,
              },
              onCollideCallback: () => {
                // @ts-ignore
                interactionScene.show({
                  key: properties.key,
                  text: properties.text,
                  onInteract: getInteractHandler(properties),
                });
              },
              onCollideEndCallback: () => {
                // @ts-ignore
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
                // @ts-ignore
                interactionScene.show({
                  key: properties.key,
                  text: properties.text,
                  onInteract: getInteractHandler(properties),
                });
              },
              onCollideEndCallback: () => {
                // @ts-ignore
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

          if (object.rectangle) {
            const body = this.matter.add.rectangle(0, 0, w, h, {
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
            const body = this.matter.add.fromVertices(x, y, object.polygon, {
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
              });
            }
          });
        });
      }
    });

    // Load characters
    this.player.loadCharacters(["tv-head", "neko", "fukuro", "ghost-neko"], {
      x: 5000,
      y: 5600,
      scale: 0.4,
    });
  }

  update() {
    stats.begin();

    if (!this.player) {
      return;
    }

    this.player.update();

    stats.end();
  }
}
