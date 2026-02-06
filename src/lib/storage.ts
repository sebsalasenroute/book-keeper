import fs from "fs";
import path from "path";

export interface StorageInterface {
  save(filename: string, data: Buffer): Promise<string>;
  read(filepath: string): Promise<Buffer>;
  exists(filepath: string): Promise<boolean>;
}

class LocalStorage implements StorageInterface {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || process.env.UPLOAD_DIR || "./uploads";
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async save(filename: string, data: Buffer): Promise<string> {
    const uniqueName = `${Date.now()}-${filename}`;
    const filepath = path.join(this.baseDir, uniqueName);
    fs.writeFileSync(filepath, data);
    return filepath;
  }

  async read(filepath: string): Promise<Buffer> {
    return fs.readFileSync(filepath);
  }

  async exists(filepath: string): Promise<boolean> {
    return fs.existsSync(filepath);
  }
}

export const storage: StorageInterface = new LocalStorage();
