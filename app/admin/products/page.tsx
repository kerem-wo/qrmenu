"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
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

  useEffect(() => {
    checkAuth().then((session) => {
      if (!session) {
        router.push("/admin/login");
        return;
      }
      fetchProducts();
    });
  }, []);

  const fetchProducts = async () => {
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
  };

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
            <h1 className="text-2xl font-bold text-slate-900">Ürün Yönetimi</h1>
          </div>
          <Button asChild className="bg-slate-900 hover:bg-slate-800">
            <Link href="/admin/products/new">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Ürün Ekle
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
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
                  <div className="relative w-full h-48 bg-slate-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900">{product.name}</CardTitle>
                      <CardDescription className="text-sm">{product.category.name}</CardDescription>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      product.isAvailable 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {product.isAvailable ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                    {product.description || "Açıklama yok"}
                  </p>
                  {product.stock !== null && (
                    <p className={`text-xs mb-4 ${
                      product.stock === 0 
                        ? "text-red-600 font-semibold" 
                        : product.stock < 10 
                        ? "text-orange-600" 
                        : "text-slate-600"
                    }`}>
                      Stok: {product.stock} adet
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-slate-900">
                      {product.price.toFixed(2)} ₺
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" asChild className="border-slate-300">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        className="border-slate-300 hover:bg-red-50 hover:border-red-300"
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
