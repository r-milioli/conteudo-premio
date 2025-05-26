import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, Download, DollarSign, Percent } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { useState, useEffect } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardStats {
  totalDownloads: number;
  paidDownloads: number;
  totalRevenue: number;
  totalAccesses: number;
  conversionRate: number;
}

interface ChartData {
  name: string;
  total: number;
}

interface RecentContent {
  id: number;
  title: string;
  status: string;
  date: string;
  downloads: number;
  revenue: number;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalDownloads: 0,
    paidDownloads: 0,
    totalRevenue: 0,
    totalAccesses: 0,
    conversionRate: 0
  });
  const [accessData, setAccessData] = useState<ChartData[]>([]);
  const [downloadData, setDownloadData] = useState<ChartData[]>([]);
  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [recentContents, setRecentContents] = useState<RecentContent[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar dados dos últimos 7 meses
        const sevenMonthsAgo = subMonths(new Date(), 7);
        const startDate = format(startOfMonth(sevenMonthsAgo), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');

        const response = await fetch(`/api/admin/reports?startDate=${startDate}&endDate=${endDate}`);
        
        if (!response.ok) {
          throw new Error('Erro ao carregar dados do dashboard');
        }

        const data = await response.json();

        // Processar dados para estatísticas
        const totalDownloads = data.statistics.totalDownloads;
        const paidDownloads = data.statistics.paidDownloads;
        const totalRevenue = data.statistics.totalRevenue;
        const conversionRate = (paidDownloads / totalDownloads * 100) || 0;

        setStats({
          totalDownloads,
          paidDownloads,
          totalRevenue,
          totalAccesses: totalDownloads * 2, // Estimativa de acessos
          conversionRate
        });

        // Processar dados para gráficos
        const monthlyData = new Map();
        const monthlyRevenue = new Map();
        const monthlyDownloads = new Map();

        // Inicializar os últimos 7 meses com 0
        for (let i = 0; i < 7; i++) {
          const date = subMonths(new Date(), i);
          const monthKey = format(date, 'MMM', { locale: ptBR });
          monthlyData.set(monthKey, 0);
          monthlyRevenue.set(monthKey, 0);
          monthlyDownloads.set(monthKey, 0);
        }

        // Preencher com dados reais
        data.downloads.forEach((access: any) => {
          const monthKey = format(new Date(access.data_acesso), 'MMM', { locale: ptBR });
          monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
          monthlyRevenue.set(monthKey, (monthlyRevenue.get(monthKey) || 0) + access.valor_contribuido);
          monthlyDownloads.set(monthKey, (monthlyDownloads.get(monthKey) || 0) + 1);
        });

        // Converter para arrays para os gráficos
        setAccessData(Array.from(monthlyData.entries()).map(([name, total]) => ({ name, total })).reverse());
        setDownloadData(Array.from(monthlyDownloads.entries()).map(([name, total]) => ({ name, total })).reverse());
        setRevenueData(Array.from(monthlyRevenue.entries()).map(([name, total]) => ({ name, total })).reverse());

        // Processar conteúdos recentes
        const contentsMap = new Map();
        data.downloads.forEach((access: any) => {
          if (!contentsMap.has(access.conteudo_id)) {
            contentsMap.set(access.conteudo_id, {
              id: access.conteudo_id,
              title: access.conteudo_titulo,
              status: 'published',
              date: format(new Date(access.data_acesso), 'dd/MM/yyyy'),
              downloads: 0,
              revenue: 0
            });
          }
          const content = contentsMap.get(access.conteudo_id);
          content.downloads += 1;
          content.revenue += access.valor_contribuido;
        });

        setRecentContents(Array.from(contentsMap.values())
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3));

      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        setError(error instanceof Error ? error.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-3">Carregando dados...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Bem-vindo ao painel administrativo do Conteúdo Premium.
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total de Acessos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalAccesses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total de Downloads
            </CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalDownloads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Taxa de Conversão
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm">Análises</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Acessos</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Número de acessos às páginas dos últimos 7 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={accessData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#4361EE" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Downloads</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Quantidade de downloads por mês
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={downloadData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" fill="#7209B7" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Receita</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Receita gerada pelos conteúdos nos últimos 7 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Relatório de Conteúdos</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Desempenho dos conteúdos mais recentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentContents.map((content) => (
                    <div key={content.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm sm:text-base">{content.title}</h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Publicado em {content.date}
                          </p>
                        </div>
                        <Badge variant={content.status === 'published' ? 'default' : 'outline'} className="self-start">
                          {content.status === 'published' ? 'Publicado' : 'Rascunho'}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between mt-2 text-xs sm:text-sm gap-2">
                        <span className="text-gray-600">
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                          {content.downloads} downloads
                        </span>
                        <span className="text-gray-600">
                          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                          R$ {content.revenue.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
