import {PaymentView} from '@/components/payments/payment-view';
export default async function PaymentPage({params}:{params:Promise<{orderId:string}>}){const {orderId}=await params;return <PaymentView orderId={orderId}/>;}
