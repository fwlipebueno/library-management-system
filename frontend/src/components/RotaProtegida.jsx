import { Link, Navigate, Outlet } from 'react-router-dom';

export default function RotaProtegida({ sessao, admin = false }) {
  if (!sessao) return <Navigate to="/login" replace />;
  if (admin && sessao.usuario.perfil !== 'admin') {
    return <section className="painel">
      <h1>Acesso não permitido</h1>
      <p>Esta página é exclusiva para administradores.</p>
      <Link to="/">Voltar para o início</Link>
    </section>;
  }
  return <Outlet />;
}
