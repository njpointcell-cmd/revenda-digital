import {describe,it,expect} from 'vitest';
import {cartTotal} from '@/services/cart/calculation';
import {cartSchema} from '@/validations/cart';
import {toCents} from '@/utils/money';
const item={productId:'id',quantity:3,name:'Demo',slug:'demo',unitPriceCents:1990,availableStock:5};
describe('carrinho',()=>{it('calcula em centavos exatos',()=>expect(cartTotal([item])).toBe(5970));it('total vazio é zero',()=>expect(cartTotal([])).toBe(0));it.each([0,-1,1.5,100,NaN])('rejeita quantidade inválida %s',quantity=>expect(()=>cartTotal([{...item,quantity}])).toThrow());it('rejeita IDs duplicados',()=>expect(cartSchema.safeParse([{productId:'id',quantity:1},{productId:'id',quantity:2}]).success).toBe(false));it('descarta preço enviado pelo cliente',()=>expect(cartSchema.parse([{productId:'id',quantity:1,price:0}])[0]).not.toHaveProperty('price'));});
describe('dinheiro',()=>{it.each([['0.10',10],['29.9',2990],['100',10000],['9999999999.99',999999999999]])('converte %s', (value,cents)=>expect(toCents(value)).toBe(cents));it.each(['-1','1.234','abc','1e3'])('rejeita %s',value=>expect(()=>toCents(value)).toThrow());});
