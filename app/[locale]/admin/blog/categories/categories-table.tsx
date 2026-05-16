"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, FileText, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { BlogCategory } from "@/types/database";
import { BlogCategoryForm } from "./category-form";
import { deleteBlogCategoryAction } from "../actions";

type Props = {
  categories: BlogCategory[];
  locale: string;
  postCountMap?: Record<string, number>;
};

export function BlogCategoriesTable({ categories, locale, postCountMap = {} }: Props) {
  const isAr = locale === "ar";
  const [editing, setEditing] = useState<BlogCategory | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<BlogCategory | null>(null);
  const [isPending, startTransition] = useTransition();

  const tree = useMemo(() => buildTree(categories), [categories]);

  function onDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteBlogCategoryAction(deleting.id);
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
                postCountMap={postCountMap}
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
          <BlogCategoryForm
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
            <BlogCategoryForm
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
                ? "سيتم حذف هذا القسم. أقسامه الفرعية ستصبح أقساماً رئيسية، ومقالاته ستصبح بدون قسم."
                : "Sub-categories will become root, and posts in this category will become uncategorized."}
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

type Node = BlogCategory & { children: Node[] };

function buildTree(items: BlogCategory[]): Node[] {
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
  postCountMap,
}: {
  node: Node;
  depth: number;
  isAr: boolean;
  onEdit: (c: BlogCategory) => void;
  onDelete: (c: BlogCategory) => void;
  postCountMap: Record<string, number>;
}) {
  const description = isAr ? node.description_ar : node.description_en;
  const count = postCountMap[node.id] ?? 0;
  return (
    <>
      <li className="flex items-center justify-between p-4 hover:bg-muted/30 transition">
        <div
          className="flex items-center gap-3 flex-1 min-w-0"
          style={{ paddingInlineStart: depth * 24 }}
        >
          {depth > 0 && <span className="text-muted-foreground text-xs shrink-0">└</span>}
          <div className="relative h-10 w-10 shrink-0 rounded-md overflow-hidden bg-muted border flex items-center justify-center">
            {node.image_url ? (
              <Image src={node.image_url} alt="" fill sizes="40px" className="object-cover" />
            ) : (
              <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium truncate">{isAr ? node.name_ar : node.name_en}</span>
              <code className="text-xs text-muted-foreground">{node.slug}</code>
              {!node.is_visible && (
                <Badge variant="secondary">{isAr ? "مخفي" : "Hidden"}</Badge>
              )}
              {count > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  {count}
                  {isAr ? " مقالة" : " posts"}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
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
          postCountMap={postCountMap}
        />
      ))}
    </>
  );
}
