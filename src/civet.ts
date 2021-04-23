import { Platform } from './Platform/Platform'
import { VWebSocket } from './WebSocket/VWebSocket'

export namespace civet {
  /**
   * verson of civet extension
   */
  export const version: string = '0.0.1';

  class ExtensionContext{
    constructor() {
      this._platform = new Platform()
      if (typeof window !== 'undefined') {
        this.ws = new WebSocket(this._url, 'civet-protocol')
      } else {
        this.ws = new VWebSocket(this._url, 'civet-protocol')
      }
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
    private ws: WebSocket|VWebSocket;
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
      const msg = {id: 'load', db: extensionContext.currentDB, data: { url: path} }
      civet.extensionContext.send(JSON.stringify(msg))
      return;
    }
    save(path: string): Thenable<boolean> {
      console.info('write', path)
      return;
    }
  }

  interface Thenable<T> {
    then<TResult>(onfulfilled?: (value: T) => TResult | Thenable<TResult>, onrejected?: (reason: any) => TResult | Thenable<TResult>): Thenable<TResult>;
    then<TResult>(onfulfilled?: (value: T) => TResult | Thenable<TResult>, onrejected?: (reason: any) => void): Thenable<TResult>;
  }

  /**
   * extension context
   */
  export let extensionContext: ExtensionContext = new ExtensionContext();

  export declare function activate(context: ExtensionContext);
  export declare function unactivate();

  export interface IProperty {
    readonly key: string;
  }

  /**
   * resource of uri, such as file, web page, or remote machine setting etc.
   */
  export let resource: IResource = new IResource;


}

  