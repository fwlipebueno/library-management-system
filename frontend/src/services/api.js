import { lerSessao } from './sessao';

const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8081').replace(/\/$/, '');

export async function api(caminho, { method = 'GET', body, autenticado = true } = {}) {
  const token = autenticado ? lerSessao()?.token : null;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  let resposta;
  try {
    resposta = await fetch(`${baseUrl}${caminho}`, {
      method, headers, body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw Object.assign(new Error('Não foi possível conectar à API. Verifique se o servidor está em execução.'), {
      status: 0, codigo: 'ERRO_REDE'
    });
  }
  const dados = resposta.status === 204 ? null : await resposta.json().catch(() => null);
  if (!resposta.ok) {
    const erro = Object.assign(new Error(dados?.erro || 'Não foi possível concluir a operação.'), {
      status: resposta.status, codigo: dados?.codigo || 'ERRO_HTTP'
    });
    if (resposta.status === 401 && token) {
      window.dispatchEvent(new CustomEvent('sessao-invalida', { detail: erro.message }));
    }
    throw erro;
  }
  return dados;
}
