"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  }, [fetchProducts, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Ürün silindi");
        setProducts(products.filter((p) => p.id !== id));
      } else {
        const data = await res.json();
        toast.error(data.error || "Ürün silinirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
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
          <Card className="card-modern">
            <CardContent className="py-16 text-center">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-6">Henüz ürün eklenmemiş.</p>
              <Button asChild className="bg-slate-900 hover:bg-slate-800">
                <Link href="/admin/products/new">
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Ürünü Ekle
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="card-modern overflow-hidden">
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
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-2xl font-black text-gray-900">
                      {product.price.toFixed(2)} ₺
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" asChild className="premium-btn-secondary p-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        className="premium-btn-secondary p-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
