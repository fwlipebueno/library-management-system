const chave = 'biblioteca.sessao';

export function lerSessao() {
  try {
    const sessao = JSON.parse(sessionStorage.getItem(chave));
    if (typeof sessao?.token === 'string' && sessao.usuario?.id) return sessao;
  } catch {
    sessionStorage.removeItem(chave);
  }
  return null;
}

export function salvarSessao(sessao) {
  sessionStorage.setItem(chave, JSON.stringify(sessao));
}

export function limparSessao() {
  sessionStorage.removeItem(chave);
}
