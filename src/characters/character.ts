import { CHARACTER_ASSET_PATH } from "envs";
import { TILE_SIZE } from "../constants";
import {
  AnimationDirection,
  AnimationState,
  CharacterSpine,
} from "../types/character";
import { distance } from "../utils/math";

function getBasicAnimation(state: AnimationState, dir: AnimationDirection) {
  return `anim_${state}_${dir}`;
}

type Instance = SpineGameObject & Phaser.Physics.Matter.Sprite;

export class Character extends Phaser.GameObjects.GameObject {
  public scene: Phaser.Scene;
  public instance?: Instance;
  public directions: AnimationDirection[] = ["front"];
  public state: AnimationState = "idle";
  public followee?: Character;
  public follower?: Character;
  public maximumDistanceToFollower = 60;
  public loadPromise: Promise<Instance>;

  private shadow?: Phaser.GameObjects.Image;

  constructor(props: {
    scene: Phaser.Scene;
    id: number;
    spine?: CharacterSpine;
    followee?: Character;
    follower?: Character;
    spineConfig?: SpineGameObjectConfig;
  }) {
    const {
      scene,
      id,
      spine = "Neko",
      followee,
      follower,
      spineConfig,
    } = props;

    super(scene, "character");

    this.scene = scene;
    const atlas = `/api/atlas?spine=${spine}&id=${id}`;
    const texture = `${CHARACTER_ASSET_PATH}/${spine}/Web/${
      spine === "TV-head" ? "" : `${id}/`
    }${spine}.png`;
    this.followee = followee;
    this.follower = follower;

    this.loadPromise = new Promise((r) => {
      this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
        // @ts-ignore Ignore, we'll add the Matter physics later
        this.instance = this.scene.make.spine({
          ...spineConfig,
          key: `${spine}/${id}-character`,
          skinName: "char_default",
          animationName: getBasicAnimation("idle", "front"),
          loop: true,
        });

        if (this.instance) {
          const char = this.instance.findSkin("char");
          const clothes = this.instance.findSkin("clothes");
          char.addSkin(clothes);

          this.instance.setSkin(char);

          if (this.follower) {
            this.follower.followee = this;
          }

          this.instance.depth = (spineConfig?.y as number) || 0;

          if (spineConfig?.scale && typeof spineConfig?.scale === "number") {
            const trueWidth = this.instance.width * spineConfig.scale;
            const trueHeight = this.instance.height * spineConfig.scale;
            this.instance.width = trueWidth;
            this.instance.height = trueHeight / 5;
          }

          this.maximumDistanceToFollower = 60;
          if (follower?.instance) {
            this.instance.x = follower.instance.x;
            this.instance.y =
              follower.instance.y - this.maximumDistanceToFollower;
            this.instance.depth = this.instance.y / TILE_SIZE;
          }

          // Create a shadow
          this.shadow = this.scene.add.image(
            this.instance.x,
            this.instance.y,
            "char-shadow"
          );
          this.shadow.setScale(0.175);
          this.shadow.setAlpha(0.5);
          r(this.instance);
        }
      });

      this.scene.load.image(`${spine}/${id}.png`, texture);

      this.scene.load.spine(
        `${spine}/${id}-character`,
        `/spines/${spine}.json`,
        atlas
      );

      this.scene.load.start();
    });
  }

  playAnimation(state: AnimationState, direction: AnimationDirection) {
    if (!this.instance) return;
    this.state = state;
    this.instance.play(getBasicAnimation(state, direction), true, true);
  }

  setVelocity(x: number, y?: number) {
    if (!this.instance) return;
    this.instance.setVelocity(x, y);
  }

  hide() {
    if (!this.instance || !this.shadow) return;
    this.instance.setActive(false).setVisible(false);
    this.shadow.setVisible(false);
  }

  show() {
    if (!this.instance || !this.shadow) return;
    this.instance.setActive(true).setVisible(true);
    this.shadow.setVisible(true);
  }

  // Update this character as a followee
  update() {
    if (!this.instance || !this.shadow) return;
    const followee = this.followee;

    if (followee?.instance) {
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
    this.shadow.setPosition(this.instance.x, this.instance.y);
    this.shadow.setDepth(this.instance.y / TILE_SIZE);
  }
}
