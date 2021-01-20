// Functions used to recommend the configurations required for the best performance of Minimap

export function treeSitterWarning() {
  return observeAndWarn(
    "core.useTreeSitterParsers",
    true,
    "Tree-sitter is off (Low Performance Warning).",
    `You should turn on Atom's tree-sitter parser to experience the best performance Minimap and Atom is deisgned for.
    Keeping tree-sitter parser off results in sluggish scrolling and lags in the text editor.`
  )
}

/* Utility function that observes a config and throws warnings once a day if it is not the recommended value */
function observeAndWarn(configName, recommendedValue, warningTitle, warningDescription) {
  return atom.config.observe(configName, (value) => {
    if (value !== recommendedValue) {
      const storageName = `Minimap.${configName}`
      const today = new Date()
      const previousWarning = window.localStorage.getItem(storageName)
      let previousWarningDay = null
      if (previousWarning) {
        previousWarningDay = new Date(Date.parse(previousWarning)).getDay()
      }
      // throw the warning once a day
      if (!previousWarningDay || (typeof previousWarningDay === "number" && previousWarningDay - today.getDay() >= 1)) {
        window.localStorage.setItem(storageName, today)

        const notification = atom.notifications.addWarning(warningTitle, {
          description: warningDescription,
          dismissable: true,
          buttons: [
            {
              text: `Set to ${recommendedValue} and restart Atom`,
              onDidClick() {
                atom.config.set(configName, true)
                notification.dismiss()
                window.localStorage.removeItem(storageName)
                setTimeout(() => {
                  atom.reload()
                }, 1500)
              },
            },
          ],
        })
      }
    }
  })
}
