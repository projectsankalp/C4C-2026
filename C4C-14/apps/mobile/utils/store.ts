import AsyncStorage from '@react-native-async-storage/async-storage';

export const USER_KEY = '@swasthya_user_id';

export const storeUser = async (userId: string) => {
  try {
    await AsyncStorage.setItem(USER_KEY, userId);
  } catch (e) {
    console.error('Failed to save user id to storage');
  }
};

export const getUser = async () => {
  try {
    return await AsyncStorage.getItem(USER_KEY);
  } catch (e) {
    console.error('Failed to get user id from storage');
    return null;
  }
};

export const removeUser = async () => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (e) {
    console.error('Failed to clear user id');
  }
};
