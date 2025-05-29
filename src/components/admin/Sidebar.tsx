import { LayoutDashboard, FileText, Settings, Users, MessageSquare } from "lucide-react";

const menuItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard
    },
    {
        title: "Conteúdos",
        href: "/admin/conteudos",
        icon: FileText
    },
    {
        title: "Avaliações",
        href: "/admin/avaliacoes",
        icon: MessageSquare
    },
    {
        title: "Usuários",
        href: "/admin/usuarios",
        icon: Users
    },
    {
        title: "Configurações",
        href: "/admin/configuracoes",
        icon: Settings
    }
]; 