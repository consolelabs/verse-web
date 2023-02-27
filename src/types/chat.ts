export type MessageItem =
  | {
      id: number;
      author: MessageAuthor;
      content: string;
      timestamp: number;
      isDivider: false;
    }
  | {
      isDivider: true;
      text: string;
    };

export interface MessageAuthor {
  address: string;
  bot: boolean;
  username: string;
}
