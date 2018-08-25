/**
 * Trigger pub/sub
 * gcloud pubsub topics publish process-notifications --message '{"uid": "123456"}'
 */
const GetUserNotifications = require('../utilities/get-user-notifications');
const AddUserPushNotification = require('../utilities/add-user-push-notification');

module.exports = context => async message => {
  const getUserNotifications = GetUserNotifications(context);
  const addUserPushNotification = AddUserPushNotification(context);
  const uid = message.json.uid;
  const notifications = await getUserNotifications(uid);
  const count = Object.keys(notifications || {}).length;

  if (count) {
    let lastNotification = { created: 0 };

    for (let key in notifications) {
      const notification = notifications[key];

      if (notification.created > lastNotification.created) {
        lastNotification = notification;
      }
    }

    const pushNotification = {
      type: lastNotification.type,
      created: Date.now(),
      detail: {
        title: `${count} unread messages`,
        text: `New message: ${lastNotification.detail.text}`,
        url: `${lastNotification.detail.origin}/app/messages`,
      },
    };
    await addUserPushNotification(uid, pushNotification);
  }
};
