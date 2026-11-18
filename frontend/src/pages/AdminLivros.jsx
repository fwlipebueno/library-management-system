import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Avisos from '../components/Avisos';
import Disponibilidade from '../components/Disponibilidade';

const vazio = { titulo: '', autor: '', isbn: '', ano: '', quantidadeTotal: '' };

export default function AdminLivros() {
  const [livros, setLivros] = useState([]);
  const [formulario, setFormulario] = useState(vazio);
  const [id, setId] = useState(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [livroExcluir, setLivroExcluir] = useState(null);

  async function carregar() {
    setCarregando(true);
    try { setLivros(await api('/livros')); }
    catch (e) { setErro(e.message); }
    finally { setCarregando(false); }
  }
  useEffect(() => { carregar(); }, []);

  function alterar(evento) {
    setFormulario({ ...formulario, [evento.target.name]: evento.target.value });
  }

  function cancelar() {
    setId(null);
    setFormulario(vazio);
  }

  function editar(livro) {
    setId(livro.id);
    setFormulario({ titulo: livro.titulo, autor: livro.autor, isbn: livro.isbn, ano: String(livro.ano), quantidadeTotal: String(livro.quantidadeTotal) });
    setErro('');
    setSucesso('');
  }

  async function salvar(evento) {
    evento.preventDefault();
    setErro('');
    setSucesso('');
    setSalvando(true);
    try {
      await api(id ? `/livros/${id}` : '/livros', {
        method: id ? 'PUT' : 'POST',
        body: { ...formulario, ano: Number(formulario.ano), quantidadeTotal: Number(formulario.quantidadeTotal) }
      });
      setSucesso(id ? 'Livro atualizado.' : 'Livro cadastrado.');
      cancelar();
      await carregar();
    } catch (e) { setErro(e.message); }
    finally { setSalvando(false); }
  }

  async function excluir(livro) {
    setErro('');
    setSucesso('');
    setSalvando(true);
    try {
      await api(`/livros/${livro.id}`, { method: 'DELETE' });
      setSucesso('Livro excluído do catálogo.');
      setLivroExcluir(null);
      if (id === livro.id) cancelar();
      await carregar();
    } catch (e) { setErro(e.message); }
    finally { setSalvando(false); }
  }

  function confirmarExclusao(livro) {
    setLivroExcluir(livro);
    window.scrollTo(0, 0);
  }

  return <>
    <header className="cabecalho-pagina"><p className="sobretitulo">Administração / Acervo</p><h1>Administrar livros</h1><p>Mantenha os dados e a quantidade de exemplares do acervo.</p></header>
    <Avisos erro={erro} sucesso={sucesso} />
    {livroExcluir && <section className="painel">
      <h2>Confirmar exclusão</h2>
      <p>Excluir "{livroExcluir.titulo}" do catálogo? O histórico de empréstimos será preservado.</p>
      <div className="acoes"><button className="botao-perigo" disabled={salvando} onClick={() => excluir(livroExcluir)}>{salvando ? 'Excluindo...' : 'Confirmar exclusão'}</button><button className="botao-secundario" disabled={salvando} onClick={() => setLivroExcluir(null)}>Cancelar exclusão</button></div>
    </section>}
    <section className="painel">
      <h2>{id ? 'Editar livro' : 'Cadastrar livro'}</h2>
      <form className="form-grade" onSubmit={salvar}>
        <div className="campo"><label htmlFor="livro-titulo">Título</label><input id="livro-titulo" name="titulo" required maxLength={255} value={formulario.titulo} onChange={alterar} /></div>
        <div className="campo"><label htmlFor="livro-autor">Autor</label><input id="livro-autor" name="autor" required maxLength={255} value={formulario.autor} onChange={alterar} /></div>
        <div className="campo"><label htmlFor="livro-isbn">ISBN</label><input id="livro-isbn" name="isbn" required maxLength={64} value={formulario.isbn} onChange={alterar} /></div>
        <div className="linha-campos">
          <div className="campo"><label htmlFor="livro-ano">Ano</label><input id="livro-ano" name="ano" type="number" required min="1" max="9999" step="1" value={formulario.ano} onChange={alterar} /></div>
          <div className="campo"><label htmlFor="livro-quantidade">Quantidade total</label><input id="livro-quantidade" name="quantidadeTotal" type="number" required min="0" max="2147483647" step="1" value={formulario.quantidadeTotal} onChange={alterar} /></div>
        </div>
        <p className="ajuda linha-inteira">A disponibilidade é calculada automaticamente, preservando os exemplares emprestados.</p>
        <div className="acoes linha-inteira"><button disabled={salvando || carregando}>{salvando ? 'Salvando...' : id ? 'Salvar alterações' : 'Cadastrar livro'}</button>{id && <button className="botao-secundario" type="button" disabled={salvando} onClick={cancelar}>Cancelar edição</button>}</div>
      </form>
    </section>
    <section className="painel"><h2>Livros no catálogo</h2>
      {carregando ? <p role="status">Carregando livros...</p> : livros.length === 0 ? !erro && <p className="vazio">Nenhum livro cadastrado.</p> :
        <div className="tabela-container"><table><thead><tr><th>Título / Autor</th><th>ISBN</th><th>Ano</th><th>Disponibilidade</th><th>Ações</th></tr></thead>
          <tbody>{livros.map(livro => <tr key={livro.id}>
            <td><strong>{livro.titulo}</strong><small>{livro.autor}</small></td><td>{livro.isbn}</td><td>{livro.ano}</td><td><Disponibilidade livro={livro} /></td>
            <td><div className="acoes"><button className="botao-secundario pequeno" disabled={salvando} onClick={() => editar(livro)}>Editar</button><button className="botao-perigo pequeno" disabled={salvando} onClick={() => confirmarExclusao(livro)}>Excluir</button></div></td>
          </tr>)}</tbody></table></div>}
    </section>
  </>;
}
