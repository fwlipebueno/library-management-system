export default function Avisos({ erro, sucesso }) {
  return <>
    {erro && <p className="aviso erro" role="alert">{erro}</p>}
    {sucesso && <p className="aviso sucesso" role="status">{sucesso}</p>}
  </>;
}
