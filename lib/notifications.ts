import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Alert } from 'react-native';

export async function requestNotificationPermissions() {
  // Check if we are running in Expo Go
  if (Constants.appOwnership === 'expo') {
    Alert.alert(
      'Expo Go Шектеуі',
      'Push-хабарламалар Expo Go-да жұмыс істемейді. Оны тексеру үшін "Development Build" орнату керек.'
    );
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (e) {
    console.error('Notification permission error:', e);
    return false;
  }
}

export async function scheduleTestNotification() {
  if (Constants.appOwnership === 'expo') return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Сәлем! 👋',
      body: 'Бұл push-хабарламаның тесті',
    },
    trigger: { seconds: 2 },
  });
}
