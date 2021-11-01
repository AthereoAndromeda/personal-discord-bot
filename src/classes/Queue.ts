export class Queue<T> {
  private _elements: T[] = [];

  constructor(items?: T[]);
  constructor(...items: T[]);

  constructor(items?: T[]) {
    items ? this._elements.push(...items) : null;
  }

  public enqueue(element: T) {
    return this._elements.unshift(element);
  }

  public dequeue() {
    return this._elements.pop();
  }

  public isEmpty() {
    return this._elements.length === 0;
  }

  /**
   * Get index of Queue without modifying it
   * @param index Defaults to 0
   */
  public peek(index = 0) {
    return this.isEmpty() ? undefined : this._elements[index];
  }

  public get elements() {
    return this._elements;
  }

  public get length() {
    return this._elements.length;
  }
}

export default Queue;
