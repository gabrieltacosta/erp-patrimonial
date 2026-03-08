// src/lib/permissions.ts

interface UserSession {
  role: string;
  filialId?: string | null;
  empresaId?: string | null;
}

/**
 * CAMADA 1: VISÃO (Data Tenancy)
 * Retorna o objeto `where` do Prisma para garantir que o utilizador
 * só vê o que a sua Role permite.
 */
export function getTenantFilter(user: UserSession) {
  // Super Admin vê TUDO da sua Empresa (todas as filiais)
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN_MATRIZ") {
    // Se não tiver empresaId (ex: erro de setup), trava a busca retornando um ID impossível
    if (!user.empresaId) return { id: "unauthorized" }; 
    
    return { 
      filial: { empresaId: user.empresaId } 
    };
  }

  // Gestor e Usuário Padrão vêem apenas a sua própria filial
  if (!user.filialId) return { id: "unauthorized" };
  
  return { 
    filialId: user.filialId 
  };
}

/**
 * CAMADA 2: AÇÃO (Write Access)
 * Retorna true se o utilizador pode criar, editar ou apagar registos.
 */
export function canWrite(role: string) {
  return role === "SUPER_ADMIN" || role === "ADMIN_MATRIZ" || role === "GESTOR_FILIAL";
}