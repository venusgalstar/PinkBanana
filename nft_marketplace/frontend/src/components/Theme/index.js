import React from "react";
import cn from "classnames";
import styles from "./Theme.module.sass";
import useDarkMode from "use-dark-mode";
import { setThemeMode } from "../../store/actions/user.action";
import { useDispatch } from "react-redux";

const Theme = ({ className }) => {
  const darkMode = useDarkMode(false);
  const dispatch = useDispatch();

  const onChangeTheme = () =>
  {
    darkMode.toggle()
    dispatch(setThemeMode(darkMode.value? "light" : "dark"))
  }

  return (
    <label
      className={cn(
        styles.theme,
        { [styles.theme]: className === "theme" },
        { [styles.themeBig]: className === "theme-big" }
      )}
    >
      <input
        className={styles.input}
        checked={darkMode.value}
        onChange={onChangeTheme}
        type="checkbox"
      />
      <span className={styles.inner}>
        <span className={styles.box}></span>
      </span>
    </label>
  );
};

export default Theme;
