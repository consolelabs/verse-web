export default function Inventory() {
  return (
    <div className="flex-1 flex flex-col max-h-600px max-w-1000px self-center w-full">
      <div className="flex text-white -mb-1 ml-2 gap-x-1">
        <button className="text-sm bg-#2D2D45 rounded-t-lg px-3 py-1 pb-2">
          Pod Town
        </button>
        <button className="text-sm bg-#1E1B2F rounded-t-lg px-3 py-1 pb-2">
          DOTA 2
        </button>
      </div>
      <div className="flex-1 relative z-10 rounded-xl border-2 border-black pb-1 bg-#19162A overflow-hidden">
        <div className="p-2 bg-#2D2D45 h-full rounded-b-xl border-b-2 border-b-black">
          <div className="overflow-hidden rounded-xl border-1.5 border-#2FD4D640 flex h-full">
            <ul className="bg-#1E1B2F w-200px p-2 overflow-auto gap-y-2 flex flex-col">
              <li
                style={{
                  background: "linear-gradient(45deg, #EF3EFF, #2FD4D6)",
                }}
                className="p-0.25 rounded-lg flex"
              >
                <button className="flex-1 flex bg-#2D2D45 rounded-lg items-center px-2 py-0.5">
                  <img
                    src="/assets/images/inventory.png"
                    className="flex-shrink-0 w-10 h-10"
                  />
                  <span className="ml-1 text-left flex-1 text-white text-sm">
                    All Items
                  </span>
                  <span className="flex-shrink-0 text-gray text-xs">55</span>
                </button>
              </li>
              <li className="p-0.25 rounded-lg flex">
                <button className="flex-1 flex bg-#2D2D45 rounded-lg items-center px-2 py-0.5">
                  <img
                    src="/assets/images/pod.png"
                    className="flex-shrink-0 w-10 h-10"
                  />
                  <span className="ml-1 text-left flex-1 text-white text-sm">
                    Pod
                  </span>
                  <span className="flex-shrink-0 text-gray text-xs">5</span>
                </button>
              </li>
            </ul>
            <div className="flex-1 flex flex-col p-2 px-6">
              <div className="grid grid-cols-5 grid-rows-auto grid-gap-3">
                {new Array(13).fill(0).map((_, i) => {
                  return (
                    <button
                      type="button"
                      key={i}
                      className="p-1 pb-0 flex flex-col rounded-lg bg-#1E1B2F hover:bg-#7183A1"
                    >
                      <div className="rounded-lg overflow-hidden bg-#CCD9D6 p-1 aspect-square">
                        <img
                          src="/assets/images/leaderboard.png"
                          className="rounded-lg"
                        />
                      </div>
                      <span className="text-white mt-1 text-sm">$12.56</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-x-2 mt-auto items-center mx-auto">
                <button className="flex text-gray text-sm p-1.5 items-center border border-#363347 bg-#151321 rounded-lg gap-x-2">
                  <div className="i-heroicons-chevron-left-solid" />
                  <span>Prev</span>
                </button>
                <button className="bg-#1D1D31 rounded-lg text-#EF3EFF text-sm h-full aspect-square border border-#363347">
                  1
                </button>
                <button className="flex text-gray text-sm p-1.5 items-center border border-#363347 bg-#151321 rounded-lg gap-x-2">
                  <span>Next</span>
                  <div className="i-heroicons-chevron-right-solid" />
                </button>
              </div>
            </div>
            <div className="flex m-3 bg-#1E1B2F rounded-xl w-250px">
              {/* <div className="flex flex-col items-center justify-center p-5"> */}
              {/*   <img src="/assets/images/empty.png" /> */}
              {/*   <span className="text-gray text-center"> */}
              {/*     You have no items in your inventory */}
              {/*   </span> */}
              {/* </div> */}
              <div className="flex flex-col p-5 overflow-auto">
                <img
                  src="/assets/images/leaderboard.png"
                  className="aspect-square mx-auto"
                />
                <p className="text-white font-semibold">
                  1st place badge of the Tripod tournament
                </p>
                <span className="mt-3 text-sm text-white font-semibold">
                  $12.56
                </span>
                <p className="text-gray text-sm">
                  Lorem ipsum dolor sit amet, officia excepteur ex fugiat
                  reprehenderit enim labore culpa sint ad nisi Lorem pariatur
                  mollit ex esse exercitation amet. Nisi anim cupidatat
                  excepteur officia. Reprehenderit nostrud nostrud ipsum Lorem
                  est aliquip amet voluptate voluptate dolor minim nulla est
                  proident. Nostrud officia pariatur ut officia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
