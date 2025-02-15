"use client";

import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { obtenerUsuariosPaginados } from '@/lib/services/usuarios.service';
import { capitalize } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Contrato } from '@/lib/types/contratos';
import { Usuario } from '@/lib/types/users';

export function UsuariosTable() {
  const searchParams = useSearchParams();
  const [usuarios, setUsuarios] = useState<
    (Usuario & { contracts?: Contrato[] })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoading(true);
      try {
        const page = parseInt(searchParams.get("page") ?? "1");
        const search = searchParams.get("search") ?? undefined;
        const estado = searchParams.get("estado") ?? undefined;
        const tipo = searchParams.get("tipo") ?? undefined;

        const response = await obtenerUsuariosPaginados({
          page,
          pageSize,
          search,
          estado: estado as "activo" | "vencido" | undefined,
          tipo: tipo as "activo" | "jubilado" | "admin" | "aduana" | "other" | undefined
        });

        setUsuarios(response.data);
        setTotal(response.total);
        setCurrentPage(response.page);
      } catch (error) {
        console.error("Error fetching usuarios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, [searchParams]);

  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    window.history.pushState(null, "", `?${params.toString()}`);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Legajo</TableHead>
            <TableHead>Apellido y Nombre</TableHead>
            <TableHead>CUIL</TableHead>
            <TableHead>Contratos</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((usuario) => (
            <TableRow key={usuario.id}>
              <TableCell>{usuario.legajo}</TableCell>
              <TableCell>{`${capitalize(
                usuario.apellido?.toLowerCase() ?? ""
              )}, ${capitalize(usuario.nombre?.toLowerCase() ?? "")}`}</TableCell>
              <TableCell>{usuario.cuil}</TableCell>
              <TableCell>
                <Link href={`/contratos/${usuario.id}`}>
                  <Button>Ver contratos</Button>
                </Link>
              </TableCell>
              <TableCell>
                {usuario.contracts && (
                  <Badge
                    variant={
                      usuario.contracts[0]?.estado === "activo"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {capitalize(usuario.contracts[0]?.estado)}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {usuario.contracts && (
                  <Badge
                    variant={
                      usuario.contracts[0]?.tipo === "activo"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {capitalize(usuario.contracts[0]?.tipo)}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Link href={`/usuarios/${usuario.id}`}>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <div className="text-sm text-muted-foreground">
          Página {currentPage} de {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
