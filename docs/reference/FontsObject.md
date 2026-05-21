# Fonts Object

The fonts object should be a simple object. Each property name should be the name of a font, and the value should be the filepath to the font (a full filepath, starting from within the `/src` directory)

The font object should be exported from `/src/fonts/fonts.ts`

## Example

```
export default {
    MyCrazyFont: "/fonts/MyCrazyFont/MyCrazyFont-Regular.ttf",
    MySeriousFont: "/fonts/MySeriousFont/MySeriousFont.ttf"
};
```