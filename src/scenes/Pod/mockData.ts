import { WORLD_SIZE } from "./Map";

export const getMockWallData = (size: number) => [
  ...(new Array(size).fill(0).reduce((result, _, index) => {
    const sprites = [];

    if (index % 2 === 1 && index !== WORLD_SIZE - 1) {
      sprites.push(
        {
          type: "top",
          position: { x: index, y: 0 },
        },
        {
          type: "bottom",
          position: { x: index, y: WORLD_SIZE - 1 },
        }
      );
    }

    if (index % 2 === 0 && index !== 0) {
      sprites.push(
        {
          type: "left",
          position: { x: 0, y: index },
        },
        {
          type: "right",
          position: { x: WORLD_SIZE - 1, y: index },
        }
      );
    }

    return [...result, ...sprites];
  }, []) as Array<any>),
  // {
  //   type: "top",
  //   position: {
  //     x: 1,
  //     y: 8,
  //   },
  // },
  // {
  //   type: "top",
  //   position: {
  //     x: 3,
  //     y: 8,
  //   },
  // },
  // {
  //   type: "top",
  //   position: {
  //     x: 5,
  //     y: 8,
  //   },
  // },
  // {
  //   type: "right",
  //   position: {
  //     x: 7,
  //     y: 8,
  //   },
  // },
  // {
  //   type: "right",
  //   position: {
  //     x: 7,
  //     y: 10,
  //   },
  // },
  // {
  //   type: "right",
  //   position: {
  //     x: 7,
  //     y: 12,
  //   },
  // },
  // {
  //   type: "top",
  //   position: {
  //     x: 1,
  //     y: 13,
  //   },
  // },
  // {
  //   type: "top",
  //   position: {
  //     x: 3,
  //     y: 13,
  //   },
  // },
  // {
  //   type: "top",
  //   position: {
  //     x: 5,
  //     y: 13,
  //   },
  // },
];

export const getMockFloorData = (size: number) => {
  return [
    ...(new Array(size).fill(0).reduce((result, _, row) => {
      if (row === 0 || row === size - 1) {
        return [...result];
      }

      const sprites: any[] = [];

      new Array(size).fill(0).forEach((_, col) => {
        if (col === 0 || col === size - 1) {
          return;
        }

        sprites.push({
          type: "ground",
          position: {
            x: col,
            y: row,
          },
        });
      });

      return [...result, ...sprites];
    }, []) as Array<any>),
  ];
};
