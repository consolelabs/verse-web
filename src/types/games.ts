export interface MinigamePublisher {
  website: string;
  updated_at: string;
  name: string;
  inserted_at: string;
  id: string;
  eth_address: string;
  country: string;
}
export interface Minigame {
  version: string;
  updated_at: string;
  thumbnail: string;
  tags: string[];
  status: string;
  runner_url: string;
  publisher: MinigamePublisher;
  platform: string;
  name: string;
  inserted_at: string;
  id: string;
  icon: string;
  description: string;
}
