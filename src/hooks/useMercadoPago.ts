import { useEffect, useState } from 'react';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export const useMercadoPago = () => {
  const [mp, setMp] = useState<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.type = 'text/javascript';
    script.onload = async () => {
      try {
        // Busca a chave pública do Mercado Pago da API
        const response = await fetch('/api/config/mercadopago');
        if (!response.ok) {
          throw new Error('Erro ao buscar configuração do Mercado Pago');
        }
        const { publicKey } = await response.json();
        
        if (!publicKey) {
          throw new Error('Chave pública do Mercado Pago não configurada');
        }

        const mercadopago = new window.MercadoPago(publicKey);
        setMp(mercadopago);
      } catch (error) {
        console.error('Erro ao inicializar Mercado Pago:', error);
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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