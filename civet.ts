import { Platform } from './src/Platform'

  export const version: string = '0.0.1';

  export class ExtensionContext{
    constructor() {
      this._platform = new Platform()
      this.ws = new WebSocket(this._url, 'civet-protocol')
      this._initWebsocket()
    }

    send(msg: string|ArrayBuffer) {
      this.ws.send(msg)
    }

    get currentDB(): string {
      return this._currentDB
    }
    set currentDB(dbname: string) {
      this._currentDB = dbname;
    }

    private _platform: Platform;
    private _currentDB: string;
    private ws: WebSocket;
    private _url: string = 'ws://localhost:21313';
    private _config: any;
    static _isConnecting = false;

    private _onerror(event) {
      console.info('_reconnect 2', event)
      // extensionContext._reconnect()
    }
    private _onopen(event){
      console.info(event)
      ExtensionContext._isConnecting = false;
    }
    private _onclose(event){
      console.info('_reconnect 3',event)
      extensionContext._reconnect()
    }
    private _onmessage(event) {
      if (!event.data) return
      console.info('_onmessage', event)
      const data = JSON.parse(event.data)
      switch(data.id) {
        case 'config':
          this._config = data.config
          let storage = extensionContext._platform.storage;
          extensionContext._platform.storage.get(['current'], function(result) {
            if (Object.keys(result).length === 0) {
              storage.set({current: data.config.db[0]}, function(){})
              extensionContext._currentDB = data.config.db[0]
            }
            else {
              console.info('current:', result)
              extensionContext._currentDB = result
            }
          })
          break;
        default:
          console.info(event);
          break;
      }
    }
    private _initWebsocket() {
      this.ws.onerror = this._onerror;
      this.ws.onopen = this._onopen;
      this.ws.onclose = this._onclose;
      this.ws.onmessage = this._onmessage;
    }
    private _reconnect() {
      const self = this;
      // if (ExtensionContext._isConnecting === false) {
        setTimeout(function() {
          console.info('_reconnect 1')
          self.ws = new WebSocket(self._url, 'civet-protocol');
          ExtensionContext._isConnecting = true;
          self._initWebsocket();
        }, 2500)
      // }
    }
  }

  export let extensionContext: ExtensionContext = new ExtensionContext();

  export declare function activate(context: ExtensionContext);
  export declare function unactivate();

    
  export interface IProperty {
    readonly key: string;
  }

  export class IResource {
    readonly id: number;
    readonly type: string;
    readonly name: string;

    path: string[];
    meta: JSON;
    tag: string[];
    category: string[];
    anno?: string[];
    keyword: string[];
    [propName: string]: any;

    load(path: string): Thenable<boolean> {
      console.info('read', path)
      const msg = {id: 'load', db: extensionContext.currentDB, data: path}
      extensionContext.send(JSON.stringify(msg))
      return;
    }
    save(path: string): Thenable<boolean> {
      console.info('write', path)
      return;
    }
  }

  export let resource: IResource = new IResource;
  interface Thenable<T> {
    then<TResult>(onfulfilled?: (value: T) => TResult | Thenable<TResult>, onrejected?: (reason: any) => TResult | Thenable<TResult>): Thenable<TResult>;
    then<TResult>(onfulfilled?: (value: T) => TResult | Thenable<TResult>, onrejected?: (reason: any) => void): Thenable<TResult>;
  }