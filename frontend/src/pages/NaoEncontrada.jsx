import { Link } from 'react-router-dom';

export default function NaoEncontrada() {
  return <section className="painel">
    <p className="sobretitulo">Página não encontrada</p><h1>Este endereço não existe.</h1>
    <p>Use o menu ou retorne à página inicial da biblioteca.</p><Link to="/">Voltar para o início</Link>
  </section>;
}
