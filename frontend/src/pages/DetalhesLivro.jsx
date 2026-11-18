import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import Avisos from '../components/Avisos';
import Disponibilidade from '../components/Disponibilidade';

export default function DetalhesLivro() {
  const { id } = useParams();
  const [livro, setLivro] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let atual = true;
    setCarregando(true);
    setErro('');
    api(`/livros/${id}`).then(dados => { if (atual) setLivro(dados); })
      .catch(e => { if (atual) setErro(e.message); })
      .finally(() => { if (atual) setCarregando(false); });
    return () => { atual = false; };
  }, [id]);

  return <>
    <Link className="voltar" to="/livros">← Voltar ao catálogo</Link>
    <header className="cabecalho-pagina"><p className="sobretitulo">Acervo / Detalhes</p><h1>Detalhes do livro</h1></header>
    <Avisos erro={erro} />
    {carregando ? <p role="status">Carregando livro...</p> : !erro && livro && <article className="painel detalhe-livro">
      <p className="texto-secundario">Registro #{livro.id}</p>
      <h2>{livro.titulo}</h2><p className="autor-livro">{livro.autor}</p>
      <Disponibilidade livro={livro} />
      <dl className="dados-livro">
        <div><dt>ISBN</dt><dd>{livro.isbn}</dd></div><div><dt>Ano</dt><dd>{livro.ano}</dd></div>
        <div><dt>Total de exemplares</dt><dd>{livro.quantidadeTotal}</dd></div>
        <div><dt>Exemplares disponíveis</dt><dd>{livro.quantidadeDisponivel}</dd></div>
      </dl>
    </article>}
  </>;
}
