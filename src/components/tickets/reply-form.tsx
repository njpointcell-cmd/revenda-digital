'use client';
import {useActionState} from 'react';
import {Button,ErrorState} from '@/components/ui';
import type {ActionState} from '@/lib/action-state';
export function ReplyForm({action,ticketId}:{action:(state:ActionState,form:FormData)=>Promise<ActionState>;ticketId:string}){
  const [state,formAction,pending]=useActionState<ActionState,FormData>(action,{});
  return <form action={formAction} encType="multipart/form-data" className="form card"><input type="hidden" name="ticketId" value={ticketId}/>{state.error&&<ErrorState message={state.error}/>} {state.success&&<p className="success">{state.success}</p>}<label className="field">Responder<textarea name="body" required minLength={2} maxLength={5000} rows={5}/></label><label className="field">Anexo (JPG, PNG ou WebP, até 5 MB)<input name="attachment" type="file" accept="image/jpeg,image/png,image/webp"/></label><Button disabled={pending}>{pending?'Enviando…':'Enviar resposta'}</Button></form>;
}
