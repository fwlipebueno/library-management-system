import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Avisos from '../components/Avisos';

export default function Login({ sessao, aoAutenticar, aviso }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navegar = useNavigate();

  if (sessao) return <Navigate to="/" replace />;

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const dados = await api('/auth/login', { method: 'POST', body: { email, senha }, autenticado: false });
      aoAutenticar(dados);
      navegar('/', { replace: true });
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  return <main className="pagina-login">
    <section className="apresentacao-login">
      <p className="marca">Biblioteca<span>Sistema de gerenciamento</span></p>
      <div><p className="sobretitulo">Acervo e circulação</p>
        <h1>Livros, usuários<br />e empréstimos.</h1>
        <p>Consulte a disponibilidade do acervo e acompanhe seus empréstimos em um só lugar.</p>
      </div>
      <p className="texto-secundario">Programação Web Back-End · UTFPR</p>
    </section>
    <section className="area-login">
      <form className="form-login" onSubmit={enviar}>
        <p className="sobretitulo">Acesso ao sistema</p>
        <h2>Entre na sua conta</h2>
        <p className="texto-secundario">Informe o email e a senha cadastrados.</p>
        {aviso && <p className="aviso erro" role="alert">{aviso}</p>}
        <Avisos erro={erro} />
        <label htmlFor="login-email">Email</label>
        <input id="login-email" type="email" autoComplete="username" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} />
        <label htmlFor="login-senha">Senha</label>
        <input id="login-senha" type="password" autoComplete="current-password" required value={senha} onChange={e => setSenha(e.target.value)} />
        <button disabled={carregando}>{carregando ? 'Entrando...' : 'Entrar'}</button>
        <p className="ajuda">O cadastro de contas é realizado pela administração da biblioteca.</p>
      </form>
    </section>
  </main>;
}
