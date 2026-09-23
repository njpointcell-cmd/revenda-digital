import type {ButtonHTMLAttributes,InputHTMLAttributes,ReactNode} from 'react';
export function Button({className='',...props}:ButtonHTMLAttributes<HTMLButtonElement>){return <button className={`button ${className}`} {...props}/>;}
export function Input({label,...props}:InputHTMLAttributes<HTMLInputElement>&{label:string}){return <label className="field"><span>{label}</span><input {...props}/></label>;}
export function Card({children}:{children:ReactNode}){return <div className="card">{children}</div>;}
export function Badge({children}:{children:ReactNode}){return <span className="badge">{children}</span>;}
export function EmptyState({title,description}:{title:string;description?:string}){return <div className="empty"><h2>{title}</h2>{description&&<p>{description}</p>}</div>;}
export function LoadingState(){return <div className="empty" role="status">Carregando…</div>;}
export function ErrorState({message}:{message:string}){return <p className="error" role="alert">{message}</p>;}
