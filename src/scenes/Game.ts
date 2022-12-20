import Phaser from "phaser";

export default class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private player!: Phaser.Physics.Arcade.Sprite;

  constructor() {
    super("game");
  }

  preload() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    const map = this.make.tilemap({
      key: "map",
      tileWidth: 16,
      tileHeight: 16,
    });

    const blackTileset = map.addTilesetImage("BlackTile", "BlackTile");
    const fenceTileset = map.addTilesetImage("FenceCyber", "FenceCyber");

    map.createLayer("Tile Layer 1", blackTileset, 0, 0);

    const wallsLayer = map.createLayer("Tile Layer 2", fenceTileset, 0, 0);
    wallsLayer.setCollisionByProperty({ collides: true });

    const debugGraphics = this.add.graphics().setAlpha(0.7);
    wallsLayer.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 234, 48, 100),
      faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    });

    this.player = this.physics.add.sprite(200, 200, "player", "frames/00.png");
    this.player.scale = 3;
    this.player.body.setSize(
      this.player.width * 0.67,
      this.player.height * 0.67
    );

    this.anims.create({
      key: "player-idle",
      frames: this.anims.generateFrameNames("player", {
        prefix: "frames/0",
        start: 0,
        end: 3,
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 10,
    });

    this.anims.create({
      key: "player-move",
      frames: this.anims.generateFrameNames("player", {
        prefix: "frames/0",
        start: 4,
        end: 9,
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 10,
    });

    this.player.anims.play("player-idle");

    this.physics.add.collider(this.player, wallsLayer);

    this.cameras.main.startFollow(this.player, true);
  }

  update(t: number, dt: number) {
    if (!this.cursors || !this.player) {
      return;
    }

    const speed = 100;
    if (
      this.cursors.up?.isDown ||
      this.cursors.down?.isDown ||
      this.cursors.left?.isDown ||
      this.cursors.right?.isDown
    ) {
      this.player.anims.play("player-move", true);

      let horizontalVelocity = 0;
      let verticalVelocity = 0;

      if (this.cursors.left?.isDown) {
        horizontalVelocity = -speed;
      } else if (this.cursors.right?.isDown) {
        horizontalVelocity = speed;
      }

      if (this.cursors.up?.isDown) {
        verticalVelocity = -speed;
      } else if (this.cursors.down?.isDown) {
        verticalVelocity = speed;
      }

      this.player.setVelocity(horizontalVelocity, verticalVelocity);
    } else {
      this.player.anims.play("player-idle", true);
      this.player.setVelocity(0, 0);
    }
  }
}
