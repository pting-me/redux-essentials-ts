import { FC } from 'react';
import { useAppSelector } from '../../app-lib/hooks';
import { selectUserById } from '../users/usersSlice';

interface Props {
  userId: string;
}

export const PostAuthor: FC<Props> = (props) => {
  const { userId } = props;

  const author = useAppSelector((state) => selectUserById(state, userId));

  return <span>by {author ? author.name : 'Unknown author'}</span>;
};
