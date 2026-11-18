import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Avisos from '../components/Avisos';
import TabelaEmprestimos from '../components/TabelaEmprestimos';

export default function MeusEmprestimos() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api('/emprestimos/meus').then(setEmprestimos).catch(e => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  return <>
    <header className="cabecalho-pagina"><p className="sobretitulo">Minha conta / Circulação</p><h1>Meus empréstimos</h1><p>Consulte seus empréstimos ativos e o histórico de devoluções.</p></header>
    <Avisos erro={erro} />
    <section className="painel"><h2>Seu histórico</h2>
      {carregando ? <p role="status">Carregando seus empréstimos...</p> : !erro && <TabelaEmprestimos emprestimos={emprestimos} />}
    </section>
  </>;
}
