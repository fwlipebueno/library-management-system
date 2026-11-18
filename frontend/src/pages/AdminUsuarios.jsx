import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Avisos from '../components/Avisos';

const vazio = { nome: '', email: '', senha: '', perfil: 'usuario', ativo: true };

export default function AdminUsuarios({ aoAtualizarUsuario }) {
  const [usuarios, setUsuarios] = useState([]);
  const [formulario, setFormulario] = useState(vazio);
  const [id, setId] = useState(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setCarregando(true);
    try { setUsuarios(await api('/usuarios')); }
    catch (e) { setErro(e.message); }
    finally { setCarregando(false); }
  }
  useEffect(() => { carregar(); }, []);

  function alterar(evento) {
    const { name, value, type, checked } = evento.target;
    setFormulario({ ...formulario, [name]: type === 'checkbox' ? checked : value });
  }

  function cancelar() {
    setId(null);
    setFormulario(vazio);
  }

  function editar(usuario) {
    setId(usuario.id);
    setFormulario({ nome: usuario.nome, email: usuario.email, perfil: usuario.perfil, ativo: usuario.ativo, senha: '' });
    setErro('');
    setSucesso('');
  }

  async function salvar(evento) {
    evento.preventDefault();
    setErro('');
    setSucesso('');
    setSalvando(true);
    try {
      const dados = { ...formulario };
      if (id && dados.senha === '') delete dados.senha;
      const usuario = await api(id ? `/usuarios/${id}` : '/usuarios', { method: id ? 'PUT' : 'POST', body: dados });
      setSucesso(id ? 'Usuário atualizado.' : 'Usuário cadastrado.');
      cancelar();
      if (aoAtualizarUsuario(usuario)) return;
      await carregar();
    } catch (e) { setErro(e.message); }
    finally { setSalvando(false); }
  }

  return <>
    <header className="cabecalho-pagina"><p className="sobretitulo">Administração / Contas</p><h1>Administrar usuários</h1><p>Cadastre contas e gerencie os perfis de acesso à biblioteca.</p></header>
    <Avisos erro={erro} sucesso={sucesso} />
    <section className="painel"><h2>{id ? 'Editar usuário' : 'Cadastrar usuário'}</h2>
      <form className="form-grade" onSubmit={salvar}>
        <div className="campo"><label htmlFor="usuario-nome">Nome</label><input id="usuario-nome" name="nome" required maxLength={150} value={formulario.nome} onChange={alterar} /></div>
        <div className="campo"><label htmlFor="usuario-email">Email</label><input id="usuario-email" name="email" type="email" required maxLength={254} autoComplete="off" value={formulario.email} onChange={alterar} /></div>
        <div className="campo"><label htmlFor="usuario-senha">{id ? 'Nova senha (opcional)' : 'Senha'}</label><input id="usuario-senha" name="senha" type="password" required={!id} autoComplete="new-password" value={formulario.senha} onChange={alterar} />{id && <small>Deixe em branco para manter a senha atual.</small>}</div>
        <div className="campo"><label htmlFor="usuario-perfil">Perfil</label><select id="usuario-perfil" name="perfil" value={formulario.perfil} onChange={alterar}><option value="usuario">Usuário comum</option><option value="admin">Administrador</option></select></div>
        <label className="checkbox linha-inteira" htmlFor="usuario-ativo"><input id="usuario-ativo" type="checkbox" name="ativo" checked={formulario.ativo} onChange={alterar} />Conta ativa</label>
        <div className="acoes linha-inteira"><button disabled={salvando || carregando}>{salvando ? 'Salvando...' : id ? 'Salvar alterações' : 'Cadastrar usuário'}</button>{id && <button className="botao-secundario" type="button" disabled={salvando} onClick={cancelar}>Cancelar edição</button>}</div>
      </form>
    </section>
    <section className="painel"><h2>Usuários cadastrados</h2>
      {carregando ? <p role="status">Carregando usuários...</p> : usuarios.length === 0 ? !erro && <p className="vazio">Nenhum usuário cadastrado.</p> :
        <div className="tabela-container"><table><thead><tr><th>Nome</th><th>Email</th><th>Perfil</th><th>Conta</th><th>Ação</th></tr></thead><tbody>{usuarios.map(usuario => <tr key={usuario.id}>
          <td><strong>{usuario.nome}</strong></td><td>{usuario.email}</td><td>{usuario.perfil === 'admin' ? 'Administrador' : 'Usuário comum'}</td>
          <td><span className={`status ${usuario.ativo ? 'positivo' : 'neutro'}`}>{usuario.ativo ? 'Ativa' : 'Desativada'}</span></td>
          <td><button className="botao-secundario pequeno" disabled={salvando} onClick={() => editar(usuario)}>Editar</button></td>
        </tr>)}</tbody></table></div>}
    </section>
  </>;
}
