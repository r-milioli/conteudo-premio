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

        const mercadopago = new window.MercadoPago(publicKey, {
          locale: 'pt-BR'
        });
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
      // Criar o token do cartão
      const cardTokenData = {
        cardNumber: paymentData.card.number.replace(/\s/g, ''),
        cardholderName: paymentData.card.cardholder.name,
        cardExpirationMonth: paymentData.card.expiration_month,
        cardExpirationYear: paymentData.card.expiration_year,
        securityCode: paymentData.card.security_code,
        identificationType: paymentData.card.cardholder.identification.type,
        identificationNumber: paymentData.card.cardholder.identification.number
      };

      console.log('Dados para geração do token:', cardTokenData);

      const cardToken = await mp.createCardToken(cardTokenData);

      console.log('Token do cartão gerado:', cardToken);

      if (!cardToken.id) {
        throw new Error('Erro ao gerar token do cartão');
      }

      // Identificar o método de pagamento baseado nos primeiros dígitos do cartão
      const bin = paymentData.card.number.replace(/\s/g, '').substring(0, 6);
      const paymentMethodResult = await mp.getPaymentMethods({
        bin: bin
      });

      if (!paymentMethodResult.results || !paymentMethodResult.results[0]) {
        throw new Error('Não foi possível identificar o método de pagamento');
      }

      const paymentMethod = paymentMethodResult.results[0];

      // Enviar para o backend processar o pagamento
      const paymentPayload = {
        token: cardToken.id,
        transaction_amount: Number(paymentData.transaction_amount),
        description: paymentData.description,
        installments: 1,
        payment_method_id: paymentMethod.id,
        issuer_id: paymentMethod.issuer.id,
        payer: {
          email: paymentData.payer.email,
          identification: {
            type: 'CPF',
            number: paymentData.card.cardholder.identification.number
          }
        },
        binary_mode: true
      };

      console.log('Payload do pagamento:', paymentPayload);

      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro na resposta do servidor:', errorData);
        throw new Error(errorData.error || 'Erro ao processar pagamento');
      }

      const responseData = await response.json();
      console.log('Resposta do processamento:', responseData);

      return responseData;
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