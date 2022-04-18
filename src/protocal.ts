
export enum ExtensionRequest{
  AddResource = 'addResource',
  GetAllResourceDB = 'getAllDB',
  GetCurrentDB = 'getCurrentDB'
}

export enum ExtensionResponse {
  NotifyDBChanged = 'notifyDBChanged',
  NotifyDownloadError = 'notifyDownloadError',
  NotifyConnectError = 'notifyConnectError',
  NotifyAllResourceDB = 'notifyAllResourceDB',
  NotifyCurrentDB = 'notifyCurrentDB',
  NotifyReconnect = 'notifyReconnect'
}

export class CivetExtensionRequest {
  static #id: number = 0;
  #method: ExtensionRequest;
  #params: any;

  constructor(method: ExtensionRequest, params: any) {
    this.#method = method;
    this.#params = params;
    CivetExtensionRequest.#id += 1;
  }

  toJson() {
    return {
      id: CivetExtensionRequest.#id,
      method: this.#method,
      params: this.#params
    }
  }
}