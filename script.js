const searchInput = document.querySelector("#atlas-search");
const filterButtons = Array.from(document.querySelectorAll(".filter-button"));
const cards = Array.from(document.querySelectorAll(".atlas-card"));
const visibleCount = document.querySelector("#visible-count");
const emptyState = document.querySelector("#empty-state");
const themeToggle = document.querySelector("#theme-toggle");

let activeFilter = "all";
const themeStorageKey = "atlas-theme";

function getCookieTheme() {
  const match = document.cookie.match(/(?:^|; )atlas-theme=(dark|light)/);
  return match ? match[1] : null;
}

function getStoredTheme() {
  try {
    return localStorage.getItem(themeStorageKey) || getCookieTheme();
  } catch {
    return getCookieTheme();
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(themeStorageKey, theme);
  } catch {
    // Theme still changes for this page view when storage is unavailable.
  }

  try {
    document.cookie = `${themeStorageKey}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // Cookie fallback is best-effort only.
  }
}

function getPreferredTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function updateThemeToggle(theme) {
  if (!themeToggle) {
    return;
  }

  const isDark = theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
  themeToggle.querySelector(".theme-toggle-text").textContent = `${isDark ? "Light" : "Dark"} mode`;
}

function setTheme(theme, shouldStore = true) {
  document.documentElement.dataset.theme = theme;
  updateThemeToggle(theme);

  if (shouldStore) {
    storeTheme(theme);
  }
}

function normalize(value) {
  return value.trim().toLowerCase();
}

function cardMatchesFilter(card) {
  if (activeFilter === "all") {
    return true;
  }

  return card.dataset.category.split(" ").includes(activeFilter);
}

function cardMatchesSearch(card, searchTerm) {
  if (!searchTerm) {
    return true;
  }

  return normalize(card.textContent).includes(searchTerm);
}

function updateCatalog() {
  const searchTerm = normalize(searchInput.value);
  let shown = 0;

  cards.forEach((card) => {
    const isVisible = cardMatchesFilter(card) && cardMatchesSearch(card, searchTerm);
    card.hidden = !isVisible;

    if (isVisible) {
      shown += 1;
    }
  });

  visibleCount.textContent = shown;
  emptyState.hidden = shown > 0;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });

    updateCatalog();
  });
});

searchInput.addEventListener("input", updateCatalog);

if (themeToggle) {
  setTheme(document.documentElement.dataset.theme || getStoredTheme() || getPreferredTheme(), false);

  themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!getStoredTheme()) {
      setTheme(getPreferredTheme(), false);
    }
  });
}

updateCatalog();
