import Phaser from "phaser";

// https://braelynnn.medium.com/extending-a-phaser-class-to-make-reusable-game-objects-93c11326787e
export class Button extends Phaser.GameObjects.Container {
  public scene: Phaser.Scene;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public key?: string;

  constructor(props: {
    scene: Phaser.Scene;
    x: number;
    y: number;
    width?: number;
    height?: number;
    key?: string;
    text: string;
    textStyle?: Phaser.GameObjects.TextStyle;
    onClick?: () => void;
  }) {
    const {
      scene,
      x,
      y,
      width = 200,
      height = 50,
      key = "btn",
      text,
      textStyle = {
        fontSize: "28px",
      },
      onClick = () => {
        return;
      },
    } = props;

    super(scene);

    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.key = key;

    // Generate texture for button bg
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x000000, 1);
    //  8px radius on the corners
    graphics.fillRoundedRect(this.x, this.y, this.width, this.height, 8);
    graphics.generateTexture(`${this.key}-bg`);
    graphics.destroy();

    // Generate button object
    const button = this.scene.add
      .sprite(0, 0, `${this.key}-bg`)
      .setInteractive();
    const buttonText = this.scene.add.text(0, 0, text, textStyle);

    // Translate the components by 50% on both axes
    button.x -= this.width / 2;
    button.y -= this.height / 2;
    buttonText.x -= buttonText.width / 2;
    buttonText.y -= buttonText.height / 2;

    button.on("pointerup", onClick);

    this.add(button);
    this.add(buttonText);

    this.scene.add.existing(this);
  }
}
