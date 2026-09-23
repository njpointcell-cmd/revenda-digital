'use client';
import {useActionState} from 'react';
import {syncSupplier} from '@/services/admin/actions';
import {Button,ErrorState} from '@/components/ui';
import type {ActionState} from '@/lib/action-state';

export function SupplierSyncForm({configured}:{configured:boolean}){
  const [state,action,pending]=useActionState<ActionState,FormData>(syncSupplier,{});
  return <form action={action} className="stack card">
    {state.error&&<ErrorState message={state.error}/>}
    {state.success&&<p className="success">{state.success}</p>}
    <p className="muted">Importa nome, categoria, custo, estoque e preço calculado dos produtos do fornecedor.</p>
    <Button disabled={pending||!configured}>{pending?'Sincronizando…':'Sincronizar catálogo agora'}</Button>
    {!configured&&<p className="error">Configure SUPPLIER_API_URL no arquivo .env antes de sincronizar.</p>}
  </form>;
}
