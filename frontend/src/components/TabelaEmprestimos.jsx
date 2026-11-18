function formatarData(valor) {
  if (!valor) return '—';
  const data = valor.length === 10 ? new Date(`${valor}T12:00:00`) : new Date(valor);
  return data.toLocaleDateString('pt-BR');
}

export default function TabelaEmprestimos({ emprestimos, mostrarUsuario = false, aoDevolver, ocupado = false }) {
  if (emprestimos.length === 0) return <p className="vazio">Nenhum empréstimo registrado.</p>;
  return <div className="tabela-container"><table>
    <thead><tr>
      <th>Livro</th>
      {mostrarUsuario && <th>Usuário</th>}
      <th>Empréstimo</th><th>Prevista</th><th>Devolução</th><th>Status</th>
      {aoDevolver && <th>Ação</th>}
    </tr></thead>
    <tbody>{emprestimos.map(emprestimo => <tr key={emprestimo.id}>
      <td><strong>{emprestimo.livro.titulo}</strong><small>Registro #{emprestimo.id}{!emprestimo.livro.ativo && ' · Livro excluído do catálogo'}</small></td>
      {mostrarUsuario && <td>{emprestimo.usuario.nome}<small>{emprestimo.usuario.email}</small></td>}
      <td>{formatarData(emprestimo.dataEmprestimo)}</td>
      <td>{formatarData(emprestimo.dataPrevista)}</td>
      <td>{formatarData(emprestimo.dataDevolucao)}</td>
      <td><span className={`status ${emprestimo.status === 'ativo' ? 'positivo' : 'neutro'}`}>
        {emprestimo.status === 'ativo' ? 'Ativo' : 'Devolvido'}
      </span></td>
      {aoDevolver && <td>{emprestimo.status === 'ativo' &&
        <button className="botao-secundario pequeno" disabled={ocupado} onClick={() => aoDevolver(emprestimo.id)}>Devolver</button>
      }</td>}
    </tr>)}</tbody>
  </table></div>;
}
