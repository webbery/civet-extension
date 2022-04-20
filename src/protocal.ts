
export enum ExtensionRequest{
  AddResource = 'addResource',
  GetAllResourceDB = 'getAllDB',
  GetCurrentDB = 'getCurrentDB'
}

export enum ExtensionResponse {
  NotifyDBChanged = 'notifyDBChanged',
  NotifyDownloadError = 'notifyDownloadError',
  NotifyDownloadSuccess = 'notifyDownloadSuccess',
  NotifyConnectError = 'notifyConnectError',
  NotifyAllResourceDB = 'notifyAllResourceDB',
  NotifyCurrentDB = 'notifyCurrentDB',
  NotifyReconnect = 'notifyReconnect'
}

export class CivetExtensionRequest {
  private static _id: number = 0;
  #method: ExtensionRequest;
  #params: any;

  constructor(method: ExtensionRequest, params: any) {
    this.#method = method;
    this.#params = params;
    CivetExtensionRequest._id += 1;
  }

  static get id() {return CivetExtensionRequest._id;}
  static set id(val: number) { CivetExtensionRequest._id = val;}

  toJson() {
    return {
      id: CivetExtensionRequest._id,
      method: this.#method,
      params: this.#params
    }
  }
}