/** Fire a lightweight toast message; ToastHost renders it. */
export function toast(message: string, durationMs = 2400) {
  window.dispatchEvent(new CustomEvent('mus:toast', { detail: { message, durationMs } }));
}
