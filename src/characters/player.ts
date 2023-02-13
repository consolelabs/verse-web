import Phaser from "phaser";
import { TILE_SIZE } from "../constants";
import { AnimationDirection } from "../types/character";
import { Character, Config as CharacterConfig } from "./character";

const SPEED_WALK = 7;
const SPEED_RUN = 8;

type PlayerConfig = CharacterConfig & {
  isPreview?: boolean;
};

export class Player extends Phaser.GameObjects.GameObject {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: any;
  public character?: Character;
  idle = false;

  constructor(public config: PlayerConfig) {
    super(config.scene, "player");
    this.character = new Character(config);

    this.registerMovementHandlers();
  }

  registerMovementHandlers() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.keys = this.scene.input.keyboard.addKeys("W,A,S,D,Shift");
  }

  destroy(...args: any[]) {
    this.character?.destroy(...args);
    super.destroy(...args);
  }

  update() {
    if (this.idle || !this.character) return;
    const char = this.character;
    const directions: AnimationDirection[] = [];

    let speed = SPEED_WALK;

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
        speed = SPEED_RUN;
      }

      if (this.config.isPreview) {
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
