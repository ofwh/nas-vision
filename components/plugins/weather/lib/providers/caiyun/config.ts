import type { Location } from '../../models';

export type CaiyunConfig = { type: 'caiyun'; token: string; transformLocation?: (location: Location) => Location };
