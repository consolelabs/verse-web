import Phaser from "phaser";

export default class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private player!: any;
  private keys!: any;

  constructor() {
    super("game");
  }

  preload() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D");

    // @ts-ignore
    this.load.spine("ghost", "assets/skeleton.json", "assets/skeleton.atlas");
  }

  create() {
    const map = this.make.tilemap({
      key: "map",
      tileWidth: 16,
      tileHeight: 16,
    });

    const blackTileset = map.addTilesetImage("BlackTile", "BlackTile");
    const fenceTileset = map.addTilesetImage("FenceCyber", "FenceCyber");

    map.createLayer("Ground", blackTileset, 0, 0);

    const wallsLayer = map.createLayer("Walls", fenceTileset, 0, 0);
    wallsLayer.setCollisionByProperty({ collides: true });

    // @ts-ignore
    this.player = this.add.spine(200, 200, "ghost", "idle", true);
    this.player.scale = 0.3;
    this.physics.add.existing(this.player);

    this.physics.add.collider(this.player, wallsLayer);

    this.cameras.main.startFollow(this.player, true);

    // Test Building
    const building = this.add.sprite(600, 600, "erc", "frames/00.png");
    this.anims.create({
      key: "building-idle",
      frames: this.anims.generateFrameNames("erc", {
        prefix: "frames/",
        start: 0,
        end: 19,
        suffix: ".png",
        zeroPad: 2,
      }),
      repeat: -1,
      duration: 3000,
    });
    building.anims.play("building-idle");
    this.physics.add.existing(building, true);
    this.physics.add.collider(building, this.player);
  }

  update() {
    if (!this.cursors || !this.player) {
      return;
    }

    const speed = 200;
    if (
      this.cursors.up?.isDown ||
      this.cursors.down?.isDown ||
      this.cursors.left?.isDown ||
      this.cursors.right?.isDown ||
      this.keys.W.isDown ||
      this.keys.A.isDown ||
      this.keys.S.isDown ||
      this.keys.D.isDown
    ) {
      let horizontalVelocity = 0;
      let verticalVelocity = 0;

      if (this.cursors.left?.isDown || this.keys.A.isDown) {
        horizontalVelocity = -speed;
      } else if (this.cursors.right?.isDown || this.keys.D.isDown) {
        horizontalVelocity = speed;
      }

      if (this.cursors.up?.isDown || this.keys.W.isDown) {
        verticalVelocity = -speed;
      } else if (this.cursors.down?.isDown || this.keys.S.isDown) {
        verticalVelocity = speed;
      }

      this.player.body.setVelocity(horizontalVelocity, verticalVelocity);
    } else {
      this.player.body.setVelocity(0, 0);
    }
  }
}
