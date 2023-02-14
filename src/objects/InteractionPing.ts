import { TILE_SIZE } from "../constants";

export class InteractionPing {
  public dot: Phaser.GameObjects.Arc;
  public ping: Phaser.GameObjects.Arc;
  public text: Phaser.GameObjects.Text;

  constructor(public scene: Phaser.Scene, public x: number, public y: number) {
    const depth = y / TILE_SIZE;

    this.dot = scene.add
      .arc(x, y, 10, 0, 360, undefined, 0xf2f2f2)
      .setDepth(depth);
    this.ping = scene.add
      .arc(x, y, 10, 0, 360, undefined, 0xf2f2f2)
      .setDepth(depth);

    this.text = scene.add
      .text(x, y, "?", {
        fontSize: "14px",
        color: "#000000",
      })
      .setDepth(depth);
    this.text.setOrigin(0.5, 0.5);

    scene.events.on("update", this.update, this);
  }

  update(time: number) {
    if (this.ping) {
      this.ping.setScale(Math.sin(time * 0.002) * 2);
      this.ping.setAlpha(Math.sin(time * 0.004) / 2);
    }
  }
}
