import ISettings from '../Kernel/settings/ISettings';
import baseSettings from './settings.base';

export default {
    ...baseSettings,
    assetsDirUrl: "assets"
} as ISettings;