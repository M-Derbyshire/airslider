import { pathToUniqueFilename } from "./deployedFilename";

describe("pathToUniqueFilename", () => {
    it.each([
        ["my/first/directory/path/file1.jpg", "my.first.directory.path.file1.jpg"],
        ["my/second/directory/path/file2.gif", "my.second.directory.path.file2.gif"]
    ])("should generate filename from given path, keeping correct extension", (path, expected) => {
        const result = pathToUniqueFilename(path);
        expect(result).toBe(expected);
    });

    it("should create filename as all lowercase letters", () => {
        const path = "My/miXeDCase/Dir/Name/FilEName.JPG";
        const expected = "my.mixedcase.dir.name.filename.jpg";

        const result = pathToUniqueFilename(path);

        expect(result).toBe(expected);
    });

    it("should not add leading dot when path had leading slash", () => {
        const path = "/my/path/file.jpg";
        const expected = "my.path.file.jpg";

        const result = pathToUniqueFilename(path);

        expect(result).toBe(expected);
    });

    it.each([
        ["models/path/file.jpg", "m.path.file.jpg"],
        ["/models/path/file.jpg", "m.path.file.jpg"],
        ["ModEls/path/file.jpg", "m.path.file.jpg"],
        ["levels/path/file.jpg", "l.path.file.jpg"],
        ["/levels/path/file.jpg", "l.path.file.jpg"],
        ["LeVEls/path/file.jpg", "l.path.file.jpg"],
        ["huds/path/file.jpg", "h.path.file.jpg"],
        ["/huds/path/file.jpg", "h.path.file.jpg"],
        ["hUDs/path/file.jpg", "h.path.file.jpg"],
        ["hudcomponents/path/file.jpg", "hc.path.file.jpg"],
        ["/hudcomponents/path/file.jpg", "hc.path.file.jpg"],
        ["hUdComPonents/path/file.jpg", "hc.path.file.jpg"],
    ])("should change first directory in path to expected abbreviation", (path, expected) => {
        const result = pathToUniqueFilename(path);

        expect(result).toBe(expected);
    });
});