import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';
import { sub } from 'date-fns';

import { isReactionKey, PostDto, ReactionsDto } from '../../types';

export interface Reactions extends Omit<ReactionsDto, 'id'> {}

export interface Post extends Omit<PostDto, 'reactions'> {
  reactions: Reactions;
}

interface PostAddedPayload extends Post {}

interface ReactionAddedPayload {
  postId: string;
  reaction: string;
}

export const initialReactions: Reactions = {
  thumbsUp: 0,
  hooray: 0,
  heart: 0,
  rocket: 0,
  eyes: 0,
};

const initialState: Post[] = [
  {
    id: '1',
    title: 'First Post!',
    content: 'Hello!',
    user: '0',
    date: sub(new Date(), { minutes: 10 }).toISOString(),
    reactions: { ...initialReactions },
  },
  {
    id: '2',
    title: 'Second Post',
    content: 'More text',
    user: '2',
    date: sub(new Date(), { minutes: 5 }).toISOString(),
    reactions: { ...initialReactions },
  },
];

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: {
      reducer(state, action: PayloadAction<PostAddedPayload, string>) {
        state.push(action.payload);
      },
      prepare(title: string, content: string, userId: string) {
        return {
          payload: {
            id: nanoid(),
            date: new Date().toISOString(),
            title,
            content,
            user: userId,
            reactions: { ...initialReactions },
          },
        };
      },
    },
    postUpdated(state, action) {
      const { id, title, content } = action.payload;
      const existingPost = state.find((post) => post.id === id);
      if (existingPost) {
        existingPost.title = title;
        existingPost.content = content;
      }
    },
    reactionAdded(state, action: PayloadAction<ReactionAddedPayload, string>) {
      const { postId, reaction } = action.payload;

      if (!isReactionKey(reaction)) {
        return;
      }

      const existingPost = state.find((post) => post.id === postId);
      if (typeof existingPost?.reactions[reaction] === 'number') {
        existingPost.reactions[reaction]++;
      }
    },
  },
});

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions;

export default postsSlice.reducer;
