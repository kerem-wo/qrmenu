"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  isAvailable: boolean;
  _count: {
    products: number;
  };
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    checkAuth().then((session) => {
      if (!session) {
        router.push("/admin/login");
        return;
      }
      fetchCategories();
    });
  }, [router]);

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

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isAvailable: !currentStatus,
        }),
      });

      if (res.ok) {
        toast.success(`Kategori ${!currentStatus ? "aktif" : "pasif"} edildi`);
        setCategories((prevCategories) =>
          prevCategories.map((c) => (c.id === id ? { ...c, isAvailable: !currentStatus } : c))
        );
      } else {
        const data = await res.json();
        toast.error(data.error || "Kategori durumu güncellenirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error toggling category availability:", error);
      toast.error("Bir hata oluştu");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen premium-bg-gradient">
      <header className="premium-glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="premium-container">
          <div className="flex justify-between items-center py-5">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild className="premium-btn-secondary px-4 py-2">
                <Link href="/admin/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Geri
                </Link>
              </Button>
              <h1 className="premium-heading-3">Kategori Yönetimi</h1>
            </div>
            <Button asChild className="premium-btn-primary">
              <Link href="/admin/categories/new">
                <Plus className="w-5 h-5 mr-2" />
                Yeni Kategori Ekle
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="premium-container py-10">
        {categories.length === 0 ? (
          <div className="premium-card p-16 text-center animate-premium-fade-in">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-gray-200 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center">
                <Plus className="w-10 h-10 text-gray-400" />
              </div>
            </div>
            <h3 className="premium-heading-3 mb-4">Henüz kategori eklenmemiş</h3>
            <p className="text-gray-600 mb-8 font-medium">İlk kategorinizi ekleyerek başlayın</p>
            <Button asChild className="premium-btn-primary">
              <Link href="/admin/categories/new">
                <Plus className="w-5 h-5 mr-2" />
                İlk Kategoriyi Ekle
              </Link>
            </Button>
          </div>
        ) : (
          <div className="premium-grid premium-grid-3">
            {categories.map((category, index) => (
              <div key={category.id} className="premium-card overflow-hidden premium-hover-lift animate-premium-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                {category.image && (
                  <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                        <Checkbox
                          checked={category.isAvailable}
                          onCheckedChange={() => handleToggleAvailability(category.id, category.isAvailable)}
                          className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        />
                        <label className="text-xs font-medium text-gray-700 cursor-pointer">
                          {category.isAvailable ? "Aktif" : "Pasif"}
                        </label>
                      </div>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                      {category.description}
                    </p>
                  )}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex flex-col gap-3">
                      <span className="text-sm font-bold text-gray-600 break-words">
                        {category._count.products} ürün
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild className="premium-btn-secondary px-4 py-2 text-sm font-bold flex-1 sm:flex-none min-w-0">
                          <Link href={`/admin/categories/${category.id}/edit`} className="flex items-center justify-center gap-2 w-full">
                            <Edit className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">Düzenle</span>
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDelete(category.id)}
                          disabled={category._count.products > 0}
                          className="premium-btn-secondary px-4 py-2 text-sm font-bold flex-1 sm:flex-none min-w-0 hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                        >
                          <span className="flex items-center justify-center gap-2 w-full">
                            <Trash2 className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">Sil</span>
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
