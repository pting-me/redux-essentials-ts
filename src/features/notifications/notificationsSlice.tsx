import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createEntityAdapter,
} from '@reduxjs/toolkit';

import { client } from '../../api/client';
import { RootState } from '../../app-lib/store';

interface Notification {
  date: string;
  user: string;
  id: string;
  message: string;
  read: boolean;
  isNew: boolean;
}

type FetchNotificationsPayload = Notification[];

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { getState }) => {
    const allNotifications = selectAllNotifications(getState() as RootState);
    const [latestNotification] = allNotifications;
    const latestTimestamp = latestNotification ? latestNotification.date : '';
    const response = await client.get(
      `/fakeApi/notifications?since=${latestTimestamp}`
    );
    return response.data;
  }
);

const notificationsAdapter = createEntityAdapter<Notification>({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: notificationsAdapter.getInitialState(),
  reducers: {
    allNotificationsRead(state) {
      Object.values(state.entities).forEach((notification) => {
        if (!notification) {
          return;
        }

        notification.read = true;
      });
    },
  },
  extraReducers(builder) {
    builder.addCase(
      fetchNotifications.fulfilled,
      (state, action: PayloadAction<FetchNotificationsPayload, string>) => {
        notificationsAdapter.upsertMany(state, action.payload);
        Object.values(state.entities).forEach((notification) => {
          if (!notification) {
            return;
          }
          // Any notifications we've read are no longer new
          notification.isNew = !notification.read;
        });
      }
    );
  },
});

export default notificationsSlice.reducer;

export const { allNotificationsRead } = notificationsSlice.actions;

export const { selectAll: selectAllNotifications } =
  notificationsAdapter.getSelectors((state: RootState) => state.notifications);
