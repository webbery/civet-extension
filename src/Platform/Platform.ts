import { Chrome } from './Chrome'
import { Firefox } from './Firefox'

export class Platform {
  constructor() {
    try{
      this._platform = new Chrome()
    }catch(e) {}
    if (!this._platform) {
      try{
        this._platform = new Firefox()
      }catch(e) {}
    }
  }

  get storage() {
    return this._platform.storage;
  }

  private _platform: Chrome | Firefox = null;
}