import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Title } from "@/ui/typography";
import { getColumns, type UnitRow } from "./columns";
import { useSelectedCompanyId } from "@/store/companyStore";
import type { Unit } from "@/types/unit";
import unitService from "@/api/services/unitService";
import { toast } from "sonner";

export default function UnitPage() {
  const selectedCompanyId = useSelectedCompanyId();
  const companyId = Number.parseInt(selectedCompanyId || "1", 10);

  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [editingUnit, setEditingUnit] = useState<UnitRow | null>(null);
  const [unitName, setUnitName] = useState<string>("");
  const [editingUnitName, setEditingUnitName] = useState<string>("");

  const fetchUnits = useCallback(async () => {
    const response = await unitService.getUnits(selectedCompanyId || "-1");
    setAllUnits(response.data);
  }, [selectedCompanyId]);

  useEffect(() => {
    void fetchUnits();
  }, [fetchUnits]);

  const units = useMemo(() => {
    return allUnits.filter((unit) => unit.companyId === companyId);
  }, [allUnits, companyId]);

  const handleCreateUnit = async () => {
    const normalizedName = unitName.trim();

    if (!normalizedName) {
      return;
    }

    if (allUnits.map<string>((u) => u.name.toLowerCase()).includes(normalizedName.toLowerCase())) {
      toast.error("Una unidad con este nombre ya existe");
      return;
    }

    await unitService.createUnit({ name: normalizedName, companyId: parseInt(selectedCompanyId || "-1") });

    await fetchUnits();
    setUnitName("");
    setCreateOpen(false);
  };

  const handleEditUnit = useCallback((unit: UnitRow) => {
    setEditingUnit(unit);
    setEditingUnitName(unit.name);
    setEditOpen(true);
  }, []);

  const handleUpdateUnit = async () => {
    if (!editingUnit) {
      return;
    }

    const normalizedName = editingUnitName.trim();
    if (!normalizedName) {
      return;
    }

    const currentUnit = allUnits.find((unit) => unit.id === editingUnit.id);
    const currentName = currentUnit?.name.trim().toLowerCase() ?? "";
    if (currentName === normalizedName.toLowerCase()) {
      setEditingUnit(null);
      setEditingUnitName("");
      setEditOpen(false);
      return;
    }

    const duplicatedName = allUnits.some(
      (unit) => unit.id !== editingUnit.id && unit.name.toLowerCase() === normalizedName.toLowerCase()
    );

    if (duplicatedName) {
      toast.error("Una unidad con este nombre ya existe");
      return;
    }

    await unitService.updateUnit({
      id: editingUnit.id,
      name: normalizedName,
      companyId,
    });

    await fetchUnits();
    setEditingUnit(null);
    setEditingUnitName("");
    setEditOpen(false);
  };

  const columns = useMemo(() => getColumns(handleEditUnit), [handleEditUnit]);

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <Title as="h1">Unidades</Title>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button className="w-fit cursor-pointer">Crear unidad</Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nueva unidad</DialogTitle>
            <DialogDescription>Ingresa el nombre de la unidad para crearla.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="unit-name">Nombre</Label>
            <Input
              id="unit-name"
              placeholder="Ej: Kilogramo"
              value={unitName}
              onChange={(event) => setUnitName(event.target.value)}
              maxLength={50}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUnit} disabled={!unitName.trim()}>
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(isOpen) => {
          setEditOpen(isOpen);
          if (!isOpen) {
            setEditingUnit(null);
            setEditingUnitName("");
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar unidad</DialogTitle>
            <DialogDescription>Actualiza el nombre de la unidad.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="edit-unit-name">Nombre</Label>
            <Input
              id="edit-unit-name"
              placeholder="Ej: Kilogramo"
              value={editingUnitName}
              onChange={(event) => setEditingUnitName(event.target.value)}
              maxLength={50}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUnit} disabled={!editingUnitName.trim()}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="h-full w-11/12">
        <DataTable
          columns={columns}
          data={units.map<UnitRow>((unit) => ({
            id: unit.id,
            name: unit.name,
          }))}
        />
      </div>
    </div>
  );
}
