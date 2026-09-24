'use client';
import {useEffect,useRef,useState} from 'react';

type TicketNotice={id:string;subject:string;createdAt:string;user:{name:string}};
export function TicketNotifications(){
  const [permission,setPermission]=useState<NotificationPermission|undefined>();
  const [enabled,setEnabled]=useState(false);
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
    if(!enabled)return;
    const check=async()=>{
      const response=await fetch(`/api/admin/notifications?since=${encodeURIComponent(lastSeen.current)}`,{cache:'no-store'});
      if(!response.ok)return;
      const body=await response.json() as {tickets:TicketNotice[]};
      lastSeen.current=new Date().toISOString();
      for(const ticket of body.tickets){
        if(permission==='granted')new Notification('Novo chamado de suporte',{body:`${ticket.user.name}: ${ticket.subject}`});
        const context=audio.current;
        if(context){const oscillator=context.createOscillator();const gain=context.createGain();oscillator.frequency.value=880;gain.gain.value=.08;oscillator.connect(gain).connect(context.destination);oscillator.start();oscillator.stop(context.currentTime+.25);}
      }
    };
    const timer=window.setInterval(()=>void check(),15_000);
    return()=>window.clearInterval(timer);
  },[enabled,permission]);
  return <div className="notice row" style={{justifyContent:'space-between',marginBottom:24}}><span>Receba um aviso quando um cliente abrir um chamado.</span><button className="text-link" onClick={enable}>{enabled?'Alertas ativados':'Ativar alertas'}</button></div>;
}
