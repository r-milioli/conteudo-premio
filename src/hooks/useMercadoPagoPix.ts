import { useState } from 'react';

export const useMercadoPagoPix = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const createPixPayment = async (paymentData: {
    transaction_amount: number;
    description: string;
    payer: {
      email: string;
      identification?: {
        type: string;
        number: string;
      };
    };
  }) => {
    try {
      const response = await fetch('/api/payments/pix/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar pagamento PIX');
      }

      const responseData = await response.json();
      
      setQrCode(responseData.qr_code);
      setQrCodeBase64(responseData.qr_code_base64);
      setPaymentId(responseData.id);

      return responseData;
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      throw error;
    }
  };

  const checkPixStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/payments/pix/status/${id}`);
      
      if (!response.ok) {
        throw new Error('Erro ao verificar status do PIX');
      }

      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('Erro ao verificar status do PIX:', error);
      throw error;
    }
  };

  return {
    qrCode,
    qrCodeBase64,
    paymentId,
    createPixPayment,
    checkPixStatus,
  };
}; 