import Phaser from "phaser";
import {
  Label,
  Sizer,
  RoundRectangle,
} from "phaser3-rex-plugins/templates/ui/ui-components";
import { SceneKey } from "../../constants/scenes";

export default class GameInteraction extends Phaser.Scene {
  private sizer?: Sizer;
  private key?: Phaser.Input.Keyboard.Key;

  constructor() {
    super({
      key: SceneKey.GAME_INTERACTION,
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
        left: 10,
        top: 7,
        bottom: 10,
        icon: 10,
      },
      background: this.add.existing(
        new RoundRectangle(this, 0, 0, 1, 1, 10, 0x150f2b)
      ),
      icon: this.add
        .sprite(0, 0, "j-control")
        .play("j-control-press")
        .setDisplaySize(32, 32),
      text: this.add.text(0, 0, interactionData.text, {
        fontFamily: "Chakra Petch",
        fontSize: "1.25rem",
        color: "white",
      }),
    }).setAlpha(0);

    if (this.sizer) {
      this.sizer.add(label, { align: "center-center" }).layout();
      label.fadeIn(100, 1);
    }
  }

  hide() {
    this.key?.destroy();
    this.sizer?.clear(true);
  }
}
