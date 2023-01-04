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
    depth?: number;
    onClick?: () => void;
  }) {
    const {
      scene,
      x,
      y,
      width = 100,
      height = 50,
      key = "btn",
      text,
      depth = 1000,
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
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x000000, 1);
    // 8px radius on the corners
    // Translate the components by 50% on both axes
    graphics.fillRoundedRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height,
      8
    );
    graphics.setScrollFactor(0);
    graphics.setDepth(depth);

    const buttonText = this.scene.add.text(0, 0, text, textStyle);
    // Translate the components by 50% on both axes
    buttonText.x -= buttonText.width / 2;
    buttonText.y -= buttonText.height / 2;

    this.add(buttonText);
    this.setDepth(depth);
    this.setScrollFactor(0);
    this.setInteractive();

    // Change bg color on click captured
    this.on("pointerdown", () => {
      graphics.fillStyle(0x444444, 1);
      graphics.fillRoundedRect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height,
        8
      );
    });

    // Change bg color back on click released
    this.on("pointerup", () => {
      graphics.fillStyle(0x000000, 1);
      graphics.fillRoundedRect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height,
        8
      );
      onClick();
    });

    this.scene.add.existing(this);
  }
}
