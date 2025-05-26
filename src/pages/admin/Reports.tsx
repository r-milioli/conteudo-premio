import { useState, useEffect } from "react";
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
import { Calendar as CalendarIcon, FileDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Download {
  id: number;
  conteudo_id: number;
  conteudo_titulo: string;
  email: string;
  valor_contribuido: number;
  status_pagamento: string;
  data_acesso: string;
}

interface Statistics {
  totalDownloads: number;
  paidDownloads: number;
  totalRevenue: number;
}

const Reports = () => {
  const [activeTab, setActiveTab] = useState("downloads");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalDownloads: 0,
    paidDownloads: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReportData = async () => {
    try {
      console.log('Iniciando busca de dados...');
      setLoading(true);
      setError(null);
      
      let url = '/api/admin/reports?';
      
      if (searchTerm) {
        url += `search=${encodeURIComponent(searchTerm)}&`;
      }
      
      if (dateFilter) {
        const startDate = format(dateFilter, 'yyyy-MM-dd');
        const endDate = format(dateFilter, 'yyyy-MM-dd 23:59:59');
        url += `startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
      }

      console.log('Fazendo requisição para:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar dados');
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);

      if (!data || typeof data !== 'object') {
        throw new Error('Dados inválidos recebidos do servidor');
      }

      setDownloads(Array.isArray(data.downloads) ? data.downloads : []);
      setStatistics({
        totalDownloads: data.statistics?.totalDownloads || 0,
        paidDownloads: data.statistics?.paidDownloads || 0,
        totalRevenue: data.statistics?.totalRevenue || 0
      });
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar os dados');
      setDownloads([]);
      setStatistics({
        totalDownloads: 0,
        paidDownloads: 0,
        totalRevenue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Effect executado - buscando dados...');
    fetchReportData();
  }, [searchTerm, dateFilter]);

  const exportCSV = () => {
    if (!downloads.length) return;

    const header = "ID,Conteúdo,Email,Valor Contribuído,Status,Data\n";
    
    const csvContent = header +
      downloads.map(download => {
        return `${download.id},"${download.conteudo_titulo}",${download.email},${download.valor_contribuido},${download.status_pagamento},"${format(new Date(download.data_acesso), "dd/MM/yyyy HH:mm")}"`;
      }).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `downloads_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDateFilter(undefined);
  };

  // Renderização do componente
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <p className="text-gray-600">
          Visualize relatórios de downloads e contatos.
        </p>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchReportData} className="mt-2">
              Tentar novamente
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="downloads" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
          <TabsTrigger value="contacts">Contatos</TabsTrigger>
        </TabsList>

        <div className="mt-4 mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder={activeTab === 'downloads' ? "Buscar por email ou título..." : "Buscar por email..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" disabled={loading}>
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
          <Button variant="outline" onClick={clearFilters} disabled={loading}>
            Limpar Filtros
          </Button>
          <Button variant="outline" onClick={exportCSV} disabled={loading || !downloads.length}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        <TabsContent value="downloads">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-sm font-medium text-muted-foreground">Total de Downloads</p>
              <p className="text-2xl font-bold">{statistics.totalDownloads}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-sm font-medium text-muted-foreground">Downloads Pagos</p>
              <p className="text-2xl font-bold">{statistics.paidDownloads}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold">R$ {Number(statistics.totalRevenue || 0).toFixed(2)}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-3">Carregando dados...</span>
            </div>
          ) : downloads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum download encontrado
            </div>
          ) : (
            <div className="mt-6 overflow-hidden border rounded-lg">
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
                  {downloads.map((download) => (
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
          )}
        </TabsContent>

        <TabsContent value="contacts">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-3">Carregando dados...</span>
            </div>
          ) : downloads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum contato encontrado
            </div>
          ) : (
            <div className="mt-6 overflow-hidden border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Conteúdo</TableHead>
                    <TableHead>Tipo de Acesso</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {downloads.map((download) => (
                    <TableRow key={download.id}>
                      <TableCell>{download.email}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={download.conteudo_titulo}>
                        {download.conteudo_titulo}
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
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
