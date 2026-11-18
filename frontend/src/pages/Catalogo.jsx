import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Avisos from '../components/Avisos';
import LivroCard from '../components/LivroCard';

export default function Catalogo() {
  const [livros, setLivros] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  async function carregar(filtros = {}) {
    setCarregando(true);
    setErro('');
    try {
      const query = new URLSearchParams(filtros);
      setLivros(await api(`/livros?${query}`));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  function pesquisar(evento) {
    evento.preventDefault();
    carregar({ titulo, autor });
  }

  function limpar() {
    setTitulo('');
    setAutor('');
    carregar();
  }

  return <>
    <header className="cabecalho-pagina"><p className="sobretitulo">Acervo</p><h1>Catálogo de livros</h1><p>Encontre um título e consulte a disponibilidade dos exemplares.</p></header>
    <form className="painel pesquisa" onSubmit={pesquisar}>
      <div className="campo"><label htmlFor="pesquisa-titulo">Título</label><input id="pesquisa-titulo" maxLength={255} placeholder="Nome ou parte do título" value={titulo} onChange={e => setTitulo(e.target.value)} /></div>
      <div className="campo"><label htmlFor="pesquisa-autor">Autor</label><input id="pesquisa-autor" maxLength={255} placeholder="Nome ou parte do autor" value={autor} onChange={e => setAutor(e.target.value)} /></div>
      <button disabled={carregando}>Pesquisar</button>
      <button className="botao-secundario" type="button" disabled={carregando} onClick={limpar}>Limpar</button>
    </form>
    <Avisos erro={erro} />
    {carregando ? <p className="vazio" role="status">Carregando livros...</p> : !erro && (
      livros.length === 0 ? <p className="vazio">Nenhum livro encontrado para esta pesquisa.</p> :
        <div className="grade-livros">{livros.map(livro => <LivroCard key={livro.id} livro={livro} />)}</div>
    )}
  </>;
}
