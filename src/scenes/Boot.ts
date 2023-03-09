// import { TitleBg } from "objects/TitleBg";
import Phaser from "phaser";
import { SceneKey } from "../constants/scenes";

enum TileMapType {
  Grass = 1,
  Ground = 2,
  Wall = 3,
}

// enum ObjectType {
//   Tree = 1,
//   Portal = 2,
//   Exterior = 3,
//   Billboard = 4,
//   Stone = 5,
//   Light = 6,
//   Building = 7,
//   Collider = 8,
//   Signboard = 9,
//   Fencing = 10,
//   Canal = 11,
//   CustomObject = 12,
// }

const tileSize = 48;
const TILESET_GID_ASSIGNMENT_COMPLETE = "tileset_gid_assignment_complete";
export default class Boot extends Phaser.Scene {
  public mapData: any;

  public map!: Phaser.Tilemaps.Tilemap;
  public tilesets!: any[];

  constructor() {
    super({
      key: SceneKey.BOOT,
    });
  }

  assignTilesetGID() {
    // GID is global ID - the global index of the tiles from a tileset in the world.
    // E.g. Providing we have 2 tilesets, the first one will always begin with gid = 1.
    // If the first one is a 3x3 tileset, then the id of the tiles it contains will begin from 1 -> 9,
    // calculating from left -> right + top -> down.
    // That means for the 2nd tileset, its first tile's gid will be 10. KEEP IN MIND that the first tile's local
    // id (within the 2nd tileset) is still 1.
    // Basically we have this formula: gid = firstgid + local_id
    let firstgid = 1;

    this.tilesets.forEach((tileset) => {
      tileset.firstgid = firstgid;

      // Get the loaded image of this tileset
      const loadedTexture = this.textures.get(tileset.name);
      const sourceImage = loadedTexture.source[0];

      // Calculate the firstgid of the next tileset
      const cols = sourceImage.width / tileSize;
      const rows = sourceImage.height / tileSize;
      const tileCount = cols * rows;
      firstgid += tileCount;
    });

    this.events.emit(TILESET_GID_ASSIGNMENT_COMPLETE);
  }

  preload() {
    // this.load.audio("background-audio", "/assets/audio/street-food.mp3");
    // this.load.audio("start-game-audio", "/assets/audio/start-game.mp3");
    // this.load.image("title-screen-bg", "/assets/images/title-screen-bg.jpeg");
    // this.load.image("logo", "/assets/images/logo.png");
    // this.load.image("consolelabslogo", "/assets/images/consolelabslogo.png");

    // DEMO LOGIC, SHOULD NOT TAKE THIS AS GRANTED
    fetch("/maps/demo/mapdata.json")
      .then((res) => res.json())
      .then((data) => {
        this.mapData = data;

        // Get world size
        const worldBounds = {
          max: {
            x: 0,
            y: 0,
          },
          min: {
            x: 0,
            y: 0,
          },
        };

        const tilesets: any[] = [];
        data.tilemaps_data.forEach((tilemap: any) => {
          // As there are no world sizes specified, we need to identify
          // the bottom-left & top-right point of the world based on
          // the bounds of these tilemaps
          worldBounds.min.x = Math.min(
            worldBounds.min.x,
            tilemap.bounds_position.x
          );
          worldBounds.max.x = Math.max(
            worldBounds.max.x,
            tilemap.bounds_size.x
          );
          worldBounds.min.y = Math.min(
            worldBounds.min.y,
            tilemap.bounds_position.y
          );
          worldBounds.max.y = Math.max(
            worldBounds.max.y,
            tilemap.bounds_size.y
          );

          // Each tilemap has an array of tile_data, which is actually the tiles
          // We need to loop over them and find all tilesets that the game needs
          // to load
          tilemap.tile_data.forEach((tile: any) => {
            const tilesetGroup = TileMapType[tile.type];
            const tilesetImage = tile.name.split("_")[0];
            const tilesetName = `${tilesetGroup}/${tilesetImage}`;

            if (tilesets.every((tileset) => tileset.name !== tilesetName)) {
              tilesets.push({
                name: tilesetName,
                image: tilesetName,
                tileWidth: tileSize,
                tileHeight: tileSize,
                tileMargin: 0,
                tileSpacing: 0,
              });
            }
          });
        });

        // Create the tilemap object
        // const worldWidth = worldBounds.max.x - worldBounds.min.x;
        // const worldHeight = worldBounds.max.y - worldBounds.min.y;
        const worldWidth = 12;
        const worldHeight = 10;
        const map = this.make.tilemap({
          tileWidth: tileSize,
          tileHeight: tileSize,
          width: worldWidth,
          height: worldHeight,
        });

        this.map = map;
        this.tilesets = tilesets;

        // Now begin loading the tilesets & we will continue with the processing logic
        // after all the tilesets have been loaded
        tilesets.forEach((tileset) => {
          this.load.image(
            tileset.name,
            `/maps/demo/Tilemap/${tileset.name}.png`
          );
        });

        this.load.once(Phaser.Loader.Events.COMPLETE, () =>
          this.assignTilesetGID()
        );
        this.load.start();
      });
  }

  create() {
    // new TitleBg({ scene: this });

    // After tileset gid assignment is complete, we now have all the needed data
    // to build the tilemap layers
    this.events.on(TILESET_GID_ASSIGNMENT_COMPLETE, () => {
      // Add all tilesets to the tilemap
      this.tilesets.forEach((tileset) => {
        this.map.addTilesetImage(
          tileset.name,
          tileset.name,
          tileset.tileWidth,
          tileset.tileWidth,
          0,
          0,
          tileset.firstgid
        );
      });

      const tilesetKeys = this.tilesets.map((tileset) => tileset.name);

      // Each tilemap in the original mapData json is actually a layer
      // (probably need to change this from Unity side)
      this.mapData.tilemaps_data.forEach((layer: any, index: number) => {
        const tilesData = new Array(this.map.height)
          .fill(null)
          .map(() => new Array(this.map.width).fill(0));

        // Loop over the tiles
        layer.tile_data.forEach((tile: any) => {
          const tilesetGroup = TileMapType[tile.type];
          const [tilesetImage, tileLocalIndex] = tile.name.split("_");
          const tilesetName = `${tilesetGroup}/${tilesetImage}`;
          const tileset = this.tilesets.find(
            (tileset) => tileset.name === tilesetName
          );
          const tileGID = tileset.firstgid + Number(tileLocalIndex);

          // Loop over the positions that this tile is being used.
          // We'll have to do some translation here, because the position is being calculated
          // from left -> right + bottom -> top (meaning the origin is at the bottom-left).
          // Whereas for Phaser's tilemap we need the origin to be top-left.
          // The original transformation formula is: index = x * width + y
          // (Should be index = x * height + y, because x * width will overflow)
          tile.pos.forEach((index: number) => {
            // Get the unity coords
            const x = Math.floor(index / this.map.width);
            const y = index % this.map.width;

            // Do the transformation
            const newX = x;
            const newY = this.map.height - y;

            if (tilesData[newY]) {
              tilesData[newY][newX] = tileGID;
            }
          });
        });

        const phaserLayer = this.map.createBlankLayer(
          `layer_${index}`,
          tilesetKeys,
          0,
          0,
          this.map.width,
          this.map.height,
          tileSize,
          tileSize
        );

        for (let row = 0; row < this.map.height; row++) {
          for (let col = 0; col < this.map.width; col++) {
            phaserLayer.putTileAt(tilesData[row][col], col, row);
          }
        }
      });
    });
  }
}
