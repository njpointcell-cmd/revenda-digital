'use client';
import {useState} from 'react';
import {useCart} from './cart-provider';
import {Button} from '@/components/ui';
export function AddToCart({id,stock}:{id:string;stock:number}){const {add,items,ready}=useCart();const [added,setAdded]=useState(false);const quantity=items.find(i=>i.productId===id)?.quantity??0;return <><Button disabled={!ready||quantity>=Math.min(stock,99)} onClick={()=>{add(id);setAdded(true);}}>{stock===0?'Indisponível':'Adicionar ao carrinho'}</Button>{added&&<small role="status">Adicionado ao carrinho.</small>}</>;}
