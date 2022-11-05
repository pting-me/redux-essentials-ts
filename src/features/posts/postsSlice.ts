import {
  createSlice,
  nanoid,
  PayloadAction,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { RootState } from '../../app-lib/store';
import { client } from '../../api/client';

import {
  GetPostsResponse,
  isReactionKey,
  PostDto,
  PostPostsRequest,
  PostPostsResponse,
  ReactionsDto,
} from '../../types';

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

interface PostsState {
  posts: Post[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  status: 'idle',
  error: null,
};

export const fetchPosts = createAsyncThunk<GetPostsResponse>(
  'posts/fetchPosts',
  async () => {
    const response = await client.get('/fakeApi/posts');
    return response.data;
  }
);

export const addNewPost = createAsyncThunk<PostPostsResponse, PostPostsRequest>(
  'posts/addNewPost',
  // The payload creator receives the partial `{title, content, user}` object
  async (initialPost) => {
    // We send the initial data to the fake API server
    const response = await client.post('/fakeApi/posts', initialPost);
    // The response includes the complete post object, including unique ID
    return response.data;
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: {
      reducer(state, action: PayloadAction<PostAddedPayload, string>) {
        state.posts.push(action.payload);
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
      const existingPost = state.posts.find((post) => post.id === id);
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

      const existingPost = state.posts.find((post) => post.id === postId);
      if (typeof existingPost?.reactions[reaction] === 'number') {
        existingPost.reactions[reaction]++;
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Add any fetched posts to the array
        state.posts = state.posts.concat(action.payload);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.error.message ?? 'Unknown error from fetching posts.';
      })
      .addCase(addNewPost.fulfilled, (state, action) => {
        // We can directly add the new post object to our posts array
        state.posts.push(action.payload);
      });
  },
});

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions;

export default postsSlice.reducer;

export const selectAllPosts = (state: RootState) => state.posts.posts;

export const selectPostById = (state: RootState, postId: string) =>
  state.posts.posts.find((post) => post.id === postId);
