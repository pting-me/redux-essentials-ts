export interface User {
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  username?: string;
  posts?: Post[];
}

export interface Post {
  id?: string;
  title?: string;
  date?: string;
  content?: string;
  reactions?: Reaction;
  comments?: Comment[];
  user?: User;
}

export interface Comment {
  id?: string;
  date?: string;
  text?: string;
  post?: Post;
}

export interface Reaction {
  id?: string;
  thumbsUp?: number;
  hooray?: number;
  heart?: number;
  rocket?: number;
  eyes?: number;
  post?: Post;
}
