export default class Channel {
  constructor(name) {
    this.name = name;
    this._callback = null;
  }

  async send(message) {
    throw new Error("send() must be implemented");
  }

  onReceive(callback) {
    this._callback = callback;
  }

  _receive(message) {
    if (this._callback) this._callback(message);
  }
}