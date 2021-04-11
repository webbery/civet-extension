import { Chrome } from './Chrome'

export class Platform {
  constructor() {
    try{
      this._platform = new Chrome()
    }catch(e) {}
  }

  get storage() {
    return this._platform.storage;
  }

  private _platform: Chrome = null;
}