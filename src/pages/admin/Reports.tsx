
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Download, FileDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data for demonstration
const mockDownloads = [
  {
    id: 1,
    conteudo_id: 1,
    conteudo_titulo: "Como Gravar Vídeos Profissionais",
    email: "joao@example.com",
    valor_contribuido: 15.0,
    status_pagamento: "aprovado",
    data_acesso: "2023-07-15T10:30:00Z",
  },
  {
    id: 2,
    conteudo_id: 1,
    conteudo_titulo: "Como Gravar Vídeos Profissionais",
    email: "maria@example.com",
    valor_contribuido: 0,
    status_pagamento: "gratuito",
    data_acesso: "2023-07-16T14:45:00Z",
  },
  {
    id: 3,
    conteudo_id: 2,
    conteudo_titulo: "Edição de Vídeo para Iniciantes",
    email: "pedro@example.com",
    valor_contribuido: 25.0,
    status_pagamento: "aprovado",
    data_acesso: "2023-07-17T09:15:00Z",
  },
  {
    id: 4,
    conteudo_id: 3,
    conteudo_titulo: "Como Criar Thumbnails Atraentes",
    email: "ana@example.com",
    valor_contribuido: 10.0,
    status_pagamento: "aprovado",
    data_acesso: "2023-07-18T16:20:00Z",
  },
  {
    id: 5,
    conteudo_id: 2,
    conteudo_titulo: "Edição de Vídeo para Iniciantes",
    email: "lucas@example.com",
    valor_contribuido: 0,
    status_pagamento: "gratuito",
    data_acesso: "2023-07-19T11:10:00Z",
  },
];

const mockContacts = [
  {
    id: 1,
    nome: "Carlos Souza",
    email: "carlos@example.com",
    assunto: "Dúvida sobre download",
    mensagem: "Olá, estou tendo problemas para acessar o material após o pagamento. Poderia me ajudar?",
    data_envio: "2023-07-10T08:45:00Z",
  },
  {
    id: 2,
    nome: "Mariana Santos",
    email: "mariana@example.com",
    assunto: "Proposta de parceria",
    mensagem: "Gostaria de propor uma parceria para divulgação dos seus materiais no meu canal.",
    data_envio: "2023-07-12T14:30:00Z",
  },
  {
    id: 3,
    nome: "Rafael Lima",
    email: "rafael@example.com",
    assunto: "Problema com pagamento",
    mensagem: "Realizei o pagamento, mas não recebi o link para download. O que devo fazer?",
    data_envio: "2023-07-15T16:20:00Z",
  },
];

const Reports = () => {
  const [activeTab, setActiveTab] = useState("downloads");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  // Filter downloads based on search term and date filter
  const filteredDownloads = mockDownloads.filter((download) => {
    const matchesSearch =
      download.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      download.conteudo_titulo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = dateFilter
      ? format(new Date(download.data_acesso), "yyyy-MM-dd") ===
        format(dateFilter, "yyyy-MM-dd")
      : true;

    return matchesSearch && matchesDate;
  });

  // Filter contacts based on search term and date filter
  const filteredContacts = mockContacts.filter((contact) => {
    const matchesSearch =
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.assunto.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = dateFilter
      ? format(new Date(contact.data_envio), "yyyy-MM-dd") ===
        format(dateFilter, "yyyy-MM-dd")
      : true;

    return matchesSearch && matchesDate;
  });

  // Calculate download statistics
  const totalDownloads = filteredDownloads.length;
  const paidDownloads = filteredDownloads.filter(
    (download) => download.status_pagamento === "aprovado"
  ).length;
  const totalRevenue = filteredDownloads.reduce(
    (sum, download) => sum + download.valor_contribuido,
    0
  );

  // Export data as CSV
  const exportCSV = () => {
    const exportData = activeTab === "downloads" ? filteredDownloads : filteredContacts;
    const header =
      activeTab === "downloads"
        ? "ID,Conteúdo,Email,Valor Contribuído,Status,Data\n"
        : "ID,Nome,Email,Assunto,Mensagem,Data\n";
    
    const csvContent = header +
      exportData.map(row => {
        if (activeTab === "downloads") {
          const download = row as typeof filteredDownloads[0];
          return `${download.id},"${download.conteudo_titulo}",${download.email},${download.valor_contribuido},${download.status_pagamento},"${format(new Date(download.data_acesso), "dd/MM/yyyy HH:mm")}"`;
        } else {
          const contact = row as typeof filteredContacts[0];
          return `${contact.id},"${contact.nome}",${contact.email},"${contact.assunto}","${contact.mensagem}","${format(new Date(contact.data_envio), "dd/MM/yyyy HH:mm")}"`;
        }
      }).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${activeTab}_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDateFilter(undefined);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <p className="text-gray-600">
          Visualize relatórios de downloads e contatos.
        </p>
      </div>

      <Tabs defaultValue="downloads" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
          <TabsTrigger value="contacts">Contatos</TabsTrigger>
        </TabsList>

        <div className="mt-4 mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Buscar por email, título ou assunto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, "dd/MM/yyyy") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button variant="outline" onClick={clearFilters}>
            Limpar Filtros
          </Button>
          <Button variant="outline" onClick={exportCSV}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        <TabsContent value="downloads" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-sm font-medium text-muted-foreground">Total de Downloads</p>
              <p className="text-2xl font-bold">{totalDownloads}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-sm font-medium text-muted-foreground">Downloads Pagos</p>
              <p className="text-2xl font-bold">{paidDownloads}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Conteúdo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDownloads.map((download) => (
                  <TableRow key={download.id}>
                    <TableCell>{download.id}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={download.conteudo_titulo}>
                      {download.conteudo_titulo}
                    </TableCell>
                    <TableCell>{download.email}</TableCell>
                    <TableCell>
                      {download.valor_contribuido > 0
                        ? `R$ ${download.valor_contribuido.toFixed(2)}`
                        : "Gratuito"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          download.status_pagamento === "aprovado"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {download.status_pagamento === "aprovado" ? "Pago" : "Gratuito"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(download.data_acesso), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>{contact.nome}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.assunto}</TableCell>
                    <TableCell className="max-w-[300px] truncate" title={contact.mensagem}>
                      {contact.mensagem}
                    </TableCell>
                    <TableCell>
                      {format(new Date(contact.data_envio), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
