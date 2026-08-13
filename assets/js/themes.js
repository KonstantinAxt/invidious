'use strict';
var toggle_theme = document.getElementById('toggle_theme');
toggle_theme.href = 'javascript:void(0)';

const STORAGE_KEY_THEME = 'dark_mode';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

// Beer CSS's ui("theme", ...) needs the page fully loaded to take effect —
// wait for that instead of assuming DOMContentLoaded is enough.
var pageFullyLoaded = document.readyState === 'complete';
addEventListener('load', function () { pageFullyLoaded = true; });
function applyBeerTheme() {
    if (pageFullyLoaded) {
        ui('theme', '#2596be');
    } else {
        addEventListener('load', function () { ui('theme', '#2596be'); }, { once: true });
    }
}

// TODO: theme state controlled by system
toggle_theme.addEventListener('click', function () {
    const isDarkTheme = helpers.storage.get(STORAGE_KEY_THEME) === THEME_DARK;
    const newTheme = isDarkTheme ? THEME_LIGHT : THEME_DARK;
    setTheme(newTheme);
    helpers.storage.set(STORAGE_KEY_THEME, newTheme);
    helpers.xhr('GET', '/toggle_theme?redirect=false', {}, {});
});

/** @param {THEME_DARK|THEME_LIGHT} theme */
function setTheme(theme) {
    // By default body element has .no-theme class that uses OS theme via CSS @media rules
    // It rewrites using hard className below
    if (theme === THEME_DARK) {
        toggle_theme.children[0].className = 'icon ion-ios-sunny';
        document.body.className = 'dark-theme';
    } else if (theme === THEME_LIGHT) {
        toggle_theme.children[0].className = 'icon ion-ios-moon';
        document.body.className = 'light-theme';
    } else {
        document.body.className = 'no-theme';
    }

    // Beer CSS (invidious-theme): add its own bare light/dark class alongside
    // ours (rather than calling Beer's own ui("mode", ...), which would
    // independently overwrite body.className and fight with the assignments
    // above), then re-run its color engine so the inline --primary etc.
    // values it writes on body.style actually match the class we just set —
    // ui("theme", ...) reads the current class to decide which variant to
    // apply, so this needs to re-run on every theme change, not just once on
    // page load.
    if (window.ui) {
        var osIsDark = matchMedia('(prefers-color-scheme: dark)').matches;
        var beerMode = theme === THEME_DARK ? 'dark' : theme === THEME_LIGHT ? 'light' : (osIsDark ? 'dark' : 'light');
        document.body.classList.add(beerMode);
        applyBeerTheme();
    }
}

// Handles theme change event caused by other tab
addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY_THEME)
        setTheme(helpers.storage.get(STORAGE_KEY_THEME));
});

// Keeps Beer CSS's bare light/dark class in sync if the OS scheme changes
// while the user is in "no-theme" (auto/follow-OS) mode.
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (document.body.classList.contains('no-theme')) setTheme('');
});

// Set theme from preferences on page load.
// Always calls setTheme, even when prefTheme is blank (no-theme/auto) —
// body.className is already correct from SSR either way, but this is also
// the only place that adds Beer CSS's bare light/dark class on a fresh
// load, which has no SSR equivalent.
addEventListener('DOMContentLoaded', function () {
    const prefTheme = document.getElementById('dark_mode_pref').textContent;
    setTheme(prefTheme);
    if (prefTheme) helpers.storage.set(STORAGE_KEY_THEME, prefTheme);
});
