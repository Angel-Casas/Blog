import useEventsBus from "@/composables/eventBus";
import { ref } from 'vue';

export default function useTheme() {
  const currentTheme = ref('light');
  const { emitBus } = useEventsBus();

  if (localStorage) {
    // check local storage for saved theme preference and set it
    const themePreference = localStorage.getItem('theme');
    if (themePreference) {
        currentTheme.value = themePreference;
        currentTheme.value === 'light' ? setLightTheme() : setDarkTheme();
    }
  }

  function setLightTheme() {
    currentTheme.value = 'light';

    document.documentElement.style.setProperty('--primary', 'var(--main-blue)');
    document.documentElement.style.setProperty('--secondary', 'var(--secondary-blue)');
    document.documentElement.style.setProperty('--bg', 'var(--bg-light)');
    document.documentElement.style.setProperty('--bg-opacity', 'var(--bg-opacity-light)');
    document.documentElement.style.setProperty('--bg-opacity-inverted', 'var(--bg-opacity-inverted-light)');
    document.documentElement.style.setProperty('--text', 'var(--text-light)');
    document.documentElement.style.setProperty('--text-opacity', 'var(--text-opacity-light)');
    document.documentElement.style.setProperty('--link-text', 'var(--link-text--light)');
    document.documentElement.style.setProperty('--active-link-text', 'var(--active-link-text--light)');
    document.documentElement.style.setProperty('--shadow', 'var(--shadow--light)');
    document.documentElement.style.setProperty('--quote-bg', 'var(--quote-bg--light)');

    localStorage && localStorage.setItem('theme', 'light');
  }

  function setDarkTheme() {
    currentTheme.value = 'dark';

    document.documentElement.style.setProperty('--primary', 'var(--main-gold)');
    document.documentElement.style.setProperty('--secondary', 'var(--secondary-gold)');
    document.documentElement.style.setProperty('--bg', 'var(--bg-dark)');
    document.documentElement.style.setProperty('--bg-opacity', 'var(--bg-opacity-dark)');
    document.documentElement.style.setProperty('--bg-opacity-inverted', 'var(--bg-opacity-inverted-dark)');
    document.documentElement.style.setProperty('--text', 'var(--text-dark)');
    document.documentElement.style.setProperty('--text-opacity', 'var(--text-opacity-dark)');
    document.documentElement.style.setProperty('--link-text', 'var(--link-text--dark)');
    document.documentElement.style.setProperty('--active-link-text', 'var(--active-link-text--dark)');
    document.documentElement.style.setProperty('--shadow', 'var(--shadow--dark)');
    document.documentElement.style.setProperty('--quote-bg', 'var(--quote-bg--dark)');

    localStorage && localStorage.setItem('theme', 'dark');
  }

  function toggleTheme() {
    if (currentTheme.value === 'dark') {
      setLightTheme();
    } else {
      setDarkTheme();
    }

    emitBus('click', currentTheme.value);
  }

  return {
      currentTheme,
      toggleTheme,
  };
}