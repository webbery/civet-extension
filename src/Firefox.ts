declare let browser: any;

export class Firefox {
  constructor() {
    if (!browser) {
      throw new Error('chrome not found')
    }
  }

  get storage(): any {
    return browser.storage.sync
  }
}