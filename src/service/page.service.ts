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

  getPage(path: string) {
    const allData: Record<string, Data> | null = fs.existsSync('database.json')
      ? JSON.parse(fs.readFileSync('database.json', 'utf-8'))
      : null;

    const data = allData ? allData[path] : null;

    return data;
  }

  updatePage(path: string, data: Data) {
    const existingData = JSON.parse(
      fs.existsSync('database.json')
        ? fs.readFileSync('database.json', 'utf-8')
        : '{}'
    );

    const updatedData = {
      ...existingData,
      [path]: data,
    };

    fs.writeFileSync('database.json', JSON.stringify(updatedData));
  }
}
