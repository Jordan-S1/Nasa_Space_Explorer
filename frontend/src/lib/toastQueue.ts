type ToastFn = () => void;

class ToastQueue {
  private queue: ToastFn[] = [];
  private isShowing = false;
  private delay = 3800; // ms between toasts

  enqueue(fn: ToastFn) {
    this.queue.push(fn);
    this.showNext();
  }

  private async showNext() {
    if (this.isShowing || this.queue.length === 0) return;
    this.isShowing = true;
    const fn = this.queue.shift();
    fn?.();
    await new Promise((res) => setTimeout(res, this.delay));
    this.isShowing = false;
    this.showNext();
  }
}

export const toastQueue = new ToastQueue();
