import type { PluginModule } from '@/types/plugins';
import * as immich from './immich';

export const plugins: Readonly<Record<string, PluginModule>> = { immich };

export default plugins;
