import { useEffect, useState } from "react";
import { AppState } from "react-native";

interface AppStateOptions {
  onForeground?: () => void;
  onBackground?: () => void;
}

export const useAppState = ({
  onForeground,
  onBackground,
}: AppStateOptions = {}) => {
  const [appStateVisible, setAppStateVisible] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      console.log(
        "App State changed from",
        appStateVisible,
        "to",
        nextAppState
      );

      if (appStateVisible === "background" && nextAppState === "active") {
        console.log("App has come to the foreground!");
        onForeground?.();
      } else if (
        appStateVisible === "active" &&
        nextAppState === "background"
      ) {
        console.log("App has gone to the background!");
        onBackground?.();
      }

      setAppStateVisible(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appStateVisible, onForeground, onBackground]);

  return appStateVisible;
};
