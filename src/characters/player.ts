import Phaser from "phaser";
import { COLLISION_CATEGORY, TILE_SIZE } from "../constants";
import { AnimationDirection, CharacterType } from "../types/character";
import { Character } from "./character";

export class Player extends Phaser.GameObjects.GameObject {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: any;
  public characters: Character[] = [];
  idle = false;

  constructor(public scene: Phaser.Scene) {
    super(scene, "player");
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys("W,A,S,D,Shift");
  }

  loadCharacters(
    characters: CharacterType[],
    spriteConfig: SpineGameObjectConfig = {}
  ) {
    this.characters = characters.reduce((result, current, currentIndex) => {
      return [
        ...result,
        new Character({
          scene: this.scene,
          type: current,
          follower: currentIndex > 0 ? result[currentIndex - 1] : undefined,
          spriteConfig,
        }),
      ];
    }, [] as Character[]);

    // Loop and add extra logic
    this.characters.forEach((character, i) => {
      // Add physic object to each character
      this.scene.matter.add.gameObject(character.instance);
      character.instance.setFixedRotation();

      // Set collision filter so that characters will not collide with themselves
      // but still collide with everything else
      character.instance.setCollisionGroup(-1);
      character.instance.setCollisionCategory(
        i === 0 ? COLLISION_CATEGORY.PLAYER : COLLISION_CATEGORY.MEMBER
      );
      character.instance.setCollidesWith(
        i === 0 ? [-1, COLLISION_CATEGORY.INTERACTION_POINT] : -1
      );
    });

    // Follow the last character
    this.scene.cameras.main.startFollow(
      this.characters[0].instance,
      true,
      0.05,
      0.05
    );
  }

  update() {
    if (this.idle) return;
    const leadCharacter = this.characters[0];
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
      leadCharacter.playAnimation(
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

      leadCharacter.directions = directions;
      leadCharacter.setVelocity(horizontalVelocity, verticalVelocity);
      leadCharacter.instance.setDepth(leadCharacter.instance.y / TILE_SIZE);
      leadCharacter.update();
    } else {
      leadCharacter.setVelocity(0, 0);
      leadCharacter.playAnimation("idle", leadCharacter.directions[0]);
      leadCharacter.update();
    }
  }
}
