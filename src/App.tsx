import { FC } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { Navbar } from './app-lib/Navbar';
import { AddPostForm } from './features/posts/AddPostForm';
import { PostsList } from './features/posts/PostsList';

const App: FC = () => {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <AddPostForm />
                <PostsList />
              </>
            }
          />
          <Route path="/*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
