/** Same as `Queue`, but has a Static Size */
export class StaticQueue<T> {
  private _maxSize: number;
  private _storage: { [index: number]: T } = {};
  private _frontIndex = 0;
  private _backIndex = -1;

  /**
   * A `Queue` with a static size. Performs better than a dynamic Queue
   * @param maxSize Maximum Size of Queue
   */
  constructor(maxSize: number) {
    this._maxSize = maxSize;
  }

  /**
   * Enqueues an item to the front of the Queue
   * @param item
   */
  public enQueue(item: T) {
    if (this.storageLength < this._maxSize) {
      this._storage[++this._backIndex] = item;
    }
  }

  /**
   * Dequeues last item of the Queue
   */
  public deQueue() {
    if (this.storageLength !== 0) {
      delete this._storage[this._frontIndex++];
    }
  }

  /**
   * Get value of specified index, starting at the front
   * @param index Index to return. Defaults to 0
   * @returns Value at stored index
   */
  public peek(index = 0) {
    return this._storage[this._frontIndex + index];
  }

  /**
   * Get value of specified index, starting from the back
   * @param index Index to return. Defaults to 0
   * @returns Value at stored index
   */
  public backPeek(index = 0) {
    return this._storage[this._backIndex - index];
  }

  public get isEmpty() {
    return !this.storageLength;
  }

  public get isFull() {
    return this.storageLength === this.maxSize ? true : false;
  }

  public get storageLength() {
    return this._backIndex - this._frontIndex + 1;
  }

  public get maxSize() {
    return this._maxSize;
  }
}
