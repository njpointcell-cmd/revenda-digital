export interface EmailProvider {sendPasswordReset(input:{to:string;resetUrl:string}):Promise<void>}
export class EmailNotConfiguredError extends Error {constructor(){super('Recuperação por e-mail ainda não disponível.');}}
export function getEmailProvider():EmailProvider {throw new EmailNotConfiguredError();}
