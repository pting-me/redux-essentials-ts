import { parseISO, formatDistanceToNow } from 'date-fns';
import { FC } from 'react';

interface Props {
  timestamp: string;
}

export const TimeAgo: FC<Props> = (props) => {
  const { timestamp } = props;

  let timeAgo = '';
  if (timestamp) {
    const date = parseISO(timestamp);
    const timePeriod = formatDistanceToNow(date);
    timeAgo = `${timePeriod} ago`;
  }

  return (
    <span title={timestamp}>
      &nbsp; <i>{timeAgo}</i>
    </span>
  );
};
