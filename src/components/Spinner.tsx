import { FC } from 'react';

interface Props {
  text?: string;
  size?: string;
}

export const Spinner: FC<Props> = (props) => {
  const { text = '', size = '5em' } = props;
  const header = text ? <h4>{text}</h4> : null;
  return (
    <div className="spinner">
      {header}
      <div className="loader" style={{ height: size, width: size }} />
    </div>
  );
};
