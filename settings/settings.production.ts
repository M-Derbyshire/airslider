import ISettings from './ISettings';
import devSettings from "./settings.development";

export default {
	...devSettings,
	fpsDisplayColor: undefined
} as ISettings;