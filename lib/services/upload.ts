import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { appError, type Result } from '@/lib/api';

/** 资源的落盘子目录，也是访问地址里的第一段。 */
export type UploadType = 'file' | 'image';

export type UploadParams = {
  type: UploadType;
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

const URL_PREFIX = '/uploads';
/** 落在 public 下，Next 直接当静态资源发；但生产只在启动时扫一次 public，新文件要等重启。 */
const UPLOAD_ROOT = path.join(process.cwd(), 'public/uploads');

/** 目录按 type 现建；一个文件失败整批都不算成功。 */
export async function upload({ type, files }: UploadParams): Promise<Result<UploadRes>> {
  if (!files.length) return { ok: false, error: appError('INVALID_PARAMS') };

  const dir = path.join(UPLOAD_ROOT, type);
  await mkdir(dir, { recursive: true });

  const saved = await Promise.all(files.map((file) => save(dir, type, file)));

  return { ok: true, value: { files: saved } };
}

/** 落盘用随机 uuid + 原扩展名：重名与怪异原名都不影响，扩展名还得管 Content-Type。 */
async function save(dir: string, type: UploadType, file: File): Promise<UploadItem> {
  const name = `${crypto.randomUUID()}${extension(file.name)}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  return { name: file.name, url: `${URL_PREFIX}/${type}/${name}`, size: file.size };
}

/** 取不到规范扩展名就不带：原子名是我们生成的，多一个点反而会带出奇怪的类型。 */
function extension(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  return /^\.[a-z0-9]{1,10}$/.test(ext) ? ext : '';
}

const uploadService = { upload };

export default uploadService;
