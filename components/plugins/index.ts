import type { PluginModule } from '@/types/plugins';
import * as immich from './immich';
import * as navidrome from './navidrome';

export const plugins: Readonly<Record<string, PluginModule>> = { immich, navidrome };

export default plugins;
