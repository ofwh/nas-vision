import type { PluginManifest } from '@/types/plugins';
import definition from './manifest.json';

export { default as component } from './pages';
export { default as api } from './api';
export const manifest = definition as PluginManifest;
