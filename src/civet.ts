import { Platform } from './Platform/Platform'

/**
 * verson of civet extension
 */
export const version: string = '0.0.1';

const _url: string = 'ws://localhost:21313';
let ws = new WebSocket(_url, 'civet-protocol')

function send(msg: string|ArrayBuffer) {
  this.ws.send(msg)
}

const CivetEvents = {
  EmitLoad: 'load',
  OnInit: 'config',
  OnDBChange: 'dbchange',
  OnDownloadError: 'download',
  OnConnectError: 'conn_err',
  OnConnectAgain: 'reconnect'
}

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
    this._events[CivetEvents.OnInit] = this._onInit
  }

  get currentDB(): string {
    return this._currentDB
  }

  set onCurrentDBChange(cb: any) {
    this._events[CivetEvents.OnDBChange] = cb;
  }

  set onDownloadError(cb: any) {
    this._events[CivetEvents.OnDownloadError] = cb;
  }

  set onCennectError(cb: any) {
    this._events[CivetEvents.OnConnectError] = cb;
  }

  set onCennectAgain(cb: (data: any) => {}) {
    this._events[CivetEvents.OnConnectAgain] = cb;
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
        ws = new WebSocket(_url, 'civet-protocol');
        ExtensionContext._isConnecting = true;
        self._initWebsocket();
      }, 2500)
    // }
  }

  private _initWebsocket() {
    this.ws.onerror = this._onerror;
    this.ws.onopen = this._onopen;
    this.ws.onclose = this._onclose;
    this.ws.onmessage = this._onmessage;
  }
}

let _resolve = null;
let _reject = null;
  /**
   * resource of uri, such as file, web page, or remote machine setting etc.
   */
  export class Resource {
    static addByPath(path: string, dbname?: string): Promise<boolean> {
      console.info('read', path, dbname)
      const msg = {id: CivetEvents.EmitLoad, db: dbname, data: { url: path} }
      return new Promise((resolve, reject) => {
        send(JSON.stringify(msg))
        _resolve = resolve;
        _reject = reject;
      });
    }
    
    static addByBinary(bin: ArrayBuffer, dbname?:string): boolean {
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
export let resource: Resource = new Resource;
