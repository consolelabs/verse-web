import Phaser from "phaser";
import {
  TextBox,
  BBCodeText,
  RoundRectangle,
  Label,
  Sizer,
} from "phaser3-rex-plugins/templates/ui/ui-components";
import { SceneKey } from "../../constants/scenes";

const COLOR_PRIMARY = 0x150f2b;
const COLOR_SECONDARY = 0x2c2640;

const CHARACTER_FACE_SIZE = 128;

export default class GameDialogue extends Phaser.Scene {
  sizer!: Sizer;
  textBox?: TextBox;
  label?: Label;
  keys?: any;
  close = false;
  nextPage = false;
  showing = false;
  dialogue: any;
  dialogueList: any;

  constructor() {
    super({
      key: SceneKey.GAME_DIALOGUE,
      active: false,
    });
  }

  preload() {
    this.input.keyboard.on("keyup", (e: KeyboardEvent) => {
      if (e.key === "j" && this.showing) {
        if (this.textBox?.isTyping) {
          this.textBox.stop(true);
        } else {
          this.textBox?.typeNextPage();
        }
      }
    });
    this.sizer = new Sizer(this, {
      anchor: {
        centerX: "center",
        bottom: "bottom-20",
      },
      orientation: 1,
    }).layout();

    this.anims.create({
      key: "j-control-press",
      frames: this.anims.generateFrameNumbers("j-control", {}),
      repeat: -1,
      frameRate: 3,
    });
  }

  show(
    dialogueId: number,
    onEnd = () => {
      return;
    }
  ) {
    this.close = false;
    this.dialogueList = this.cache.json.get("dialogue");
    this.dialogue = this.dialogueList.find((d: any) => d.id === dialogueId);
    if (!this.dialogue) {
      onEnd();
      return;
    }

    this.label = new Label(this, {
      background: this.add
        .existing(
          new RoundRectangle(this, 0, 0, 1, 1, { tl: 5, tr: 5 }, COLOR_PRIMARY)
        )
        .setStrokeStyle(2, COLOR_SECONDARY),
      text: this.add.text(0, 0, this.dialogue.character.name, {
        fontSize: "1.125rem",
        color: "white",
      }),
      space: {
        top: 7,
        left: 10,
        right: 10,
        bottom: 7,
      },
    });
    this.textBox = new TextBox(this, {
      background: this.add
        .existing(
          new RoundRectangle(
            this,
            0,
            0,
            1,
            1,
            {
              tr: 20,
              tl: 0,
              bl: 20,
              br: 20,
            },
            COLOR_PRIMARY
          )
        )
        .setStrokeStyle(2, COLOR_SECONDARY),
      icon: this.add
        .image(
          0,
          0,
          `${this.dialogue.character.id}-${this.dialogue.character.face}`
        )
        .setDisplaySize(CHARACTER_FACE_SIZE, CHARACTER_FACE_SIZE),
      text: this.add.existing(
        new BBCodeText(this, 0, 0, "", {
          fixedWidth: window.innerWidth / 3,
          fontSize: "20px",
          wrap: {
            mode: "word",
            width: window.innerWidth / 3,
          },
          maxLines: 4,
        })
      ),
      action: this.add
        .sprite(0, 0, "j-control")
        .play("j-control-press")
        .setDisplaySize(32, 32),
      space: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
        icon: 20,
        text: 10,
      },
    })
      .setOrigin(0)
      .layout();

    this.textBox.on("complete", () => {
      const next = this.dialogueList.find(
        (d: any) => d.id === this.dialogue.next
      );
      if (!next) {
        if (!this.close) {
          this.close = true;
          return;
        }
        this.showing = false;
        this.sizer
          ?.fadeOutPromise(100)
          .then(onEnd)
          .then(() => {
            this.textBox?.destroy();
            this.label?.destroy();
          });
      } else {
        if (!this.nextPage) {
          this.nextPage = true;
          return;
        }
        this.textBox?.setIconTexture(
          `${next.character.id}-${next.character.face}`
        );
        this.textBox?.setIconSize(CHARACTER_FACE_SIZE, CHARACTER_FACE_SIZE);
        this.label?.setText(next.character.name);
        this.dialogue = next;
        this.typing();
      }
    });

    this.textBox.on("type", () => {
      this.showing = true;
    });

    this.sizer.add(this.label, {
      align: "left",
    });
    this.sizer.add(this.textBox);
    this.sizer.fadeIn(100, 1);

    this.typing();
  }

  typing() {
    this.nextPage = false;
    if (this.dialogue.content?.english) {
      this.textBox?.start(this.dialogue.content.english, 15);
    }
  }
}
