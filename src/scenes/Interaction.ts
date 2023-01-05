import Phaser from "phaser";
import {
  Label,
  Sizer,
  RoundRectangle,
} from "phaser3-rex-plugins/templates/ui/ui-components";

export default class Interaction extends Phaser.Scene {
  private sizer?: Sizer;
  private key?: Phaser.Input.Keyboard.Key;

  constructor() {
    super({
      key: "interaction",
    });
  }

  preload() {
    this.sizer = new Sizer(this, {
      anchor: {
        centerX: "center",
        bottom: "bottom-20",
      },
      height: 50,
    }).layout();
  }

  show(interactionData: any) {
    this.sizer?.clear(true);
    if (interactionData.onInteract) {
      this.key = this.input.keyboard.addKey(interactionData.key);
      this.key.on("up", interactionData.onInteract);
    }
    const label = new Label(this, {
      space: {
        left: 7,
        top: 5,
        bottom: 5,
        right: 7,
        icon: 5,
      },
      background: this.add.existing(
        new RoundRectangle(this, 0, 0, 1, 1, 10, 0x150f2b)
      ),
      icon: this.add.text(0, 0, interactionData.key, {
        padding: {
          top: 5,
          left: 5,
          right: 5,
          bottom: 8,
        },
        fontSize: "1.5rem",
        color: "#04a9f5",
      }),
      text: this.add.text(0, 0, interactionData.text, {
        fontSize: "1rem",
        color: "white",
      }),
    }).setAlpha(0);

    if (this.sizer) {
      this.sizer.add(label).layout();
      label.fadeIn(100, 1);
    }
  }

  hide() {
    this.key?.destroy();
    this.sizer?.clear(true);
  }
}
