'use client';
import {useEffect,useState} from 'react';
import {money} from '@/utils/money';
export function WalletBalance(){const [balance,setBalance]=useState<number|null>(null);useEffect(()=>{fetch('/api/wallet/balance',{cache:'no-store'}).then(response=>response.ok?response.json():null).then(data=>{if(data)setBalance(Number(data.balance));}).catch(()=>undefined);},[]);if(balance===null)return null;return <span className="wallet-balance">Saldo: {money(Math.round(balance*100))}</span>;}
