import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Avisos from '../components/Avisos';
import TabelaEmprestimos from '../components/TabelaEmprestimos';

const vazio = { usuarioId: '', livroId: '', dataPrevista: '' };

export default function Emprestimos() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [livros, setLivros] = useState([]);
  const [formulario, setFormulario] = useState(vazio);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setCarregando(true);
    try {
      const [historico, contas, acervo] = await Promise.all([api('/emprestimos'), api('/usuarios'), api('/livros')]);
      setEmprestimos(historico);
      setUsuarios(contas.filter(usuario => usuario.ativo));
      setLivros(acervo);
    } catch (e) { setErro(e.message); }
    finally { setCarregando(false); }
  }
  useEffect(() => { carregar(); }, []);

  function alterar(evento) {
    setFormulario({ ...formulario, [evento.target.name]: evento.target.value });
  }

  async function salvar(evento) {
    evento.preventDefault();
    setErro('');
    setSucesso('');
    setSalvando(true);
    try {
      await api('/emprestimos', { method: 'POST', body: {
        usuarioId: Number(formulario.usuarioId), livroId: Number(formulario.livroId), dataPrevista: formulario.dataPrevista
      } });
      setFormulario(vazio);
      setSucesso('Empréstimo registrado. Disponibilidade atualizada.');
      await carregar();
    } catch (e) { setErro(e.message); }
    finally { setSalvando(false); }
  }

  async function devolver(id) {
    setErro('');
    setSucesso('');
    setSalvando(true);
    try {
      await api(`/emprestimos/${id}/devolucao`, { method: 'PATCH' });
      setSucesso('Devolução registrada. Exemplar disponível no acervo.');
      await carregar();
    } catch (e) { setErro(e.message); }
    finally { setSalvando(false); }
  }

  return <>
    <header className="cabecalho-pagina"><p className="sobretitulo">Administração / Circulação</p><h1>Empréstimos e devoluções</h1><p>Registre a saída dos exemplares e acompanhe o histórico da biblioteca.</p></header>
    <Avisos erro={erro} sucesso={sucesso} />
    <section className="painel"><h2>Registrar empréstimo</h2>
      <form className="form-grade" onSubmit={salvar}>
        <div className="campo"><label htmlFor="emprestimo-usuario">Usuário</label><select id="emprestimo-usuario" name="usuarioId" required value={formulario.usuarioId} onChange={alterar}><option value="">Selecione uma conta ativa</option>{usuarios.map(usuario => <option key={usuario.id} value={usuario.id}>{usuario.nome} ({usuario.email})</option>)}</select></div>
        <div className="campo"><label htmlFor="emprestimo-livro">Livro</label><select id="emprestimo-livro" name="livroId" required value={formulario.livroId} onChange={alterar}><option value="">Selecione um livro disponível</option>{livros.map(livro => <option key={livro.id} value={livro.id} disabled={livro.quantidadeDisponivel === 0}>{livro.titulo} — {livro.quantidadeDisponivel} disponível(is)</option>)}</select></div>
        <div className="campo"><label htmlFor="emprestimo-data">Data prevista de devolução</label><input id="emprestimo-data" name="dataPrevista" type="date" required value={formulario.dataPrevista} onChange={alterar} /></div>
        <p className="ajuda">A data do empréstimo é registrada automaticamente pelo servidor.</p>
        <div className="acoes linha-inteira"><button disabled={salvando || carregando}>{salvando ? 'Registrando...' : 'Registrar empréstimo'}</button></div>
      </form>
    </section>
    <section className="painel"><h2>Histórico de empréstimos</h2>
      {carregando ? <p role="status">Carregando empréstimos...</p> : (emprestimos.length > 0 || !erro) && <TabelaEmprestimos emprestimos={emprestimos} mostrarUsuario aoDevolver={devolver} ocupado={salvando} />}
    </section>
  </>;
}
