export default function Disponibilidade({ livro }) {
  return <span className={`status ${livro.quantidadeDisponivel > 0 ? 'positivo' : 'neutro'}`}>
    {livro.quantidadeDisponivel > 0 ? 'Disponível' : 'Indisponível'}
    {' · '}{livro.quantidadeDisponivel} de {livro.quantidadeTotal} exemplar(es)
  </span>;
}
