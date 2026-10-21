import type { PluginManifest } from '@/types/plugins';
import definition from './manifest.json';
import icon from './assets/icon.png';

export { default as component } from './pages';
export { default as api } from './api';
export const manifest = { ...definition, icon: icon.src } as PluginManifest;
