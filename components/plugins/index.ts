import type { PluginModule } from '@/types/plugins';
import * as immich from './immich';
import * as navidrome from './navidrome';
import * as weather from './weather';

export const plugins: Readonly<Record<string, PluginModule>> = { immich, navidrome, weather };

export default plugins;
