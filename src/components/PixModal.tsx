import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string | null;
  qrCodeBase64: string | null;
  paymentId: string | null;
  onPaymentSuccess: () => void;
  checkStatus: (id: string) => Promise<string>;
}

export function PixModal({
  isOpen,
  onClose,
  qrCode,
  qrCodeBase64,
  paymentId,
  onPaymentSuccess,
  checkStatus
}: PixModalProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos em segundos
  const { settings } = useSiteSettings();
  const primaryColor = settings?.primaryColor || '#4361ee';

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    if (isOpen && paymentId) {
      // Timer para expiração do PIX
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onClose();
            toast({
              title: "PIX expirado",
              description: "O tempo para pagamento expirou. Por favor, tente novamente.",
              variant: "destructive",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Verificação do status do pagamento
      const checkPaymentStatus = async () => {
        if (!isChecking && paymentId) {
          setIsChecking(true);
          try {
            const status = await checkStatus(paymentId);
            if (status === 'approved') {
              onPaymentSuccess();
              onClose();
            }
          } catch (error) {
            console.error('Erro ao verificar status:', error);
          } finally {
            setIsChecking(false);
          }
        }
      };

      // Verifica o status a cada 5 segundos
      timeout = setInterval(checkPaymentStatus, 5000);
    }

    return () => {
      clearInterval(interval);
      clearInterval(timeout);
    };
  }, [isOpen, paymentId, onClose, onPaymentSuccess, checkStatus, isChecking]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async () => {
    if (qrCode) {
      try {
        await navigator.clipboard.writeText(qrCode);
        toast({
          title: "Código PIX copiado!",
          description: "Cole no seu aplicativo do banco para pagar",
        });
      } catch (err) {
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o código PIX",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pagamento via PIX</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {qrCodeBase64 && (
            <img
              src={`data:image/png;base64,${qrCodeBase64}`}
              alt="QR Code PIX"
              className="w-64 h-64"
            />
          )}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Escaneie o QR Code ou copie o código PIX
            </p>
            <p className="text-sm font-medium">
              Tempo restante: {formatTime(timeLeft)}
            </p>
          </div>
          <Button
            onClick={copyToClipboard}
            className={cn(
              "w-full transition-colors",
              "hover:opacity-90"
            )}
            style={{ 
              backgroundColor: primaryColor,
              color: 'white'
            }}
            disabled={!qrCode || isChecking}
          >
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando pagamento...
              </>
            ) : (
              "Copiar código PIX"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 