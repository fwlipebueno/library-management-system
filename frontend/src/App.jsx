import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { lerSessao, salvarSessao, limparSessao } from './services/sessao';
import RotaProtegida from './components/RotaProtegida';
import Layout from './components/Layout';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import Catalogo from './pages/Catalogo';
import DetalhesLivro from './pages/DetalhesLivro';
import AdminLivros from './pages/AdminLivros';
import AdminUsuarios from './pages/AdminUsuarios';
import Emprestimos from './pages/Emprestimos';
import MeusEmprestimos from './pages/MeusEmprestimos';
import NaoEncontrada from './pages/NaoEncontrada';

export default function App() {
  const [sessao, setSessao] = useState(lerSessao);
  const [aviso, setAviso] = useState('');

  function entrar(dados) {
    salvarSessao(dados);
    setSessao(dados);
    setAviso('');
  }

  function sair(mensagem = '') {
    limparSessao();
    setSessao(null);
    setAviso(mensagem);
  }

  useEffect(() => {
    const invalidar = evento => sair(evento.detail);
    window.addEventListener('sessao-invalida', invalidar);
    return () => window.removeEventListener('sessao-invalida', invalidar);
  }, []);

  function usuarioAtualizado(usuario) {
    if (usuario.id !== sessao.usuario.id) return false;
    sair('Seus dados de acesso foram alterados. Entre novamente.');
    return true;
  }

  return <BrowserRouter><Routes>
    <Route path="/login" element={<Login sessao={sessao} aoAutenticar={entrar} aviso={aviso} />} />
    <Route element={<RotaProtegida sessao={sessao} />}>
      <Route element={<Layout usuario={sessao?.usuario} aoSair={sair} />}>
        <Route path="/" element={<Inicio usuario={sessao?.usuario} />} />
        <Route path="/livros" element={<Catalogo />} />
        <Route path="/livros/:id" element={<DetalhesLivro />} />
        <Route path="/meus-emprestimos" element={<MeusEmprestimos />} />
        <Route element={<RotaProtegida sessao={sessao} admin />}>
          <Route path="/admin/livros" element={<AdminLivros />} />
          <Route path="/admin/usuarios" element={<AdminUsuarios aoAtualizarUsuario={usuarioAtualizado} />} />
          <Route path="/admin/emprestimos" element={<Emprestimos />} />
        </Route>
        <Route path="*" element={<NaoEncontrada />} />
      </Route>
    </Route>
  </Routes></BrowserRouter>;
}
