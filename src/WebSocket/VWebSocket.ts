const events = require('events')
export class VWebSocket extends events.EventEmitter {
  constructor(url: string, protocal: string) {
    super()
    const URL = require('url')
    const result = URL.parse(url)
    console.info(result, protocal)
    const options = {
      port: result.port,
      host: result.hostname,
      headers: {
        'Connection': 'Upgrade',
        'Upgrade': 'websocket'
      }
    }
    const http = require('http')
    const req = http.request(options)
    req.end();

    req.on('upgrade', (res: any, sock: any, upgradeHead: any) => {
      this._socket = sock;
      console.info('upgrade', res, upgradeHead)
    })
  }

  send(buff: string|ArrayBuffer) {
    console.info(buff)
    this._socket.write(buff)
  }

  onerror: (event: any) => void = null;
  onopen: (event: any) => void  = null;
  onclose: (event: any) => void  = null;
  onmessage: (event: any) => void  = null;

  private encodeBuffer(opcode: number, payload: any): string|ArrayBuffer {
    console.info(opcode)
    return payload
  }
  private _instance: any;
  private _socket: any;
}