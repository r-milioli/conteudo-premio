import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const UserManagement = () => {
  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Gerenciar Usuários</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Gerencie os usuários do sistema.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>
            O módulo de gerenciamento de usuários está em desenvolvimento.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default UserManagement; 