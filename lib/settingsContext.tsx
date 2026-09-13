import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './i18n';

interface SettingsContextType {
  notificationsEnabled: boolean;
  vibrationEnabled: boolean;
  language: string;
  setNotificationsEnabled: (val: boolean) => void;
  setVibrationEnabled: (val: boolean) => void;
  setLanguage: (lang: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_KEY = '@app_settings';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificationsEnabled, setNotificationsState] = useState(false);
  const [vibrationEnabled, setVibrationState] = useState(true);
  const [language, setLanguageState] = useState('kk');

  useEffect(() => {
    async function loadSettings() {
      try {
        const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
          const { notifications, vibration, lang } = JSON.parse(savedSettings);
          setNotificationsState(notifications);
          setVibrationState(vibration);
          setLanguageState(lang);
          i18n.changeLanguage(lang);
        }
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
    loadSettings();
  }, []);

  const saveSettings = async (updates: Partial<SettingsContextType>) => {
    try {
      const currentSettings = {
        notifications: notificationsEnabled,
        vibration: vibrationEnabled,
        lang: language,
      };
      const newSettings = { ...currentSettings, ...updates };
      // We only want to save the actual values, not the setter functions
      const toSave = {
        notifications: newSettings.notificationsEnabled ?? currentSettings.notifications,
        vibration: newSettings.vibrationEnabled ?? currentSettings.vibration,
        lang: newSettings.language ?? currentSettings.lang,
      };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };

  const setNotificationsEnabled = async (val: boolean) => {
    setNotificationsState(val);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({
      notifications: val,
      vibration: vibrationEnabled,
      lang: language
    }));
  };

  const setVibrationEnabled = async (val: boolean) => {
    setVibrationState(val);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({
      notifications: notificationsEnabled,
      vibration: val,
      lang: language
    }));
  };

  const setLanguage = async (lang: string) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({
      notifications: notificationsEnabled,
      vibration: vibrationEnabled,
      lang: lang
    }));
  };

  return (
    <SettingsContext.Provider value={{
      notificationsEnabled,
      vibrationEnabled,
      language,
      setNotificationsEnabled,
      setVibrationEnabled,
      setLanguage
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
