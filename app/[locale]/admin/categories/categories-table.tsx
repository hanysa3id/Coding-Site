"use client";

import { useState, useTransition, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Category } from "@/types/database";
import { CategoryForm } from "./category-form";
import { deleteCategoryAction } from "./actions";

type Props = { categories: Category[]; locale: string };

export function CategoriesTable({ categories, locale }: Props) {
  const isAr = locale === "ar";
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [isPending, startTransition] = useTransition();

  const tree = useMemo(() => buildTree(categories), [categories]);

  function onDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteCategoryAction(deleting.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحذف" : "Deleted");
      setDeleting(null);
    });
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <p className="text-sm text-muted-foreground">
            {isAr ? `${categories.length} قسم` : `${categories.length} categories`}
          </p>
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            {isAr ? "قسم جديد" : "New category"}
          </Button>
        </div>

        {categories.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground">
            {isAr ? "لا توجد أقسام بعد" : "No categories yet"}
          </p>
        ) : (
          <ul className="divide-y">
            {tree.map((node) => (
              <CategoryRow
                key={node.id}
                node={node}
                depth={0}
                isAr={isAr}
                onEdit={setEditing}
                onDelete={setDeleting}
              />
            ))}
          </ul>
        )}
      </CardContent>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? "قسم جديد" : "New category"}</DialogTitle>
          </DialogHeader>
          <CategoryForm
            categories={categories}
            locale={locale}
            onDone={() => setCreating(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? "تعديل قسم" : "Edit category"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <CategoryForm
              initial={editing}
              categories={categories}
              locale={locale}
              onDone={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? "تأكيد الحذف" : "Confirm delete"}</DialogTitle>
            <DialogDescription>
              {isAr
                ? "سيتم حذف هذا القسم وجميع أقسامه الفرعية. هل أنت متأكد؟"
                : "This will delete the category and all its sub-categories. Are you sure?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleting(null)} disabled={isPending}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={isPending}>
              {isAr ? "حذف" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

type Node = Category & { children: Node[] };

function buildTree(items: Category[]): Node[] {
  const map = new Map<string, Node>();
  items.forEach((i) => map.set(i.id, { ...i, children: [] }));
  const roots: Node[] = [];
  map.forEach((n) => {
    if (n.parent_id && map.has(n.parent_id)) {
      map.get(n.parent_id)!.children.push(n);
    } else {
      roots.push(n);
    }
  });
  return roots;
}

function CategoryRow({
  node,
  depth,
  isAr,
  onEdit,
  onDelete,
}: {
  node: Node;
  depth: number;
  isAr: boolean;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}) {
  return (
    <>
      <li className="flex items-center justify-between p-4 hover:bg-muted/30">
        <div className="flex items-center gap-3" style={{ paddingInlineStart: depth * 24 }}>
          <span className="font-medium">{isAr ? node.name_ar : node.name_en}</span>
          <code className="text-xs text-muted-foreground">{node.slug}</code>
          {!node.is_visible && (
            <Badge variant="secondary">{isAr ? "مخفي" : "Hidden"}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={() => onEdit(node)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onDelete(node)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </li>
      {node.children.map((c) => (
        <CategoryRow
          key={c.id}
          node={c}
          depth={depth + 1}
          isAr={isAr}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}
