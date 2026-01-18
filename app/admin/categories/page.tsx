"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { checkAuth } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  order: number;
  _count: {
    products: number;
  };
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth().then((session) => {
      if (!session) {
        router.push("/admin/login");
        return;
      }
      fetchCategories();
    });
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        toast.error("Kategoriler yüklenirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Kategori silindi");
        setCategories(categories.filter((c) => c.id !== id));
      } else {
        const data = await res.json();
        toast.error(data.error || "Kategori silinirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Bir hata oluştu");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-slate-600 hover:text-slate-900">
              <Link href="/admin/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">Kategori Yönetimi</h1>
          </div>
          <Button asChild className="bg-slate-900 hover:bg-slate-800">
            <Link href="/admin/categories/new">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Kategori Ekle
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {categories.length === 0 ? (
          <Card className="card-modern">
            <CardContent className="py-16 text-center">
              <Plus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-6">Henüz kategori eklenmemiş.</p>
              <Button asChild className="bg-slate-900 hover:bg-slate-800">
                <Link href="/admin/categories/new">
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Kategoriyi Ekle
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="card-modern overflow-hidden">
                {category.image && (
                  <div className="relative w-full h-48 bg-slate-100">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">{category.name}</CardTitle>
                  {category.description && (
                    <CardDescription className="line-clamp-2 text-sm">
                      {category.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">
                      {category._count.products} ürün
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" asChild className="border-slate-300">
                        <Link href={`/admin/categories/${category.id}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(category.id)}
                        disabled={category._count.products > 0}
                        className="border-slate-300 hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
