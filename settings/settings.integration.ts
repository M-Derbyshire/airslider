import ISettings from './ISettings';
import baseSettings from './settings.base';

export default {
    ...baseSettings,
    fpsDisplayColor: "blue",
    assetsDirUrl: "/as/assets"
} as ISettings;