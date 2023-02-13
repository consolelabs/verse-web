import { Character } from "characters/character";
import { TILE_SIZE, COLLISION_CATEGORY } from "../constants";
import { SceneKey } from "constants/scenes";
import Phaser from "phaser";
import GameDialogue from "scenes/Game/Dialogue";
import GameInteraction from "scenes/Game/Interaction";
import GameMap from "scenes/Game/Map";
import type { CharacterSpine } from "types/character";

type Interaction =
  | {
      id: number;
      text: string;
      key: string;
      type: "open-link";
      value: string;
    }
  | {
      id: number;
      text: string;
      key: string;
      type: "dialogue";
      value: number;
      character: {
        id: 25;
        spine: CharacterSpine;
        animSuffix?: number;
        urls: {
          atlasURL: string;
          textureURL: string;
        };
      };
    };

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

export class ObjectLayerManager {
  interactionScene?: GameInteraction;

  constructor(public scene: GameMap) {
    this.interactionScene = scene.scene.get(
      SceneKey.GAME_INTERACTION
    ) as GameInteraction;
  }

  createCollisionLayer(objects: Array<Phaser.Types.Tilemaps.TiledObject>) {
    objects.forEach((object) => {
      const x = object.x ?? 0;
      const y = object.y ?? 0;
      const w = object.width ?? 0;
      const h = object.height ?? 0;
      let body: MatterJS.BodyType | undefined = undefined;

      if (object.rectangle) {
        body = this.scene.matter.add.rectangle(0, 0, w, h, {
          isStatic: true,
        });

        this.scene.matter.alignBody(body, x, y, Phaser.Display.Align.TOP_LEFT);
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
        body = this.scene.matter.add.fromVertices(x, y, object.polygon, {
          isStatic: true,
        });

        // Now calculate the offset between the created body & the original bounds
        const offset = {
          x: body.bounds.min.x - originalBounds.min.x,
          y: body.bounds.min.y - originalBounds.min.y,
        };

        this.scene.matter.body.setPosition(body, {
          x: body.position.x - offset.x,
          y: body.position.y - offset.y,
        });
      }
    });
  }

  createInteractiveLayer(
    objects: Array<Phaser.Types.Tilemaps.TiledObject>,
    interactions: Array<Interaction>
  ) {
    objects.forEach((object) => {
      const id = object.id;
      const x = object.x ?? 0;
      const y = object.y ?? 0;
      const w = object.width ?? 0;
      const h = object.height ?? 0;
      const properties = interactions.find((i) => i.id === id);
      if (!properties) return;

      if (
        object.point &&
        properties.type === "dialogue" &&
        properties.character
      ) {
        const char = new Character({
          scene: this.scene,
          id: properties.character.id,
          spine: properties.character.spine,
          animSuffix: properties.character.animSuffix
            ? `_${properties.character.animSuffix}`
            : "",
          spineConfig: {
            x,
            y,
            scale: 0.4,
          },
          urls: properties.character.urls,
        });
        char.loadPromise.then((instance) => {
          // since the NPC is not moving we might want to re extend the collision box so the player won't need to
          // stand too close to the NPC to trigger interaction
          instance.height *= 5 / 2;
          char.playAnimation("idle", "front");

          this.scene.matter.add.gameObject(instance, {
            isStatic: true,
            onCollideCallback: () => {
              this.interactionScene?.show({
                key: properties.key,
                text: properties.text,
                onInteract: getInteractHandler(properties, this.scene),
              });
            },
            onCollideEndCallback: () => {
              this.interactionScene?.hide();
            },
          });
          instance.setFixedRotation();

          instance.setCollisionCategory(COLLISION_CATEGORY.NPC);
          instance.setCollidesWith(COLLISION_CATEGORY.PLAYER);
          instance.setDepth(y / TILE_SIZE);
          char.update();
        });
      } else if (object.point || object.rectangle) {
        const body = this.createInteraction(x, y, w, h, properties);
        if (object.rectangle) {
          this.scene.matter.alignBody(
            body,
            x,
            y,
            Phaser.Display.Align.TOP_LEFT
          );
        }
      }
    });
  }

  private createInteraction(
    x: number,
    y: number,
    w: number,
    h: number,
    properties: Interaction
  ) {
    return this.scene.matter.add.rectangle(x, y, w, h, {
      isStatic: true,
      isSensor: true,
      collisionFilter: {
        category: COLLISION_CATEGORY.INTERACTION_POINT,
        mask: COLLISION_CATEGORY.PLAYER,
      },
      onCollideCallback: () => {
        this.interactionScene?.show({
          key: properties.key,
          text: properties.text,
          onInteract: getInteractHandler(properties, this.scene),
        });
      },
      onCollideEndCallback: () => {
        this.interactionScene?.hide();
      },
    });
  }
}
