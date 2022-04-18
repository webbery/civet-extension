import { Platform } from './Platform/Platform'
import { ExtensionRequest, ExtensionResponse, CivetExtensionRequest } from './protocal'

/**
 * verson of civet extension
 */
export const version: string = '0.0.2';

class ExtensionContext{
  private _platform: Platform;
  private _currentDB: string;
  private ws: WebSocket;
  private _url: string = 'ws://localhost:21313';
  private _config: any;
  static _isConnecting: boolean = false;
  private _events: Map<string, any> = new Map<string, any>();

  constructor() {
    this._platform = new Platform()
    this._initWebsocket()
    this._events[ExtensionResponse.NotifyCurrentDB] = this._onInit
  }

  get currentDB(): string {
    return this._currentDB
  }

  set onCurrentDBChange(cb: any) {
    this._events[ExtensionResponse.NotifyDBChanged] = cb;
  }

  set onDownloadError(cb: any) {
    this._events[ExtensionResponse.NotifyDownloadError] = cb;
  }

  set onCennectError(cb: any) {
    this._events[ExtensionResponse.NotifyConnectError] = cb;
  }

  set onCennectAgain(cb: (data: any) => {}) {
    this._events[ExtensionResponse.NotifyReconnect] = cb;
  }

  private _onInit(data: any) {
    this._config = data.config
    let storage = _extensionContext._platform.storage;
    _extensionContext._platform.storage.get(['current'], function(result) {
      if (Object.keys(result).length === 0) {
        storage.set({current: data.config.db[0]}, function(){})
        _extensionContext._currentDB = data.config.db[0]
      }
      else {
        console.info('current:', result)
        _extensionContext._currentDB = result
      }
    })
  }

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
    _extensionContext._reconnect()
  }
  private _onmessage(event) {
    if (!event.data) return
    console.info('_onmessage', event)
    const data = JSON.parse(event.data)
    this._events[data.id](data);
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

  private _initWebsocket() {
    if (!this.ws) return false;
    this.ws.onerror = this._onerror;
    this.ws.onopen = this._onopen;
    this.ws.onclose = this._onclose;
    this.ws.onmessage = this._onmessage;
    return true;
  }

  send(msg: CivetExtensionRequest): boolean {
    if (!this.ws) return false
    const jsn = msg.toJson()
    this.ws.send(JSON.stringify(jsn))
    return true
  }
}

let _resolve = null;
let _reject = null;
  /**
   * resource of uri, such as file, web page, or remote machine setting etc.
   */
  export class Resource {
    #context: ExtensionContext;

    constructor(context: ExtensionContext) {
      this.#context = context
    }

    addByPath(path: string, dbname?: string): Promise<boolean> {
      console.info('read', path, dbname)
      const msg = new CivetExtensionRequest(ExtensionRequest.AddResource, {db: dbname, url: path})
      return new Promise((resolve, reject) => {
        this.#context.send(msg)
        _resolve = resolve;
        _reject = reject;
      });
    }
    
    addByBinary(bin: ArrayBuffer, dbname?:string): boolean {
      console.info('read', bin, dbname);
      return true;
    }
  }

/**
 * extension context
 */
let _extensionContext: ExtensionContext = new ExtensionContext();

/**
 * resource of uri, such as file, web page, or remote machine setting etc.
 */
export let resource: Resource = new Resource(_extensionContext);

export function getAllResourceDB(): string[] {
  let dbs: string[] = [];
  return dbs;
}

export function getCurrentActiveDB(): string {
  return _extensionContext.currentDB
}
