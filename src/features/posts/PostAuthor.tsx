import { FC } from 'react';
import { useAppSelector } from '../../app-lib/hooks';

interface Props {
  userId: string;
}

export const PostAuthor: FC<Props> = (props) => {
  const { userId } = props;

  const author = useAppSelector((state) =>
    state.users.find((user) => user.id === userId)
  );

  return <span>by {author ? author.name : 'Unknown author'}</span>;
};
