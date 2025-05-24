
import React from "react";

const PrivacyPage = () => {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
      
      <div className="prose max-w-none">
        <h2>1. Informações que Coletamos</h2>
        <p>
          A plataforma Conteúdo Premium coleta apenas as informações essenciais para fornecer nossos serviços:
        </p>
        <ul>
          <li><strong>Endereço de e-mail:</strong> Para enviar os links de acesso aos conteúdos solicitados</li>
          <li><strong>Dados de pagamento:</strong> Processados de forma segura através do Mercado Pago</li>
          <li><strong>Dados de navegação:</strong> Cookies técnicos necessários para o funcionamento do site</li>
        </ul>
        
        <h2>2. Como Utilizamos suas Informações</h2>
        <p>
          Utilizamos suas informações pessoais exclusivamente para:
        </p>
        <ul>
          <li>Enviar os materiais digitais solicitados para seu e-mail</li>
          <li>Processar contribuições financeiras quando aplicável</li>
          <li>Melhorar a experiência de navegação em nossa plataforma</li>
          <li>Comunicar atualizações importantes sobre nossos serviços</li>
        </ul>
        
        <h2>3. Compartilhamento de Informações</h2>
        <p>
          Não compartilhamos, vendemos ou alugamos suas informações pessoais para terceiros, exceto:
        </p>
        <ul>
          <li>Quando necessário para processar pagamentos através do Mercado Pago</li>
          <li>Para cumprir obrigações legais ou responder a solicitações governamentais</li>
          <li>Com provedores de serviços que nos auxiliam na operação da plataforma, sob rigorosos acordos de confidencialidade</li>
        </ul>
        
        <h2>4. Segurança dos Dados</h2>
        <p>
          Implementamos medidas de segurança adequadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui:
        </p>
        <ul>
          <li>Criptografia SSL para transmissão de dados</li>
          <li>Armazenamento seguro de informações</li>
          <li>Acesso restrito aos dados pessoais apenas por pessoal autorizado</li>
          <li>Monitoramento regular de nossas práticas de segurança</li>
        </ul>
        
        <h2>5. Cookies e Tecnologias Similares</h2>
        <p>
          Utilizamos cookies técnicos essenciais para:
        </p>
        <ul>
          <li>Manter suas preferências de navegação</li>
          <li>Garantir o funcionamento adequado da plataforma</li>
          <li>Fornecer uma experiência personalizada</li>
        </ul>
        <p>
          Você pode configurar seu navegador para recusar cookies, mas isso pode afetar a funcionalidade do site.
        </p>
        
        <h2>6. Retenção de Dados</h2>
        <p>
          Mantemos suas informações pessoais apenas pelo tempo necessário para:
        </p>
        <ul>
          <li>Fornecer os serviços solicitados</li>
          <li>Cumprir obrigações legais</li>
          <li>Resolver disputas</li>
        </ul>
        <p>
          Após esse período, os dados são excluídos de forma segura de nossos sistemas.
        </p>
        
        <h2>7. Seus Direitos</h2>
        <p>
          De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
        </p>
        <ul>
          <li>Acessar suas informações pessoais</li>
          <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
          <li>Solicitar a exclusão de seus dados pessoais</li>
          <li>Revogar seu consentimento a qualquer momento</li>
          <li>Solicitar a portabilidade de seus dados</li>
        </ul>
        
        <h2>8. Menores de Idade</h2>
        <p>
          Nossa plataforma não é direcionada a menores de 18 anos. Não coletamos intencionalmente informações pessoais de menores. Se tomarmos conhecimento de que coletamos dados de um menor, tomaremos medidas para excluir essas informações.
        </p>
        
        <h2>9. Alterações nesta Política</h2>
        <p>
          Podemos atualizar esta Política de Privacidade periodicamente. Quando fizermos alterações significativas, notificaremos você através do e-mail fornecido ou por meio de um aviso em nossa plataforma.
        </p>
        
        <h2>10. Contato</h2>
        <p>
          Se você tiver dúvidas sobre esta Política de Privacidade ou quiser exercer seus direitos, entre em contato conosco:
        </p>
        <ul>
          <li>E-mail: privacidade@conteudopremium.com</li>
          <li>Através da página de contato em nosso site</li>
        </ul>
        
        <h2>11. Transferência Internacional de Dados</h2>
        <p>
          Seus dados pessoais são armazenados e processados no Brasil. Caso seja necessário transferir dados para outros países, garantiremos que sejam aplicadas as proteções adequadas conforme exigido pela LGPD.
        </p>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Última atualização: 25 de maio de 2025</p>
      </div>
    </div>
  );
};

export default PrivacyPage;
