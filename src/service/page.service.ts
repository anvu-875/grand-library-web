import { Data } from '@measured/puck';
import fs from 'fs';

export default class PageService {
  private static instance: PageService | null = null;

  constructor() {}

  public static getInstance() {
    if (!PageService.instance) {
      PageService.instance = new PageService();
    }
    return PageService.instance;
  }

  async getPage(path: string) {
    const exists = await fs.promises.access('database.json')
      .then(() => true)
      .catch(() => false);

    const allData: Record<string, Partial<Data>> | null = exists
      ? JSON.parse(await fs.promises.readFile('database.json', 'utf-8'))
      : null;

    const data = allData ? allData[path] : null;

    return data;
  }

  async updatePage(path: string, data: Data) {
    const exists = await fs.promises.access('database.json')
      .then(() => true)
      .catch(() => false);

    const existingData = JSON.parse(
      exists
        ? await fs.promises.readFile('database.json', 'utf-8')
        : '{}'
    );

    const updatedData = {
      ...existingData,
      [path]: data,
    };

    await fs.promises.writeFile('database.json', JSON.stringify(updatedData));
  }
}
