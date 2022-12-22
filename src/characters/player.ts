import Phaser from "phaser";

type CharacterType = "neko" | "rabby" | "fukuro" | "ghost-neko" | "tv-head";
type AnimationState = "idle" | "walk" | "run";
type AnimationDirection = "front" | "behind" | "left" | "right";

function getBasicAnimation(state: AnimationState, dir: AnimationDirection) {
  return `anim_${state}_${dir}`;
}

export class Player extends Phaser.GameObjects.GameObject {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: any;
  private instance: any;
  private dir: AnimationDirection = "front";

  constructor(public characterType: CharacterType, public scene: Phaser.Scene) {
    super(scene, "player");
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys("W,A,S,D,Shift");

    // @ts-ignore
    scene.load.spine(
      "player",
      `assets/${characterType}/char.json`,
      `assets/${characterType}/char.atlas`
    );
  }

  spawn(config: any) {
    if (this.instance) return this.instance;
    // @ts-ignore
    this.instance = this.scene.make.spine({
      ...config,
      key: "player",
      skinName: "char_default",
      animationName: getBasicAnimation("idle", "front"),
      loop: true,
    });
    return this.instance;
  }

  update() {
    let speed = 100;
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

      if (this.keys.Shift.isDown) {
        speed = 180;
      }

      if (this.cursors.left?.isDown || this.keys.A.isDown) {
        horizontalVelocity = -speed;
        this.dir = "right";
        if (
          !this.cursors.up.isDown &&
          !this.keys.W.isDown &&
          !this.cursors.down.isDown &&
          !this.keys.S.isDown
        ) {
          this.instance.play(
            getBasicAnimation(this.keys.Shift.isDown ? "run" : "walk", "right"),
            true,
            true
          );
        }
      } else if (this.cursors.right?.isDown || this.keys.D.isDown) {
        horizontalVelocity = speed;
        this.dir = "left";
        if (
          !this.cursors.up.isDown &&
          !this.keys.W.isDown &&
          !this.cursors.down.isDown &&
          !this.keys.S.isDown
        ) {
          this.instance.play(
            getBasicAnimation(this.keys.Shift.isDown ? "run" : "walk", "left"),
            true,
            true
          );
        }
      }

      if (this.cursors.up?.isDown || this.keys.W.isDown) {
        verticalVelocity = -speed;
        this.dir = "behind";
        this.instance.play(
          getBasicAnimation(this.keys.Shift.isDown ? "run" : "walk", "behind"),
          true,
          true
        );
      } else if (this.cursors.down?.isDown || this.keys.S.isDown) {
        verticalVelocity = speed;
        this.dir = "front";
        this.instance.play(
          getBasicAnimation(this.keys.Shift.isDown ? "run" : "walk", "front"),
          true,
          true
        );
      }

      this.instance.body.setVelocity(horizontalVelocity, verticalVelocity);
    } else {
      this.instance.body.setVelocity(0, 0);
      this.instance.play(getBasicAnimation("idle", this.dir), true, true);
    }
  }
}
