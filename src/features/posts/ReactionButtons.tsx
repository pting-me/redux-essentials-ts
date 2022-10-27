import { FC } from 'react';
import { useAppDispatch } from '../../app-lib/hooks';
import { isReactionKey } from '../../types';

import { Post, reactionAdded } from './postsSlice';

const reactionEmoji = {
  thumbsUp: '👍',
  hooray: '🎉',
  heart: '❤️',
  rocket: '🚀',
  eyes: '👀',
};

interface Props {
  post: Post;
}

export const ReactionButtons: FC<Props> = (props) => {
  const { post } = props;
  const dispatch = useAppDispatch();
  const reactionButtons = Object.entries(reactionEmoji).map(([name, emoji]) => {
    return (
      <button
        key={name}
        type="button"
        className="muted-button reaction-button"
        onClick={() =>
          dispatch(reactionAdded({ postId: post.id, reaction: name }))
        }
      >
        {isReactionKey(name) && `${emoji} ${post.reactions[name]}`}
      </button>
    );
  });

  return <div>{reactionButtons}</div>;
};
