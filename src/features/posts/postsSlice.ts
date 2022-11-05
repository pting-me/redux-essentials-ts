import {
  createSlice,
  PayloadAction,
  createAsyncThunk,
  createSelector,
  createEntityAdapter,
} from '@reduxjs/toolkit';
import { RootState } from '../../app-lib/store';
import { client } from '../../api/client';

import {
  GetPostsResponse,
  PostDto,
  PostPostsRequest,
  PostPostsResponse,
  ReactionKey,
  ReactionsDto,
} from '../../types';

export interface Reactions extends Omit<ReactionsDto, 'id'> {}

export interface Post extends Omit<PostDto, 'reactions'> {
  reactions: Reactions;
}

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

const postsAdapter = createEntityAdapter<Post>({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
});

const initialState = postsAdapter.getInitialState({
  status: 'idle',
  error: null as null | string,
});

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
    reactionAdded(state, action: PayloadAction<ReactionAddedPayload, string>) {
      const { postId, reaction } = action.payload;
      const existingPost = state.entities[postId];

      if (existingPost) {
        existingPost.reactions[reaction as ReactionKey]++;
      }
    },
    postUpdated(state, action) {
      const { id, title, content } = action.payload;
      const existingPost = state.entities[id];
      if (existingPost) {
        existingPost.title = title;
        existingPost.content = content;
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
        // Use the `upsertMany` reducer as a mutating update utility
        postsAdapter.upsertMany(state, action.payload);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.error.message ?? 'Unknown error from fetching posts.';
      })
      // Use the `addOne` reducer for the fulfilled case
      .addCase(addNewPost.fulfilled, postsAdapter.addOne);
  },
});

export const { postUpdated, reactionAdded } = postsSlice.actions;

export default postsSlice.reducer;

// Export the customized selectors for this adapter using `getSelectors`
export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
  // Pass in a selector that returns the posts slice of state
} = postsAdapter.getSelectors((state: RootState) => state.posts);

export const selectPostsByUser = createSelector(
  [selectAllPosts, (state, userId) => userId],
  (posts, userId) => posts.filter((post) => post.user === userId)
);
