'use client';
import {createContext,useContext,useSyncExternalStore} from 'react';
import type {CartItem} from '@/types/cart';
import {cartSchema} from '@/validations/cart';
const EMPTY:CartItem[]=[];
let snapshot=EMPTY;
let rawSnapshot:string|null=null;
const listeners=new Set<()=>void>();
function read(){try{const raw=localStorage.getItem('nj-cart');if(raw!==rawSnapshot){rawSnapshot=raw;const parsed=cartSchema.safeParse(JSON.parse(raw??'[]'));snapshot=parsed.success?parsed.data:EMPTY;}}catch{}return snapshot;}
function subscribe(listener:()=>void){listeners.add(listener);window.addEventListener('storage',listener);return ()=>{listeners.delete(listener);window.removeEventListener('storage',listener);};}
function write(items:CartItem[]){snapshot=items;rawSnapshot=JSON.stringify(items);try{localStorage.setItem('nj-cart',rawSnapshot);}catch{}listeners.forEach(l=>l());}
const CartContext=createContext<{items:CartItem[];ready:boolean;setQuantity:(id:string,q:number)=>void;add:(id:string)=>void;clear:()=>void}>({items:[],ready:false,setQuantity:()=>{},add:()=>{},clear:()=>{}});
export function CartProvider({children}:{children:React.ReactNode}){const items=useSyncExternalStore(subscribe,read,()=>EMPTY);const ready=useSyncExternalStore(subscribe,()=>true,()=>false);
function setQuantity(id:string,q:number){if(!Number.isInteger(q))return;write(q<=0?items.filter(i=>i.productId!==id):items.map(i=>i.productId===id?{...i,quantity:Math.min(99,q)}:i));}
function add(id:string){const item=items.find(i=>i.productId===id);if(item)write(items.map(i=>i.productId===id?{...i,quantity:Math.min(99,i.quantity+1)}:i));else if(items.length<50)write([...items,{productId:id,quantity:1}]);}
return <CartContext.Provider value={{items,ready,setQuantity,add,clear:()=>write([])}}>{children}</CartContext.Provider>;}
export function useCart(){return useContext(CartContext);}
