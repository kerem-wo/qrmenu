"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ArrowLeft, Package } from "lucide-react";
import Image from "next/image";
import { checkAuth } from "@/lib/auth-client";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isAvailable: boolean;
  stock: number | null;
  category: {
    name: string;
  };
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth().then((session) => {
      if (!session) {
        router.push("/admin/login");
      } else {
        fetchProducts();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProducts]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Ürün silindi");
        setProducts((prevProducts) => prevProducts.filter((p) => p.id !== id));
      } else {
        const data = await res.json();
        toast.error(data.error || "Ürün silinirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }, []);

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
              <h1 className="premium-heading-3">Ürün Yönetimi</h1>
            </div>
            <Button asChild className="premium-btn-primary">
              <Link href="/admin/products/new">
                <Plus className="w-5 h-5 mr-2" />
                Yeni Ürün Ekle
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="premium-container py-10">
        {products.length === 0 ? (
          <div className="premium-card p-16 text-center animate-premium-fade-in">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-gray-200 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
            </div>
            <h3 className="premium-heading-3 mb-4">Henüz ürün eklenmemiş</h3>
            <p className="text-gray-600 mb-8 font-medium">İlk ürününüzü ekleyerek başlayın</p>
            <Button asChild className="premium-btn-primary">
              <Link href="/admin/products/new">
                <Plus className="w-5 h-5 mr-2" />
                İlk Ürünü Ekle
              </Link>
            </Button>
          </div>
        ) : (
          <div className="premium-grid premium-grid-3">
            {products.map((product, index) => (
              <div key={product.id} className="premium-card overflow-hidden premium-hover-lift animate-premium-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                {product.image && (
                  <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-500 font-medium">{product.category.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      product.isAvailable 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {product.isAvailable ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                    {product.description || "Açıklama yok"}
                  </p>
                  {product.stock !== null && (
                    <p className={`text-xs mb-4 font-semibold ${
                      product.stock === 0 
                        ? "text-red-600" 
                        : product.stock < 10 
                        ? "text-orange-600" 
                        : "text-gray-600"
                    }`}>
                      Stok: {product.stock} adet
                    </p>
                  )}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex flex-col gap-3">
                      <span className="text-xl sm:text-2xl font-black text-gray-900 break-words">
                        {product.price.toFixed(2)} ₺
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild className="premium-btn-secondary px-4 py-2 text-sm font-bold flex-1 sm:flex-none min-w-0">
                          <Link href={`/admin/products/${product.id}/edit`} className="flex items-center justify-center gap-2 w-full">
                            <Edit className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">Düzenle</span>
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDelete(product.id)}
                          className="premium-btn-secondary px-4 py-2 text-sm font-bold flex-1 sm:flex-none min-w-0 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                          aria-label="Ürünü sil"
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
