
import { CheckCircle, CreditCard, Download } from "lucide-react";

const steps = [
  {
    icon: <CheckCircle className="h-8 w-8 text-brand-blue" />,
    title: "Escolha o Conteúdo",
    description: "Navegue pela nossa biblioteca e escolha o material que vai te ajudar a crescer"
  },
  {
    icon: <CreditCard className="h-8 w-8 text-brand-blue" />,
    title: "Contribuição Opcional",
    description: "Defina quanto deseja contribuir - até mesmo R$0,00 se preferir"
  },
  {
    icon: <Download className="h-8 w-8 text-brand-blue" />,
    title: "Acesso Imediato",
    description: "Receba acesso instantâneo ao conteúdo premium após sua contribuição"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Como Funciona</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Acesse conteúdos premium em apenas 3 passos simples
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="p-6 text-center rounded-lg border hover:shadow-md transition-all animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
