export function downloadList(message: string): void {
  const url = URL.createObjectURL(new Blob([message], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'lista-comprasfit.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function shareList(message: string): Promise<string> {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Minha lista ComprasFit', text: message });
      return '';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return '';
    }
  }
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(message);
      return 'Lista copiada! Agora você pode colar em uma mensagem.';
    } catch { /* Download works without clipboard permission or HTTPS. */ }
  }
  downloadList(message);
  return 'Lista baixada em formato de texto.';
}
