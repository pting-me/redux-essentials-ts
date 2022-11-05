import { EntityId } from '@reduxjs/toolkit';
import { FC, memo, ReactNode, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app-lib/hooks';
import { Spinner } from '../../components/Spinner';
import { PostAuthor } from './PostAuthor';
import { fetchPosts, selectPostById, selectPostIds } from './postsSlice';
import { ReactionButtons } from './ReactionButtons';
import { TimeAgo } from './TimeAgo';

interface PostExcerptProps {
  postId: EntityId;
}

const BasePostExcerpt: FC<PostExcerptProps> = (props) => {
  const { postId } = props;
  const post = useAppSelector((state) => selectPostById(state, postId));

  if (!post) {
    return null;
  }

  return (
    <article className="post-excerpt">
      <h3>{post.title}</h3>
      <div>
        <PostAuthor userId={post.user} />
        <TimeAgo timestamp={post.date} />
      </div>
      <p className="post-content">{post.content.substring(0, 100)}</p>

      <ReactionButtons post={post} />
      <Link to={`/posts/${post.id}`} className="button muted-button">
        View Post
      </Link>
    </article>
  );
};

const PostExcerpt = memo(BasePostExcerpt);

export const PostsList: FC = () => {
  const dispatch = useAppDispatch();
  const orderedPostIds = useAppSelector(selectPostIds);

  const postStatus = useAppSelector((state) => state.posts.status);
  const error = useAppSelector((state) => state.posts.error);

  useEffect(() => {
    if (postStatus === 'idle') {
      dispatch(fetchPosts());
    }
  }, [postStatus, dispatch]);

  let content: ReactNode;

  if (postStatus === 'loading') {
    content = <Spinner text="Loading..." />;
  } else if (postStatus === 'succeeded') {
    content = orderedPostIds.map((postId) => (
      <PostExcerpt key={postId} postId={postId} />
    ));
  } else if (postStatus === 'failed') {
    content = <div>{error}</div>;
  }

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {content}
    </section>
  );
};
