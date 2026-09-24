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

  async function enable(){
    setEnabled(true);
    if('Notification' in window){
      let nextPermission=Notification.permission;
      if(nextPermission==='default')nextPermission=await Notification.requestPermission();
      setPermission(nextPermission);
      if(nextPermission==='granted'){
        try{
          const config=await fetch('/api/admin/push-subscription',{cache:'no-store'});
          if(config.ok){
            const {publicKey}=await config.json() as {publicKey:string};
            const registration=await navigator.serviceWorker.register('/sw.js');
            const subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:toUint8Array(publicKey)});
            await fetch('/api/admin/push-subscription',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(subscription.toJSON())});
          }
        }catch(error){console.error('Não foi possível ativar notificações push.',error);}
      }
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

function toUint8Array(value:string){
  const padding='='.repeat((4-value.length%4)%4);
  const base64=(value+padding).replace(/-/g,'+').replace(/_/g,'/');
  return Uint8Array.from(atob(base64),character=>character.charCodeAt(0));
}
