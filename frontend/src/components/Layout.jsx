import { Link, NavLink, Outlet } from 'react-router-dom';

export default function Layout({ usuario, aoSair }) {
  const admin = usuario.perfil === 'admin';
  return <div className="aplicacao">
    <aside className="lateral">
      <Link to="/" className="marca">Biblioteca<span>Gerenciamento de acervo</span></Link>
      <nav aria-label="Navegação principal">
        <p className="rotulo-menu">Consulta</p>
        <NavLink to="/" end>Início</NavLink>
        <NavLink to="/livros" end>Catálogo</NavLink>
        <NavLink to="/meus-emprestimos">Meus empréstimos</NavLink>
        {admin && <>
          <p className="rotulo-menu">Administração</p>
          <NavLink to="/admin/livros">Livros</NavLink>
          <NavLink to="/admin/usuarios">Usuários</NavLink>
          <NavLink to="/admin/emprestimos">Empréstimos</NavLink>
        </>}
      </nav>
      <div className="conta">
        <strong>{usuario.nome}</strong>
        <span>{admin ? 'Administrador' : 'Usuário comum'}</span>
        <button className="botao-secundario" onClick={() => aoSair()}>Sair da conta</button>
      </div>
    </aside>
    <main className="conteudo"><Outlet /></main>
  </div>;
}
