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

    map.createLayer("Tile Layer 1", blackTileset, 0, 0);

    const wallsLayer = map.createLayer("Tile Layer 2", fenceTileset, 0, 0);
    wallsLayer.setCollisionByProperty({ collides: true });

    // @ts-ignore
    this.player = this.add.spine(200, 200, "ghost", "idle", true);
    this.player.scale = 0.3;
    this.physics.add.existing(this.player);

    this.physics.add.collider(this.player, wallsLayer);

    this.cameras.main.startFollow(this.player, true);
  }

  update() {
    if (!this.cursors || !this.player) {
      return;
    }

    const speed = 100;
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
