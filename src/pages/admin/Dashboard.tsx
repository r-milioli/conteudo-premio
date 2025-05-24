
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, Download, DollarSign, Percent, BarChart2 } from "lucide-react";
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

// Dados simulados para os gráficos
const accessData = [
  { name: "Jan", total: 125 },
  { name: "Fev", total: 348 },
  { name: "Mar", total: 217 },
  { name: "Abr", total: 423 },
  { name: "Mai", total: 529 },
  { name: "Jun", total: 632 },
  { name: "Jul", total: 782 },
];

const downloadData = [
  { name: "Jan", total: 45 },
  { name: "Fev", total: 132 },
  { name: "Mar", total: 97 },
  { name: "Abr", total: 213 },
  { name: "Mai", total: 245 },
  { name: "Jun", total: 321 },
  { name: "Jul", total: 412 },
];

const revenueData = [
  { name: "Jan", total: 125 },
  { name: "Fev", total: 467 },
  { name: "Mar", total: 329 },
  { name: "Abr", total: 642 },
  { name: "Mai", total: 765 },
  { name: "Jun", total: 897 },
  { name: "Jul", total: 1205 },
];

// Dados de conteúdos recentes
const recentContents = [
  {
    id: 1,
    title: "Como Gravar Vídeos Profissionais",
    status: "published",
    date: "12/05/2023",
    downloads: 245,
    revenue: 1245.50
  },
  {
    id: 2,
    title: "Edição de Vídeo para Iniciantes",
    status: "published",
    date: "24/06/2023",
    downloads: 187,
    revenue: 932.25
  },
  {
    id: 3,
    title: "Como Criar Thumbnails Atraentes",
    status: "published",
    date: "07/07/2023",
    downloads: 153,
    revenue: 765.00
  }
];

const Dashboard = () => {
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
            <div className="text-xl sm:text-2xl font-bold">3,056</div>
            <p className="text-xs text-muted-foreground">
              +20.1% em relação ao último mês
            </p>
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
            <div className="text-xl sm:text-2xl font-bold">1,465</div>
            <p className="text-xs text-muted-foreground">
              +15.2% em relação ao último mês
            </p>
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
            <div className="text-xl sm:text-2xl font-bold">R$ 4.325,78</div>
            <p className="text-xs text-muted-foreground">
              +12.5% em relação ao último mês
            </p>
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
            <div className="text-xl sm:text-2xl font-bold">47.9%</div>
            <p className="text-xs text-muted-foreground">
              +5.1% em relação ao último mês
            </p>
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
