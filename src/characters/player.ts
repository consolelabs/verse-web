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
  private dir: AnimationDirection = "front";
  public instance: any;
  public characterType: CharacterType = "neko";

  constructor(public scene: Phaser.Scene, characterType?: CharacterType) {
    super(scene, "player");
    if (characterType) {
      this.characterType = characterType;
    }
    this.load();
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys("W,A,S,D,Shift");
  }

  load() {
    ["fukuro", "ghost-neko", "neko", "tv-head"].forEach((char) => {
      this.scene.load.spine(
        `${char}-character`,
        `assets/${char}/char.json`,
        `assets/${char}/char.atlas`
      );
    });
  }

  spawn(config: any = {}) {
    this.characterType = config.character ?? this.characterType;
    this.instance?.destroy();
    this.instance = this.scene.make.spine({
      ...config,
      key: `${this.characterType}-character`,
      skinName: "char_default",
      animationName: getBasicAnimation("idle", "front"),
      loop: true,
    });

    const trueWidth = this.instance.width * config.scale;
    const trueHeight = this.instance.height * config.scale;
    this.instance.width = trueWidth;
    this.instance.height = trueHeight;

    return this.instance;
  }

  update() {
    let speed = 1.33;
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
        speed = 2;
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

      this.instance.setVelocity(horizontalVelocity, verticalVelocity);

      // FIXME: Player depth == y
      // @ts-ignore
      const baseTileSize = 16;
      this.instance.setDepth(this.instance.y / baseTileSize);
    } else {
      this.instance.setVelocity(0, 0);
      this.instance.play(getBasicAnimation("idle", this.dir), true, true);
    }
  }
}
