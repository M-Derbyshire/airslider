export default {
    assets: {
        dir: "src", // The name of the source assets directory
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