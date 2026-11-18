import { Link } from 'react-router-dom';

export default function Inicio({ usuario }) {
  const admin = usuario.perfil === 'admin';
  return <>
    <header className="cabecalho-pagina">
      <p className="sobretitulo">Página inicial</p>
      <h1>Olá, {usuario.nome}.</h1>
      <p>Consulte o acervo e acompanhe a circulação dos livros.</p>
    </header>
    <section className="painel identificacao">
      <div><h2>Seu acesso</h2><p>{usuario.email}</p></div>
      <span className="status positivo">{admin ? 'Administrador' : 'Usuário comum'}</span>
    </section>
    <div className="grade-funcoes">
      <Link className="funcao" to="/livros"><h2>Catálogo de livros</h2><p>Pesquise por título ou autor e consulte os exemplares disponíveis.</p><span>Abrir catálogo →</span></Link>
      <Link className="funcao" to="/meus-emprestimos"><h2>Meus empréstimos</h2><p>Consulte seus empréstimos ativos e o histórico de devoluções.</p><span>Consultar histórico →</span></Link>
      {admin && <>
        <Link className="funcao" to="/admin/livros"><h2>Administrar livros</h2><p>Cadastre, edite ou exclua livros conforme as regras do acervo.</p><span>Gerenciar acervo →</span></Link>
        <Link className="funcao" to="/admin/usuarios"><h2>Administrar usuários</h2><p>Cadastre contas, atualize informações e gerencie a ativação.</p><span>Gerenciar usuários →</span></Link>
        <Link className="funcao" to="/admin/emprestimos"><h2>Empréstimos e devoluções</h2><p>Registre a circulação e consulte todos os empréstimos da biblioteca.</p><span>Gerenciar empréstimos →</span></Link>
      </>}
    </div>
  </>;
}
