import { CharacterSpine } from "./character";

export interface NFT {
  amount: string;
  collection_name: string;
  description: string;
  image: string;
  name: string;
  rarity: string;
  token_address: string;
  token_id: string;
  type?: CharacterSpine;
}
