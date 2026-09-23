export function toCents(value:string):number {if(!/^\d{1,10}(\.\d{1,2})?$/.test(value)) throw new Error('Valor monetário inválido');const [whole,fraction='']=value.split('.');return Number(whole)*100+Number(fraction.padEnd(2,'0'));}
export function money(cents:number){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);}
