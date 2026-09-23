import {it,expect} from 'vitest';
import {newToken,hashToken} from '@/lib/tokens';
it('gera tokens imprevisíveis e hashes dependentes do segredo',()=>{const a=newToken(),b=newToken();expect(a).not.toBe(b);expect(a.length).toBeGreaterThanOrEqual(43);expect(hashToken(a,'secret-a')).not.toBe(a);expect(hashToken(a,'secret-a')).toBe(hashToken(a,'secret-a'));expect(hashToken(a,'secret-a')).not.toBe(hashToken(a,'secret-b'));});
