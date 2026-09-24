'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';

type TicketNotice={id:string;subject:string;createdAt:string;user:{name:string}};
export function TicketNotifications(){
  const [permission,setPermission]=useState<NotificationPermission|undefined>();
  const [enabled,setEnabled]=useState(false);
  const [newTickets,setNewTickets]=useState(0);
  const lastSeen=useRef(new Date().toISOString());
  const audio=useRef<AudioContext|null>(null);

  function enable(){
    setEnabled(true);
    if('Notification' in window){
      setPermission(Notification.permission);
      if(Notification.permission==='default')Notification.requestPermission().then(setPermission);
    }
    audio.current??=new AudioContext();
    void audio.current.resume();
  }
  useEffect(()=>{
    const check=async()=>{
      const response=await fetch(`/api/admin/notifications?since=${encodeURIComponent(lastSeen.current)}`,{cache:'no-store'});
      if(!response.ok)return;
      const body=await response.json() as {tickets:TicketNotice[]};
      lastSeen.current=new Date().toISOString();
      if(body.tickets.length)setNewTickets(value=>value+body.tickets.length);
      for(const ticket of body.tickets){
        if(enabled&&permission==='granted')new Notification('Novo chamado de suporte',{body:`${ticket.user.name}: ${ticket.subject}`});
        const context=audio.current;
        if(context){const oscillator=context.createOscillator();const gain=context.createGain();oscillator.frequency.value=880;gain.gain.value=.08;oscillator.connect(gain).connect(context.destination);oscillator.start();oscillator.stop(context.currentTime+.25);}
      }
    };
    const timer=window.setInterval(()=>void check(),15_000);
    return()=>window.clearInterval(timer);
  },[enabled,permission]);
  return <div className="notice row" style={{justifyContent:'space-between',marginBottom:24}}><span>{newTickets>0?<><strong>{newTickets} novo(s) chamado(s).</strong> <Link className="text-link" href="/admin/tickets" onClick={()=>setNewTickets(0)}>Ver tickets</Link></>:'Receba um aviso quando um cliente abrir um chamado.'}</span><button className="text-link" onClick={enable}>{enabled?'Alertas ativados':'Ativar alertas (toque para liberar som)'}</button></div>;
}
