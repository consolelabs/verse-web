import { NEKO_COL, RABBY_COL } from "envs";
import { TILE_SIZE } from "../constants";
import {
  AnimationDirection,
  AnimationState,
  CharacterSpine,
} from "../types/character";
import { distance } from "../utils/math";

type Anim = `anim_${AnimationState}_${AnimationDirection}${string}`;
type Instance = SpineGameObject & Phaser.Physics.Matter.Sprite;

function getBasicAnimation(
  state: AnimationState,
  dir: AnimationDirection,
  suffix = ""
): Anim {
  return `anim_${state}_${dir}${suffix}`;
}

const fallbackOrder: Array<AnimationState> = ["run", "walk", "idle"];

function getCol(spine: CharacterSpine) {
  switch (spine) {
    case "Neko":
      return NEKO_COL;
    case "Rabby":
      return RABBY_COL;
    default:
      return "";
  }
}

const scaleByChar: Record<CharacterSpine, number> = {
  Neko: 0.2,
  Rabby: 0.2,
  GhostNeko: 0.4,
  "TV-head": 0.3,
};

export type Config = {
  scene: Phaser.Scene;
  id: number;
  spine: CharacterSpine;
  followee?: Character;
  follower?: Character;
  spineConfig?: SpineGameObjectConfig;
  animSuffix?: string;
  collection?: string;
  urls: {
    atlasURL: string;
    textureURL: string;
  };
  name?: string;
};

export class Character extends Phaser.GameObjects.GameObject {
  public scene: Phaser.Scene;
  public instance?: Instance;
  public directions: AnimationDirection[] = ["front"];
  public state: AnimationState = "idle";
  public followee?: Character;
  public follower?: Character;
  public maximumDistanceToFollower = 60;
  public loadPromise: Promise<Instance>;
  public animSuffix = "";
  public availableAnims: Array<Anim> = [];
  public key: string;
  public nameText?: Phaser.GameObjects.Text;
  private originalHeight = 0;

  constructor(props: Config) {
    const {
      scene,
      id,
      spine = "Neko",
      collection = getCol(spine),
      followee,
      follower,
      spineConfig = {},
      animSuffix = "",
      urls: { atlasURL, textureURL },
      name = "",
    } = props;

    super(scene, "character");

    this.key = `${spine}/${collection}/${id}`;

    this.scene = scene;
    let atlas = atlasURL;
    if (spine !== "GhostNeko") {
      atlas = `/api/atlas?spine=${spine}&collection=${collection}&id=${id}&atlasURL=${encodeURI(
        atlasURL
      )}`;
    }
    let texture = textureURL;
    if (spine === "TV-head") {
      texture = `/api/resize?textureURL=${encodeURI(textureURL)}`;
    }

    this.followee = followee;
    this.follower = follower;
    this.animSuffix = animSuffix;

    this.loadPromise = new Promise((r) => {
      this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
        if (this.scene) {
          // @ts-ignore Ignore, we'll add the Matter physics later
          this.instance = this.scene.make.spine({
            ...spineConfig,
            key: `${this.key}-character`,
            skinName: "char_default",
            animationName: getBasicAnimation("idle", "front", this.animSuffix),
            loop: true,
          });

          if (this.instance) {
            this.availableAnims =
              this.instance.getAnimationList() as Array<Anim>;

            const char = this.instance.findSkin("char");
            const clothes = this.instance.findSkin("clothes");
            if (char && clothes) {
              char.addSkin(clothes);

              this.instance.setSkin(char);
            }

            if (this.follower) {
              this.follower.followee = this;
            }

            this.instance.depth = (spineConfig?.y as number) || 0;

            const newW = this.instance.width * Number(scaleByChar[spine]);
            const newH = this.instance.height * Number(scaleByChar[spine]);
            this.originalHeight = newH;
            this.instance.setSize(newW, 20);

            this.maximumDistanceToFollower = 60;
            if (follower?.instance) {
              this.instance.x = follower.instance.x;
              this.instance.y =
                follower.instance.y - this.maximumDistanceToFollower;
              this.instance.depth = this.instance.y / TILE_SIZE;
            }

            if (name) {
              this.nameText = this.scene.add.text(
                this.instance.x,
                this.instance.y,
                name,
                {
                  fontFamily: "Chakra Petch",
                  fontSize: "0.825rem",
                  backgroundColor: "rgba(0,0,0,0.7)",
                  padding: {
                    top: 5,
                    bottom: 5,
                    left: 5,
                    right: 5,
                  },
                  color: "#fff",
                }
              );
            }
            r(this.instance);
          }
        }
      });

      if (texture) {
        this.scene?.load.image(`${this.key}.png`, texture);
      }

      this.scene?.load.spine(
        `${this.key}-character`,
        `/spines/${spine}.json`,
        atlas
      );

      this.scene?.load.start();
    });
  }

  destroy(...args: any) {
    this.instance?.destroy(...args);
    super.destroy(...args);
  }

  playAnimation(state: AnimationState, direction: AnimationDirection) {
    if (!this.instance) return;
    this.state = state;
    let anim = getBasicAnimation(state, direction, this.animSuffix);
    if (!this.availableAnims.includes(anim)) {
      for (const f of fallbackOrder) {
        anim = getBasicAnimation(f, direction);
        if (this.availableAnims.includes(anim)) break;
      }
    }
    if (this.availableAnims.includes(anim)) {
      this.instance.play(anim, true, true);
    }
  }

  setVelocity(x: number, y?: number) {
    if (!this.instance) return;
    this.instance.setVelocity(x, y);
  }

  hide() {
    if (!this.instance) return;
    this.instance.setActive(false).setVisible(false);
  }

  show() {
    if (!this.instance) return;
    this.instance.setActive(true).setVisible(true);
  }

  // Update this character as a followee
  update() {
    if (!this.instance) return;
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
    this.nameText?.setPosition(
      this.instance.x - this.nameText.width / 2,
      this.instance.y - this.originalHeight - this.nameText.height * 1.125
    );
    this.nameText?.setDepth(this.instance.y);
  }
}
