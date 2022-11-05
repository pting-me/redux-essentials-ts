/**
 * These are the base DTOs (data-transfer objects).
 *
 * These dictate the expected structure of the objects in the payload.
 *
 * We add a suffix to distinguish between objects coming directly from the server,
 * and objects that we store in the Frontend. This is especially useful if we want to do
 * some sort of mapping. e.g. The API properties are all in snake_case, but we want everything
 * to be camelCase.
 */

export interface PostDto {
  id: string;
  title: string;
  date: string;
  content: string;
  reactions: ReactionsDto;
  user: string;
}

// This is a substitute for enum
// https://fettblog.eu/tidy-typescript-avoid-enums/

const reactionKeys = ['thumbsUp', 'hooray', 'heart', 'rocket', 'eyes'] as const;

export type ReactionKey = typeof reactionKeys[number];

type BaseReactionsDto = {
  [k in ReactionKey]: number;
};

export interface ReactionsDto extends BaseReactionsDto {
  id: string;
}

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  username: string;
}

/**
 * These are the data structures for the API requests and responses.
 *
 * Ideally, these would be automatically generated from some common definition,
 * e.g. Protobuf, Thrift, OpenAPI.
 */

export type GetPostsResponse = PostDto[];

export interface PostPostsRequest {
  title: string;
  content: string;
  user: string;
}

export type PostPostsResponse = PostDto;

export interface GetPostsByPostIdParams {
  postId: string;
}

export type GetPostsByPostIdResponse = PostDto;

export interface PatchPostsByPostIdRequest {
  id?: string;
}

export interface PatchPostsByPostIdParams {
  postId: string;
}

export type PatchPostsByPostIdResponse = PostDto;

export interface GetPostsByPostIdCommentsParams {
  postId: string;
}

export interface PostPostsByPostIdReactionsRequest {
  reaction: string;
}
export interface PostPostsByPostIdReactionsParams {
  postId: string;
}

export type PostPostsByPostIdReactionsResponse = PostDto;

export type GetUsersResponse = PostDto[];

/**
 * Custom types and narrowing functions
 */

export const isReactionKey = (s: string): s is ReactionKey => {
  return (reactionKeys as unknown as string[]).includes(s);
};
