# Fonts Object

The fonts object should be a simple object. Each property name should be the name of a font, and the value should be the filepath to the font (a full filepath, starting from within the `/fonts` directory)

The font object should be exported from `/fonts/fonts.ts`

## Example

```
export default {
    MyCrazyFont: "/MyCrazyFont/MyCrazyFont-Regular.ttf",
    MySeriousFont: "/MySeriousFont/MySeriousFont.ttf"
};
```