import { FC } from 'react';
import { Link } from 'react-router-dom';

export const Navbar: FC = () => {
  return (
    <nav>
      <section>
        <h1>Redux Essentials Example</h1>

        <div className="navContent">
          <div className="navLinks">
            <div className="navLinks">
              <Link to="/">Posts</Link>
            </div>
          </div>
        </div>
      </section>
    </nav>
  );
};
