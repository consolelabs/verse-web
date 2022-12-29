import { TILE_SIZE } from "../constants";
import {
  AnimationDirection,
  AnimationState,
  CharacterType,
} from "../types/character";
import { distance } from "../utils/math";

function getBasicAnimation(state: AnimationState, dir: AnimationDirection) {
  return `anim_${state}_${dir}`;
}

export class Character extends Phaser.GameObjects.GameObject {
  public scene: Phaser.Scene;
  public instance: SpineGameObject & Phaser.Physics.Matter.Sprite;
  public type: CharacterType;
  public directions: AnimationDirection[] = ["front"];
  public state: AnimationState = "idle";
  public followee?: Character;
  public follower?: Character;
  public maximumDistanceToFollower: number;

  constructor(props: {
    scene: Phaser.Scene;
    type?: CharacterType;
    followee?: Character;
    follower?: Character;
    spriteConfig?: SpineGameObjectConfig;
  }) {
    const { scene, type = "neko", followee, follower, spriteConfig } = props;

    super(scene, "character");

    this.scene = scene;
    this.type = type;
    this.followee = followee;
    this.follower = follower;

    if (this.follower) {
      this.follower.followee = this;
    }

    // @ts-ignore Ignore, we'll add the Matter physics later
    this.instance = this.scene.make.spine({
      ...spriteConfig,
      key: `${this.type}-character`,
      skinName: "char_default",
      animationName: getBasicAnimation("idle", "front"),
      loop: true,
    });

    this.instance.depth = (spriteConfig?.y as number) || 0;

    if (spriteConfig?.scale && typeof spriteConfig?.scale === "number") {
      const trueWidth = this.instance.width * spriteConfig.scale;
      const trueHeight = this.instance.height * spriteConfig.scale;
      this.instance.width = trueWidth / 2;
      this.instance.height = trueHeight / 5;
    }

    this.maximumDistanceToFollower = 60;
    if (follower) {
      this.instance.x = follower.instance.x;
      this.instance.y = follower.instance.y - this.maximumDistanceToFollower;
      this.instance.depth = this.instance.y / TILE_SIZE;
    }
  }

  playAnimation(state: AnimationState, direction: AnimationDirection) {
    this.state = state;
    this.instance.play(getBasicAnimation(state, direction), true, true);
  }

  setVelocity(x: number, y?: number) {
    this.instance.setVelocity(x, y);
  }

  // Update this character as a followee
  update() {
    const followee = this.followee;

    if (followee) {
      const distanceToFollowee = distance(
        [this.instance.x, this.instance.y],
        [followee.instance.x, followee.instance.y]
      );

      // Adjust followee position when this object (the follower) is out of range
      if (distanceToFollowee > this.maximumDistanceToFollower) {
        const ratio = 1 - this.maximumDistanceToFollower / distanceToFollowee;
        const offset = {
          x: (this.instance.x - followee.instance.x) * ratio,
          y: (this.instance.y - followee.instance.y) * ratio,
        };

        followee.instance.x += offset.x;
        followee.instance.y += offset.y;

        if (offset.y < -1) {
          followee.playAnimation(this.state, "behind");
        } else if (offset.y > 1) {
          followee.playAnimation(this.state, "front");
        } else {
          if (offset.x < -1) {
            followee.playAnimation(this.state, "right");
          } else if (offset.x > 1) {
            followee.playAnimation(this.state, "left");
          } else {
            followee.playAnimation("idle", "front");
          }
        }
      }

      followee.update();
    }

    // Update object depth based on y
    this.instance.depth = this.instance.y / TILE_SIZE;
  }
}
