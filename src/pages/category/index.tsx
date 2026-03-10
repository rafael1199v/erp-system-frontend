import { useEffect, useMemo, useState } from "react";
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
import { CategoryRow, columns } from "./columns";
import { useSelectedCompanyId } from "@/store/companyStore";
import type { Category } from "@/types/category";
import categoryService from "@/api/services/categoryService";
import { toast } from "sonner";


export default function CategoryPage() {
  const selectedCompanyId = useSelectedCompanyId();
  const companyId = Number.parseInt(selectedCompanyId || "1", 10);

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [categoryName, setCategoryName] = useState<string>("");

  const fetchCategories = async() => {
    const response = await categoryService.getCategories(selectedCompanyId || "-1");
    setAllCategories(response.data);
  }

  useEffect(() => {
    fetchCategories();
  }, [selectedCompanyId]);

  const categories = useMemo(() => {
    return allCategories.filter((category) => category.companyId === companyId);
  }, [allCategories, companyId]);

  const handleCreateCategory = async () => {
    const normalizedName = categoryName.trim();

    if (!normalizedName) {
      return;
    }

    // const nextId = allCategories.length > 0 ? Math.max(...allCategories.map((category) => category.categoryId)) + 1 : 1;

    if(allCategories.map<string>(c => c.name.toLowerCase()).includes(normalizedName.toLowerCase())) {
        toast.error("Una categoria con este nombre ya existe");
        return;
    }

    await categoryService.createCategory({ name: normalizedName, companyId: parseInt(selectedCompanyId || "-1")})
    
    fetchCategories();
    setCategoryName("");
    setOpen(false);
  };

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <Title as="h1">Categorias</Title>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-fit cursor-pointer">Crear categoria</Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nueva categoria</DialogTitle>
            <DialogDescription>Ingresa el nombre de la categoria para crearla.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="category-name">Nombre</Label>
            <Input
              id="category-name"
              placeholder="Ej: Abarrotes"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              maxLength={50}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCategory} disabled={!categoryName.trim()}>
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="h-full w-11/12">
        <DataTable columns={columns} data={categories.map<CategoryRow>(category => {
            return {
                id: category.id,
                name: category.name,
            }
        })} />
      </div>
    </div>
  );
}
