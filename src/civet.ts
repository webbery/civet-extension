import { Platform } from './Platform/Platform'
import { ExtensionRequest, ExtensionResponse, CivetExtensionRequest } from './protocal'

/**
 * verson of civet extension
 */
export const version: string = '0.0.2';

let _resolve = null;
let _reject = null;
class ExtensionContext{
  private _platform: Platform;
  private _currentDB: string;
  private ws: WebSocket;
  private _url: string = 'ws://localhost:21313';
  static _isConnecting: boolean = false;
  private _events: Map<string, any> = new Map<string, any>();

  constructor() {
    this._platform = new Platform()
    this._reconnect()
    this._initWebsocket()
    this._events[ExtensionResponse.NotifyCurrentDB] = this._onInit
  }

  get currentDB(): string {
    return this._currentDB
  }

  set onCurrentDBChange(cb: any) {
    this._events[ExtensionResponse.NotifyDBChanged] = cb;
  }

  set onDownloadError(cb: (id: number, params: any) => void) {
    this._events[ExtensionResponse.NotifyDownloadError] = function(id, params) {
      cb(id, params)
      _reject(false)
    };
  }

  set onDownloadSuccess(cb: (id: number, params: any) => void) {
    this._events[ExtensionResponse.NotifyDownloadSuccess] = function(id, params) {
      _resolve(true)
      cb(id, params)
    };
  }

  set onCennectError(cb: any) {
    this._events[ExtensionResponse.NotifyConnectError] = cb;
  }

  set onCennectAgain(cb: (data: any) => {}) {
    this._events[ExtensionResponse.NotifyReconnect] = cb;
  }

  private _onInit(id: number, params: any) {
    let storage = _extensionContext._platform.storage;
    // 同步消息id
    CivetExtensionRequest.id = id;
    _extensionContext._platform.storage.get(['current'], function(result) {
      // console.debug('message:', params)
      if (Object.keys(result).length === 0) {
        const curDB = params.curdb
        storage.set({current: curDB}, function(){})
        _extensionContext._currentDB = curDB
      }
      else {
        // console.info('current:', result)
        _extensionContext._currentDB = result
      }
    })
  }

  private _onerror() {
    // console.info('_reconnect 2', event)
    // extensionContext._reconnect()
  }
  private _onopen(event){
    console.info(event)
    ExtensionContext._isConnecting = false;
  }
  private _onclose(){
    // console.info('_reconnect 3',event)
    _extensionContext._reconnect()
  }
  private _onmessage(event) {
    if (!event.data) return
    const data = JSON.parse(event.data)
    // console.info('_onmessage', data, this._events)
    const method = this._events[data.method]
    if (method) method(data.id, data.params);
  }

  private _reconnect() {
    const self = this;
    // if (ExtensionContext._isConnecting === false) {
      setTimeout(function() {
        // console.info('_reconnect 1')
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
    this.ws.onmessage = this._onmessage.bind(this);
    return true;
  }

  send(msg: CivetExtensionRequest): boolean {
    if (!this.ws) return false
    const jsn = msg.toJson()
    this.ws.send(JSON.stringify(jsn))
    return true
  }
}
  /**
   * resource of uri, such as file, web page, or remote machine setting etc.
   */
  export class Resource {
    #context: ExtensionContext;

    constructor(context: ExtensionContext) {
      this.#context = context
      // console.info('construction resource')
    }

    addByPath(path: string, dbname?: string): Promise<boolean> {
      // console.info('read', path, dbname)
      let resourceDB = dbname || this.#context.currentDB
      if (!resourceDB) {
        return new Promise((_, reject) => {
          console.error(`cannot connect civet, please check you extension`)
          reject(`use resource db ${resourceDB}`)
        })
      }
      const msg = new CivetExtensionRequest(ExtensionRequest.AddResource, {db: resourceDB, url: path})
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

    onDownloadSuccess(cb: (id: number, params: any) => void) {
      this.#context.onDownloadSuccess = cb
    }

    onDownloadFail(cb: (id: number, params: any) => void) {
      this.#context.onDownloadError = cb
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
