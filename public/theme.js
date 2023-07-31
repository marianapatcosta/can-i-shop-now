;(function initTheme() {
  const isDarkTheme = JSON.parse(
    localStorage.getItem('@can-i-shop-now:dark-theme')
  )

  if (isDarkTheme === false) return
  if (isDarkTheme) {
    document.documentElement.classList.add('dark')
    return
  }

  const isDeviceThemeDark =
    window && window.matchMedia('(prefers-color-scheme: dark)').matches
  if (isDarkTheme) {
    document.documentElement.classList.add('dark')
  }
  localStorage.setItem('@can-i-shop-now:dark-theme', isDeviceThemeDark)
})()
