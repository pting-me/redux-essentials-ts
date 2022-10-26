import { rest, setupWorker } from 'msw';
import { factory, oneOf, manyOf, primaryKey } from '@mswjs/data';
import { nanoid } from '@reduxjs/toolkit';
import { faker } from '@faker-js/faker';
import seedrandom from 'seedrandom';
import { Client, Server as MockSocketServer } from 'mock-socket';
import type { JsonValue } from 'type-fest';

import { parseISO } from 'date-fns';
import { Post, Reaction } from '../types';

const NUM_USERS = 3;
const POSTS_PER_USER = 3;
const RECENT_NOTIFICATIONS_DAYS = 7;

// Add an extra delay to all endpoints, so loading spinners show up.
const ARTIFICIAL_DELAY_MS = 2000;

/* RNG setup */

// Set up a seeded random number generator, so that we get
// a consistent set of users / entries each time the page loads.
// This can be reset by deleting this localStorage value,
// or turned off by setting `useSeededRNG` to false.
const useSeededRNG = true;

let rng = seedrandom();

if (useSeededRNG) {
  let randomSeedString = localStorage.getItem('randomTimestampSeed');
  let seedDate;

  if (randomSeedString) {
    seedDate = new Date(randomSeedString);
  } else {
    seedDate = new Date();
    randomSeedString = seedDate.toISOString();
    localStorage.setItem('randomTimestampSeed', randomSeedString);
  }

  rng = seedrandom(randomSeedString);
  faker.seed(seedDate.getTime());
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(rng() * (max - min + 1)) + min;
}

const randomFromArray = <T>(array: T[]) => {
  const index = getRandomInt(0, array.length - 1);
  return array[index];
};

/* MSW Data Model Setup */

export const db = factory({
  user: {
    id: primaryKey(nanoid),
    firstName: String,
    lastName: String,
    name: String,
    username: String,
    posts: manyOf('post'),
  },
  post: {
    id: primaryKey(nanoid),
    title: String,
    date: String,
    content: String,
    reactions: oneOf('reaction'),
    comments: manyOf('comment'),
    user: oneOf('user'),
  },
  comment: {
    id: primaryKey(String),
    date: String,
    text: String,
    post: oneOf('post'),
  },
  reaction: {
    id: primaryKey(nanoid),
    thumbsUp: Number,
    hooray: Number,
    heart: Number,
    rocket: Number,
    eyes: Number,
    post: oneOf('post'),
  },
});

type Database = typeof db;

const createUserData = () => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();

  return {
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    username: faker.internet.userName(),
  };
};

const createPostData = <T>(user: T) => {
  return {
    title: faker.lorem.words(),
    date: faker.date.recent(RECENT_NOTIFICATIONS_DAYS).toISOString(),
    user: user,
    content: faker.lorem.paragraphs(),
    reactions: db.reaction.create(),
  };
};

// Create an initial set of users and posts
for (let i = 0; i < NUM_USERS; i++) {
  const author = db.user.create(createUserData());

  for (let j = 0; j < POSTS_PER_USER; j++) {
    const newPost = createPostData(author);
    db.post.create(newPost);
  }
}

const serializePost = (post: Post) => ({
  ...post,
  user: post.user?.id,
});

/* MSW REST API Handlers */

interface PostPostsReq {
  body: {
    content: string;
    user: string;
  };
}

interface GetPostByIdReq {
  params: {
    postId: string;
  };
}

interface PatchPostByIdReq {
  body: {
    id?: string;
  };
  params: {
    postId: string;
  };
}

interface GetPostCommentsByIdReq {
  params: {
    postId: string;
  };
}

interface PostPostReactionsByIdReq {
  body: {
    reaction: keyof Omit<Required<Reaction>, 'id' | 'post'>;
  };
  params: {
    postId: string;
  };
}

export const handlers = [
  rest.get('/fakeApi/posts', function (req, res, ctx) {
    const posts = db.post.getAll().map(serializePost);
    return res(ctx.delay(ARTIFICIAL_DELAY_MS), ctx.json(posts));
  }),
  rest.post('/fakeApi/posts', function (req: PostPostsReq, res, ctx) {
    const requestData = req.body;

    if (requestData.content === 'error') {
      return res(
        ctx.delay(ARTIFICIAL_DELAY_MS),
        ctx.status(500),
        ctx.json('Server error saving this post!')
      );
    }

    const date = new Date().toISOString();
    const user = db.user.findFirst({
      where: { id: { equals: requestData.user } },
    });
    const reactions = db.reaction.create();

    if (!user) {
      return res(ctx.status(404), ctx.json('User not found!'));
    }

    const post = db.post.create({ date, user, reactions });
    return res(ctx.delay(ARTIFICIAL_DELAY_MS), ctx.json(serializePost(post)));
  }),
  rest.get('/fakeApi/posts/:postId', function (req: GetPostByIdReq, res, ctx) {
    const post = db.post.findFirst({
      where: { id: { equals: req.params.postId } },
    });

    if (!post) {
      return res(ctx.status(404), ctx.json('Post not found!'));
    }

    return res(ctx.delay(ARTIFICIAL_DELAY_MS), ctx.json(serializePost(post)));
  }),
  rest.patch('/fakeApi/posts/:postId', (req: PatchPostByIdReq, res, ctx) => {
    // id needs to be thrown away
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...data } = req.body;
    const updatedPost = db.post.update({
      where: { id: { equals: req.params.postId } },
      data,
    });

    if (!updatedPost) {
      return res(ctx.status(404), ctx.json('Post not found!'));
    }

    return res(ctx.json(serializePost(updatedPost)));
  }),

  rest.get(
    '/fakeApi/posts/:postId/comments',
    (req: GetPostCommentsByIdReq, res, ctx) => {
      const post = db.post.findFirst({
        where: { id: { equals: req.params.postId } },
      });

      if (!post) {
        return res(ctx.status(404), ctx.json('Post not found!'));
      }

      return res(
        ctx.delay(ARTIFICIAL_DELAY_MS),
        ctx.json({ comments: post.comments })
      );
    }
  ),

  rest.post(
    '/fakeApi/posts/:postId/reactions',
    (req: PostPostReactionsByIdReq, res, ctx) => {
      const postId = req.params.postId;
      const reaction = req.body.reaction;
      const post = db.post.findFirst({
        where: { id: { equals: postId } },
      });

      if (!post) {
        return res(ctx.status(404), ctx.json('Post not found!'));
      }

      if (!post.reactions) {
        return res(ctx.status(404), ctx.json('Post reactions not found!'));
      }

      const currentReactionCount = post.reactions[reaction] ?? 0;

      const updatedPost = db.post.update({
        where: { id: { equals: postId } },
        data: {
          reactions: {
            ...post.reactions,
            [reaction]: currentReactionCount + 1,
          },
        },
      });

      if (!updatedPost) {
        return res(ctx.status(500), ctx.json('Error updating post!'));
      }

      return res(
        ctx.delay(ARTIFICIAL_DELAY_MS),
        ctx.json(serializePost(updatedPost))
      );
    }
  ),
  rest.get('/fakeApi/notifications', (req, res, ctx) => {
    const numNotifications = getRandomInt(1, 5);

    const notifications = generateRandomNotifications(
      undefined,
      numNotifications,
      db
    );

    return res(ctx.delay(ARTIFICIAL_DELAY_MS), ctx.json(notifications));
  }),
  rest.get('/fakeApi/users', (req, res, ctx) => {
    return res(ctx.delay(ARTIFICIAL_DELAY_MS), ctx.json(db.user.getAll()));
  }),
];

export const worker = setupWorker(...handlers);
// worker.printHandlers() // Optional: nice for debugging to see all available route handlers that will be intercepted

/* Mock Websocket Setup */

const socketServer = new MockSocketServer('ws://localhost');

let currentSocket: Client;

const sendMessage = (socket: Client, obj: JsonValue) => {
  socket.send(JSON.stringify(obj));
};

// Allow our UI to fake the server pushing out some notifications over the websocket,
// as if other users were interacting with the system.
const sendRandomNotifications = (socket: Client, since: string) => {
  const numNotifications = getRandomInt(1, 5);

  const notifications = generateRandomNotifications(
    since,
    numNotifications,
    db
  );

  sendMessage(socket, { type: 'notifications', payload: notifications });
};

export const forceGenerateNotifications = (since: string) => {
  sendRandomNotifications(currentSocket, since);
};

socketServer.on('connection', (socket) => {
  currentSocket = socket;

  socket.on('message', (data) => {
    const message = JSON.parse(data as string);

    switch (message.type) {
      case 'notifications': {
        const since = message.payload;
        sendRandomNotifications(socket, since);
        break;
      }
      default:
        break;
    }
  });
});

/* Random Notifications Generation */

const notificationTemplates = [
  'poked you',
  'says hi!',
  `is glad we're friends`,
  'sent you a gift',
];

function generateRandomNotifications(
  since: string | undefined,
  numNotifications: number,
  db: Database
) {
  const now = new Date();
  let pastDate: Date;

  if (since) {
    pastDate = parseISO(since);
  } else {
    pastDate = new Date(now.valueOf());
    pastDate.setMinutes(pastDate.getMinutes() - 15);
  }

  // Create N random notifications. We won't bother saving these
  // in the DB - just generate a new batch and return them.
  const notifications = [...Array(numNotifications)].map(() => {
    const user = randomFromArray(db.user.getAll());
    const template = randomFromArray(notificationTemplates);
    return {
      id: nanoid(),
      date: faker.date.between(pastDate, now).toISOString(),
      message: template,
      user: user.id,
    };
  });

  return notifications;
}
