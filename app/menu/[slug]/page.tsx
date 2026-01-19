"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, Filter, X } from "lucide-react";
import toast from "react-hot-toast";

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

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setDiscount(0);
      return;
    }

    try {
      const res = await fetch(`/api/campaigns/validate?code=${couponCode}&amount=${subtotal}`);
      const data = await res.json();
      
      if (res.ok) {
        setDiscount(data.discount || 0);
        if (data.discount > 0) {
          toast.success(`Kupon uygulandı! İndirim: ${data.discount.toFixed(2)} ₺`);
        } else {
          toast.error("Kupon geçersiz veya kullanılamaz!");
        }
      } else {
        setDiscount(0);
        toast.error(data.error || "Kupon geçersiz!");
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      setDiscount(0);
      toast.error("Kupon doğrulanırken bir hata oluştu!");
    }
  };

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
      <div className="min-h-screen flex items-center justify-center bg-animated-gradient">
        <div className="text-center glass-effect rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto"></div>
          <p className="mt-4 text-white font-semibold text-lg">Menü yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vibrant relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
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

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Arama ve Filtreler */}
            <div className="glass-effect p-6 rounded-2xl space-y-4 shadow-xl animate-fade-in-up">
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-600" />
                <Input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 input-vibrant text-lg bg-white/90"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:scale-110 transition-transform"
                  >
                    <X className="w-5 h-5 text-purple-600" />
                  </button>
                )}
              </div>

              {/* Filtreler */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Filter className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-semibold text-white drop-shadow-md">Kategori:</span>
                  <select
                    value={selectedCategory || ""}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="text-sm input-vibrant px-4 py-2 bg-white/90 font-medium"
                  >
                    <option value="">Tümü</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white drop-shadow-md">Fiyat:</span>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value as any)}
                    className="text-sm input-vibrant px-4 py-2 bg-white/90 font-medium"
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
              <Card className="glass-effect">
                <CardContent className="py-12 text-center">
                  <p className="text-white font-semibold text-lg">Aradığınız kriterlere uygun ürün bulunamadı.</p>
                </CardContent>
              </Card>
            ) : (
              filteredCategories.map((category, catIndex) => (
                <div key={category.id} className="space-y-6 animate-fade-in-up" style={{ animationDelay: `${catIndex * 0.1}s` }}>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 drop-shadow-lg">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-white/90 font-medium drop-shadow-md">{category.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {category.products.map((product, prodIndex) => (
                      <Card key={product.id} className="card-vibrant overflow-hidden animate-fade-in-up" style={{ animationDelay: `${(catIndex * 0.1) + (prodIndex * 0.05)}s` }}>
                        {product.image && (
                          <div className="relative w-full h-56 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden group">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                        )}
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-slate-900 mb-1">
                                {product.name}
                              </h3>
                              {product.stock !== null && (
                                <p className={`text-xs font-medium mt-1 ${
                                  product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'
                                }`}>
                                  Stok: {product.stock} adet
                                </p>
                              )}
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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
                            className="w-full btn-gradient-primary"
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
            <Card className="sticky top-24 glass-effect shadow-2xl animate-fade-in-up animate-delay-4">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white drop-shadow-lg">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  Sepetim
                </h3>

                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-10 h-10 text-white/50" />
                    </div>
                    <p className="text-white/80 font-medium">Sepetiniz boş</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-2">
                      {cart.map((item, index) => (
                        <div
                          key={item.product.id}
                          className="flex items-center justify-between p-4 bg-white/90 rounded-xl shadow-md hover:shadow-lg transition-all animate-fade-in-up"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex-1">
                            <p className="font-bold text-sm text-slate-900">
                              {item.product.name}
                            </p>
                            <p className="text-xs font-semibold text-purple-600 mt-1">
                              {item.product.price.toFixed(2)} ₺
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-2 border-purple-300 hover:bg-purple-100 hover:border-purple-500 transition-all"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1
                                )
                              }
                            >
                              <span className="text-purple-600 font-bold">-</span>
                            </Button>
                            <span className="w-10 text-center text-sm font-bold text-slate-900 bg-purple-50 px-2 py-1 rounded">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-2 border-purple-300 hover:bg-purple-100 hover:border-purple-500 transition-all"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1
                                )
                              }
                              disabled={item.product.stock !== null && item.quantity >= item.product.stock}
                            >
                              <span className="text-purple-600 font-bold">+</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t-2 border-white/20 pt-4 space-y-4">
                      {/* Kupon Kodu */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-white drop-shadow-md">Kupon Kodu</label>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Kupon kodu girin"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="h-10 text-sm input-vibrant bg-white/90"
                          />
                          <Button
                            type="button"
                            onClick={applyCoupon}
                            size="sm"
                            className="h-10 btn-gradient-primary px-4"
                          >
                            Uygula
                          </Button>
                        </div>
                        {discount > 0 && (
                          <p className="text-sm font-bold text-green-400 drop-shadow-md">İndirim: {discount.toFixed(2)} ₺</p>
                        )}
                      </div>

                      {/* Fiyat Özeti */}
                      <div className="space-y-3 text-sm bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex justify-between">
                          <span className="text-white/90 font-medium">Ara Toplam:</span>
                          <span className="text-white font-bold">{subtotal.toFixed(2)} ₺</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-green-300">
                            <span className="font-medium">İndirim:</span>
                            <span className="font-bold">-{discount.toFixed(2)} ₺</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-3 border-t-2 border-white/20">
                          <span className="text-xl font-bold text-white">Toplam:</span>
                          <span className="text-2xl font-extrabold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                            {total.toFixed(2)} ₺
                          </span>
                        </div>
                      </div>
                      <Button 
                        className="w-full btn-gradient-success text-lg py-6 font-bold shadow-xl" 
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
