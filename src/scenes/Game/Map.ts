import Phaser from "phaser";
import { Player } from "../../characters/player";
import { Character } from "../../characters/character";
import { PROD, TILE_SIZE } from "../../constants";
import { Sprite } from "../../objects/Sprite";
import GameInteraction from "./Interaction";
import { SceneKey } from "../../constants/scenes";
import { IBound } from "matter";
import { useGameState } from "stores/game";
import { TitleBg } from "objects/TitleBg";
import { AdImageSprite } from "objects/AdImageSprite";
import { ObjectLayerManager } from "objects/ObjectLayerManager";

const spawnPoint = {
  x: 5000,
  y: 5600,
};

export default class GameMap extends Phaser.Scene {
  player!: Player;
  map!: Phaser.Tilemaps.Tilemap;
  bounds!: IBound;
  private bg!: TitleBg;

  constructor() {
    super({
      key: SceneKey.GAME,
      physics: {
        matter: {
          gravity: { y: 0 },
          debug: !PROD,
          // @ts-ignore
          debugShowBody: true,
          debugBodyColor: 0x0000ff,
        },
      },
    });
  }

  preload() {
    this.bg = new TitleBg({ scene: this });
    this.bg.instance.setDepth(9999);
    // Launch interaction scene
    const interactionScene = this.scene.get(
      SceneKey.GAME_INTERACTION
    ) as GameInteraction;
    this.scene.launch(interactionScene);

    // Launch dialog scene
    this.scene.launch(SceneKey.GAME_DIALOGUE);

    const data = this.scene.settings.data as Record<string, any>;
    const { main } = this.cache.json.get("config");

    // Now load assets
    const tilesetSource = Object.fromEntries(
      this.cache.tilemap
        .get(data?.main ?? main)
        ?.data.tilesets.map((ts: any) => [ts.name, ts.image]) ?? []
    );

    this.map = this.make.tilemap({
      key: data?.main ?? main,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    const { layers = [], tilesets = [] } = this.map;

    // Load tilesets
    tilesets.forEach((tileset) => {
      // Do nothing if texture was already loaded
      if (this.textures.exists(tileset.name)) {
        return;
      }

      this.load.image(tileset.name, `/tiles/${tilesetSource[tileset.name]}`);
    });

    // Load the sprite in each layer
    layers.forEach((layer) => {
      layer.data.forEach((row) => {
        row.forEach((tile) => {
          const spriteImage = tile.properties.spriteImage;
          const spriteJSON = tile.properties.spriteJSON ?? "";
          const spriteKey = spriteJSON.split("/").pop()?.slice(0, -5);
          const isMultiAtlas = tile.properties.multiatlas ?? false;
          if (spriteKey && spriteJSON) {
            // Do nothing if texture was already loaded
            if (this.textures.exists(spriteKey)) {
              return;
            }

            if (isMultiAtlas) {
              const path = spriteJSON.split("/");
              path.pop();
              path.unshift("tiles");
              this.load.multiatlas(
                spriteKey,
                `/tiles/${spriteJSON}`,
                path.join("/")
              );
            } else {
              this.load.atlas(
                spriteKey,
                `/tiles/${spriteImage}`,
                `/tiles/${spriteJSON}`
              );
            }
          }
        });
      });
    });

    // Load ads
    const ads = useGameState.getState().ads || [];
    this.map.getObjectLayer("Ads").objects.forEach((object) => {
      const ad = ads.find((ad) => ad.code === object.name);

      if (object.polygon && ad) {
        // @ts-ignore
        new AdImageSprite(this, ad, object);
      }
    });

    // Set world bounds
    this.bounds = {
      min: { x: 0, y: 0 },
      max: { x: this.map.widthInPixels, y: this.map.heightInPixels },
    };
    this.matter.world.setBounds(
      this.bounds.min.x,
      this.bounds.min.y,
      this.bounds.max.x,
      this.bounds.max.y
    );
  }

  create() {
    const objectLayerManager = new ObjectLayerManager(this);

    const interactionMapping = this.cache.json.get("interaction");
    const { objects = [], layers = [], tilesets = [] } = this.map;
    objects.forEach((layer) => {
      const layerPropsRaw = layer.properties;
      const layerProps = Array.isArray(layerPropsRaw)
        ? Object.fromEntries(layerPropsRaw.map((p) => [p.name, p.value]))
        : {};
      if (layerProps.interactive) {
        objectLayerManager.createInteractiveLayer(
          layer.objects,
          interactionMapping
        );
      } else {
        objectLayerManager.createCollisionLayer(layer.objects);
      }
    });

    // Add loaded tilesets to the map
    tilesets.forEach((tileset) => this.map.addTilesetImage(tileset.name));

    const createdLayers: Array<Phaser.Tilemaps.TilemapLayer> = [];
    // Loop through the layers & create them (& the sprites they refer to)
    layers.forEach((layer) => {
      const isStatic =
        // @ts-ignore
        layer.properties.find((p) => p.name === "static")?.value ?? false;

      const tilesets =
        // @ts-ignore
        layer.properties.find((p) => p.name === "tilesets")?.value ?? "";

      if (tilesets) {
        createdLayers.push(
          this.map.createLayer(layer.name, tilesets.split(","), 0, 0)
        );
      }

      if (!isStatic) {
        layer.data.forEach((row, y) => {
          row.forEach((tile, x) => {
            const spriteJSON = tile.properties.spriteJSON ?? "";
            const spriteKey = spriteJSON.split("/").pop()?.slice(0, -5);
            if (spriteJSON) {
              const atlas = this.textures.get(spriteKey);
              // phaser auto add a "BASE" frame so we need to subtract 1 more
              const animated = atlas.frameTotal - 1 > 1;

              Sprite.add({
                game: this,
                key: spriteKey,
                anchor: { left: x, bottom: y },
                animated,
                duration: Number(tile.properties.duration),
                depthOffset: tile.properties.depthOffset,
              });
            }
          });
        });
      }
    });

    // Load characters
    const { players, account, previewChar } = useGameState.getState();
    let player = players[0];
    const followees = players.slice(1);
    if (!player) {
      player = previewChar;
    }
    if (player) {
      let followee: Character | undefined = undefined;
      followees.reverse().forEach((f) => {
        followee = new Character({
          followee,
          scene: this,
          spine: f.type,
          id: f.token_id,
          spineConfig: {
            scale: 0.4,
          },
          animSuffix: f.animSuffix,
          collection: f.token_address,
          urls: f.urls,
        });
      });
      this.player = new Player({
        followee,
        name: `${account?.slice(0, 5)}...${account?.slice(-5)}`,
        scene: this,
        spine: player.type,
        id: player.token_id,
        spineConfig: {
          ...spawnPoint,
          scale: 0.4,
        },
        animSuffix: player.animSuffix,
        collection: player.token_address,
        urls: player.urls,
      });

      this.player.character?.loadPromise.then((instance) => {
        this.matter.add.gameObject(instance);
        instance.setFixedRotation();

        this.cameras.main
          .once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.bg.instance.destroy(true);

            // Follow the first character
            this.cameras.main.startFollow(instance, true, 0.05, 0.05);

            // Fade in
            this.cameras.main
              .once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
                useGameState.setState({ activeSceneKey: SceneKey.GAME });

                this.scene.launch(SceneKey.MINIMAP, {
                  player: this.player,
                  layers: createdLayers,
                  w: this.map.widthInPixels,
                  h: this.map.heightInPixels,
                });
              })
              .fadeIn(200);
          })
          .fadeOut(200);
      });
    }
  }

  update() {
    if (!this.player) {
      return;
    }

    this.player.update();
  }
}
