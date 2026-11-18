import { Link } from 'react-router-dom';
import Disponibilidade from './Disponibilidade';

export default function LivroCard({ livro }) {
  return <article className="livro-card">
    <div>
      <p className="texto-secundario">{livro.autor}</p>
      <h3><Link to={`/livros/${livro.id}`}>{livro.titulo}</Link></h3>
      <p className="texto-secundario">{livro.ano} <span aria-hidden="true">·</span> ISBN {livro.isbn}</p>
    </div>
    <div className="rodape-card">
      <Disponibilidade livro={livro} />
      <Link to={`/livros/${livro.id}`}>Ver detalhes</Link>
    </div>
  </article>;
}
