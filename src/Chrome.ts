declare let chrome: any;

export class Chrome {
  constructor() {
    if (!chrome) {
      throw new Error('chrome not found')
    }
  }

  get storage(): any {
    return chrome.storage.sync
  }
}