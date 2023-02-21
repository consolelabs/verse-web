export interface MessageItem {
  id: number;
  author: MessageAuthor;
  content: string;
}

export interface MessageAuthor {
  address: string;
  bot: boolean;
  username: string;
}
