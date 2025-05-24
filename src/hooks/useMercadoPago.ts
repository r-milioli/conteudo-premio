import { useEffect, useState } from 'react';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export const useMercadoPago = (publicKey: string) => {
  const [mp, setMp] = useState<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.type = 'text/javascript';
    script.onload = () => {
      const mercadopago = new window.MercadoPago(publicKey);
      setMp(mercadopago);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [publicKey]);

  const createPayment = async (paymentData: any) => {
    if (!mp) {
      throw new Error('Mercado Pago não está inicializado');
    }

    try {
      const response = await mp.checkout({
        preference: {
          items: [{
            title: paymentData.description,
            unit_price: paymentData.transaction_amount,
            quantity: 1,
          }],
          payer: {
            email: paymentData.payer.email,
          },
        },
      });

      return response;
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      throw error;
    }
  };

  return {
    mp,
    createPayment,
  };
}; 