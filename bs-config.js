module.exports = {
    files: ["./**/*.{html,css,js}"],
    server: {
        baseDir: "./",
        index: "index.html"
    },
    port: 3000,
    open: "local",
    browser: "default",
    notify: false,
    ghostMode: {
        clicks: true,
        forms: true,
        scroll: true
    },
    reloadDelay: 0,
    injectChanges: true,
    logLevel: "info",
    logPrefix: "Notepad App",
    logConnections: true,
    logFileChanges: true,
    reloadOnRestart: true
}; 