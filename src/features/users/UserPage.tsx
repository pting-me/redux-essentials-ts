import { FC } from 'react';

import { Link, useParams } from 'react-router-dom';

import { selectUserById } from '../users/usersSlice';
import { selectPostsByUser } from '../posts/postsSlice';
import { useAppSelector } from '../../app-lib/hooks';

export const UserPage: FC = () => {
  const { userId = '' } = useParams();

  const user = useAppSelector((state) => selectUserById(state, userId));
  const postsForUser = useAppSelector((state) =>
    selectPostsByUser(state, userId)
  );

  const postTitles = postsForUser.map((post) => (
    <li key={post.id}>
      <Link to={`/posts/${post.id}`}>{post.title}</Link>
    </li>
  ));

  return (
    <section>
      <h2>{user?.name ?? 'No such user.'}</h2>

      <ul>{postTitles}</ul>
    </section>
  );
};
