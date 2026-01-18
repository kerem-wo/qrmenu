"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, Filter, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isAvailable: boolean;
  stock: number | null;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  products: Product[];
}

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
}

export default function MenuPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (slug) {
      fetchMenu();
    }
  }, [slug]);

  const fetchMenu = async () => {
    if (!slug) return;
    
    try {
      const res = await fetch(`/api/menu/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setRestaurant(data.restaurant);
        setCategories(data.categories);
      } else {
        console.error("Menü yüklenemedi");
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    if (!product.isAvailable) return;
    if (product.stock !== null && product.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQuantity = existing.quantity + 1;
        if (product.stock !== null && newQuantity > product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = cart.find(item => item.product.id === productId)?.product;
    if (product && product.stock !== null && quantity > product.stock) return;
    
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const total = Math.max(0, subtotal - discount);

  const handleOrder = async () => {
    if (cart.length === 0) return;

    const customerName = prompt("İsminiz:");
    const customerPhone = prompt("Telefon numaranız:");
    const tableNumber = prompt("Masa numaranız (opsiyonel):");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: restaurant?.id,
          tableNumber: tableNumber || null,
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          couponCode: couponCode || null,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const orderNumber = data.orderNumber;
        alert(`Siparişiniz alındı! Sipariş numaranız: ${orderNumber}\nSiparişinizi takip etmek için: /order/${orderNumber}`);
        setCart([]);
        window.location.href = `/order/${orderNumber}`;
      } else {
        const data = await res.json();
        alert(data.error || "Sipariş verilirken bir hata oluştu!");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Bir hata oluştu! Lütfen tekrar deneyin.");
    }
  };

  // Filtreleme ve arama
  const filteredCategories = categories.map(category => ({
    ...category,
    products: category.products.filter(product => {
      // Stok kontrolü
      if (!product.isAvailable) return false;
      if (product.stock !== null && product.stock <= 0) return false;

      // Arama filtresi
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !product.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Kategori filtresi
      if (selectedCategory && category.id !== selectedCategory) {
        return false;
      }

      // Fiyat filtresi
      if (priceFilter === "low" && product.price > 50) return false;
      if (priceFilter === "medium" && (product.price <= 50 || product.price > 150)) return false;
      if (priceFilter === "high" && product.price <= 150) return false;

      return true;
    })
  })).filter(category => category.products.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Menü yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          {restaurant && (
            <div className="text-center">
              {restaurant.logo && (
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <Image
                    src={restaurant.logo}
                    alt={restaurant.name}
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              )}
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {restaurant.name}
              </h1>
              {restaurant.description && (
                <p className="text-slate-600">{restaurant.description}</p>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Arama ve Filtreler */}
            <div className="card-modern p-4 space-y-4">
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-slate-300"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>

              {/* Filtreler */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Kategori:</span>
                  <select
                    value={selectedCategory || ""}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="text-sm border border-slate-300 rounded px-2 py-1"
                  >
                    <option value="">Tümü</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">Fiyat:</span>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value as any)}
                    className="text-sm border border-slate-300 rounded px-2 py-1"
                  >
                    <option value="all">Tümü</option>
                    <option value="low">0-50 ₺</option>
                    <option value="medium">50-150 ₺</option>
                    <option value="high">150+ ₺</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Menü İçeriği */}
            {filteredCategories.length === 0 ? (
              <Card className="card-modern">
                <CardContent className="py-12 text-center">
                  <p className="text-slate-600">Aradığınız kriterlere uygun ürün bulunamadı.</p>
                </CardContent>
              </Card>
            ) : (
              filteredCategories.map((category) => (
                <div key={category.id} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-slate-600">{category.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.products.map((product) => (
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
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-slate-900">
                                {product.name}
                              </h3>
                              {product.stock !== null && (
                                <p className="text-xs text-slate-500 mt-1">
                                  Stok: {product.stock} adet
                                </p>
                              )}
                            </div>
                            <span className="text-lg font-bold text-slate-900">
                              {product.price.toFixed(2)} ₺
                            </span>
                          </div>
                          {product.description && (
                            <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                          <Button
                            onClick={() => addToCart(product)}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                            size="sm"
                            disabled={product.stock !== null && product.stock <= 0}
                          >
                            {product.stock !== null && product.stock <= 0 
                              ? "Stokta Yok" 
                              : "Sepete Ekle"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 card-modern">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                  <ShoppingCart className="w-5 h-5" />
                  Sepetim
                </h3>

                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Sepetiniz boş</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                      {cart.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm text-slate-900">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-slate-600 mt-1">
                              {item.product.price.toFixed(2)} ₺
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1
                                )
                              }
                            >
                              -
                            </Button>
                            <span className="w-8 text-center text-sm font-medium text-slate-900">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1
                                )
                              }
                              disabled={item.product.stock !== null && item.quantity >= item.product.stock}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-200 pt-4 space-y-4">
                      {/* Kupon Kodu */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Kupon Kodu</label>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Kupon kodu girin"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="h-9 text-sm"
                          />
                          <Button
                            type="button"
                            onClick={applyCoupon}
                            size="sm"
                            variant="outline"
                            className="h-9"
                          >
                            Uygula
                          </Button>
                        </div>
                        {discount > 0 && (
                          <p className="text-xs text-green-600">İndirim: {discount.toFixed(2)} ₺</p>
                        )}
                      </div>

                      {/* Fiyat Özeti */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Ara Toplam:</span>
                          <span className="text-slate-900">{subtotal.toFixed(2)} ₺</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>İndirim:</span>
                            <span>-{discount.toFixed(2)} ₺</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                          <span className="text-lg font-semibold text-slate-900">Toplam:</span>
                          <span className="text-xl font-bold text-slate-900">
                            {total.toFixed(2)} ₺
                          </span>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white" 
                        size="lg"
                        onClick={() => handleOrder()}
                      >
                        Sipariş Ver
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
