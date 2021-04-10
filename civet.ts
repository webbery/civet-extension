
  export const version: string = '0.0.1';

  export class ExtensionContext{
    constructor(context) {
      console.info(context)
      if (!context) {
        this.env = 'browser'
      }
      this.ws = new WebSocket(this._url, 'civet-protocol')
      this._initWebsocket()
    }
    env: string;
    ws: WebSocket;

    private _url: string = 'ws://localhost:21313';

    private _onerror(event) {
        console.info('_reconnect 2', event)
        extensionContext._reconnect()
    }
    private _onopen(event){
      console.info(event)
    }
    private _onclose(event){
      console.info('_reconnect 3',event)
      // extensionContext._reconnect()
    }
    private _initWebsocket() {
      this.ws.onerror = this._onerror;
      this.ws.onopen = this._onopen;
      this.ws.onclose = this._onclose;
    }
    private _reconnect() {
      const self = this;
      setTimeout(function() {
        console.info('_reconnect 1')
        self.ws = new WebSocket(self._url, 'civet-protocol');
        self._initWebsocket();
      }, 2500)
    }
  }

  export let extensionContext: ExtensionContext = new ExtensionContext(this);

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
      extensionContext.ws.send('load file:' + path)
      return ;
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