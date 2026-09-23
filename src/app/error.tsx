'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="empty"><h1>Não foi possível carregar esta página</h1><p>Verifique se o banco foi configurado ou tente novamente em instantes.</p><button className="button" onClick={reset}>Tentar novamente</button></div>;}
