import ISettings from '../Kernel/settings/ISettings';
import baseSettings from './settings.base';

export default {
    ...baseSettings,
    fpsDisplayColor: "blue",
    assetsDirUrl: "/as/assets"
} as ISettings;