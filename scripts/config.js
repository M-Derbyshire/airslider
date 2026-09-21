export default {
    assets: {
        dirs: [
            // The name of the assets directories
            "src",
            "fonts"
        ],
        excludedExtensions: [
            // File extensions that should not be treated as assets
            "js",
            "ts"
        ]
    },
    build: {
        dir: "build", // The name of the deploy output directory
        assets: "assets" // The name of the deploy's assets output directory
    }
};