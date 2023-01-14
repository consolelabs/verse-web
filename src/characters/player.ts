import Phaser from "phaser";
import { TILE_SIZE } from "../constants";
import { AnimationDirection, CharacterSpine } from "../types/character";
import { Character } from "./character";

export class Player extends Phaser.GameObjects.GameObject {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: any;
  public character?: Character;
  public isPreview: boolean;
  idle = false;

  constructor(config: {
    scene: Phaser.Scene;
    id: number;
    spine: CharacterSpine;
    isPreview?: boolean;
    spineConfig?: SpineGameObjectConfig;
  }) {
    super(config.scene, "player");
    const { scene, id, spine, spineConfig = {}, isPreview = false } = config;
    this.isPreview = isPreview;
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys("W,A,S,D,Shift");
    this.character = new Character({
      scene,
      id,
      spine,
      spineConfig,
    });
  }

  // TODO: move this
  // loadCharacters(
  //   characters: CharacterType[],
  //   spriteConfig: SpineGameObjectConfig = {}
  // ) {
  //   this.characters = characters.reduce((result, current, currentIndex) => {
  //     return [
  //       ...result,
  //       new Character({
  //         scene: this.scene,
  //         type: current,
  //         follower: currentIndex > 0 ? result[currentIndex - 1] : undefined,
  //         spriteConfig,
  //       }),
  //     ];
  //   }, [] as Character[]);
  //
  //   // Loop and add extra logic
  //   this.characters.forEach((character, i) => {
  //     // Add physic object to each character
  //     this.scene.matter.add.gameObject(character.instance);
  //     character.instance.setFixedRotation();
  //
  //     // Set collision filter so that characters will not collide with themselves
  //     // but still collide with everything else
  //     character.instance.setCollisionGroup(-1);
  //     character.instance.setCollisionCategory(
  //       i === 0 ? COLLISION_CATEGORY.PLAYER : COLLISION_CATEGORY.MEMBER
  //     );
  //     character.instance.setCollidesWith(
  //       i === 0 ? [-1, COLLISION_CATEGORY.INTERACTION_POINT] : -1
  //     );
  //   });
  // }

  update() {
    if (this.idle || !this.character) return;
    const char = this.character;
    const directions: AnimationDirection[] = [];

    let speed = 2;

    if (
      this.cursors.up.isDown ||
      this.cursors.down.isDown ||
      this.cursors.left.isDown ||
      this.cursors.right.isDown ||
      this.keys.W.isDown ||
      this.keys.A.isDown ||
      this.keys.S.isDown ||
      this.keys.D.isDown
    ) {
      let horizontalVelocity = 0;
      let verticalVelocity = 0;
      let animDirection: AnimationDirection = "front";

      if (this.keys.Shift.isDown) {
        speed = 7;
      }

      if (this.isPreview) {
        speed = 0;
      }

      if (this.cursors.left?.isDown || this.keys.A.isDown) {
        horizontalVelocity = -speed;
        directions.push("right");
        if (
          !this.cursors.up.isDown &&
          !this.keys.W.isDown &&
          !this.cursors.down.isDown &&
          !this.keys.S.isDown
        ) {
          animDirection = "right";
        }
      } else if (this.cursors.right?.isDown || this.keys.D.isDown) {
        horizontalVelocity = speed;
        directions.push("left");
        if (
          !this.cursors.up.isDown &&
          !this.keys.W.isDown &&
          !this.cursors.down.isDown &&
          !this.keys.S.isDown
        ) {
          animDirection = "left";
        }
      }

      if (this.cursors.up?.isDown || this.keys.W.isDown) {
        verticalVelocity = -speed;
        directions.push("behind");
        animDirection = "behind";
      } else if (this.cursors.down?.isDown || this.keys.S.isDown) {
        verticalVelocity = speed;
        directions.push("front");
        animDirection = "front";
      }

      // Play animation
      char.playAnimation(
        this.keys.Shift.isDown ? "run" : "walk",
        animDirection
      );

      // Reduce velocity if both horizontal & vertical velocity are not 0
      if (horizontalVelocity && verticalVelocity) {
        horizontalVelocity =
          Math.sign(horizontalVelocity) * Math.sqrt(speed) ** 1.4;
        verticalVelocity =
          Math.sign(verticalVelocity) * Math.sqrt(speed) ** 1.4;
      }

      char.directions = directions;
      char.setVelocity(horizontalVelocity, verticalVelocity);
      char.instance?.setDepth(char.instance.y / TILE_SIZE);
      char.update();
    } else {
      char.setVelocity(0, 0);
      char.playAnimation("idle", char.directions[0]);
      char.update();
    }
  }
}
