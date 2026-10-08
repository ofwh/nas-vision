import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { appError, type Result } from '@/lib/api';

export type UploadParams = {
  files: File[];
};

export type UploadItem = {
  /** 原始文件名，只给前端展示。 */
  name: string;
  url: string;
  size: number;
};

export type UploadRes = {
  files: UploadItem[];
};

export type UploadRemoveParams = {
  url: string;
};

export type UploadRemoveRes = {
  url: string;
};

const URL_PREFIX = '/static/uploads';
/** 落在 public 下，Next 直接当静态资源发；但生产只在启动时扫一次 public，新文件要等重启。 */
const UPLOAD_ROOT = path.join(process.cwd(), 'public/static/uploads');

export async function upload({ files }: UploadParams): Promise<Result<UploadRes>> {
  if (!files.length) return { ok: false, error: appError('common.INVALID_PARAMS') };

  await mkdir(UPLOAD_ROOT, { recursive: true });

  const saved = await Promise.all(files.map((file) => save(file)));

  return { ok: true, value: { files: saved } };
}

/** 只删本服务落的文件；文件已经不在了也算成功，调用方要的是"删掉"这个结果。 */
export async function remove({ url }: UploadRemoveParams): Promise<Result<UploadRemoveRes>> {
  const target = resolve(url);
  if (!target) return { ok: false, error: appError('common.INVALID_PARAMS') };

  await rm(target, { force: true });

  return { ok: true, value: { url } };
}

/** url 由调用方给，必须落在 UPLOAD_ROOT 内，否则 ../ 就能删到外面去。 */
function resolve(url: string): string | null {
  if (!url.startsWith(`${URL_PREFIX}/`)) return null;

  const target = path.resolve(UPLOAD_ROOT, url.slice(URL_PREFIX.length + 1));
  return target.startsWith(`${UPLOAD_ROOT}${path.sep}`) ? target : null;
}

/** 落盘用随机 uuid + 原扩展名：重名与怪异原名都不影响，扩展名还得管 Content-Type。 */
async function save(file: File): Promise<UploadItem> {
  const name = `${crypto.randomUUID()}${extension(file.name)}`;
  await writeFile(path.join(UPLOAD_ROOT, name), Buffer.from(await file.arrayBuffer()));

  return { name: file.name, url: `${URL_PREFIX}/${name}`, size: file.size };
}

/** 取不到规范扩展名就不带：原子名是我们生成的，多一个点反而会带出奇怪的类型。 */
function extension(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  return /^\.[a-z0-9]{1,10}$/.test(ext) ? ext : '';
}

const uploadService = { upload, remove };

export default uploadService;
