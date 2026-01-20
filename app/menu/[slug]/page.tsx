"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart, Search, Filter, X, Menu } from "lucide-react";
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
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customerName: "",
    customerPhone: "",
    tableNumber: "",
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const openOrderDialog = () => {
    if (cart.length === 0) {
      toast.error("Sepetiniz boş!");
      return;
    }
    setShowOrderDialog(true);
  };

  const closeOrderDialog = () => {
    setShowOrderDialog(false);
    setOrderForm({
      customerName: "",
      customerPhone: "",
      tableNumber: "",
    });
  };

  const handleOrder = async () => {
    if (cart.length === 0) return;

    // Form validasyonu
    if (!orderForm.customerName.trim()) {
      toast.error("Lütfen isminizi girin!");
      return;
    }

    if (!orderForm.customerPhone.trim()) {
      toast.error("Lütfen telefon numaranızı girin!");
      return;
    }

    // Telefon numarası validasyonu (basit)
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phoneRegex.test(orderForm.customerPhone.trim())) {
      toast.error("Lütfen geçerli bir telefon numarası girin!");
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: restaurant?.id,
          tableNumber: orderForm.tableNumber.trim() || null,
          customerName: orderForm.customerName.trim(),
          customerPhone: orderForm.customerPhone.trim(),
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
        toast.success(`Siparişiniz alındı! Sipariş numaranız: ${orderNumber}`);
        setCart([]);
        setCouponCode("");
        setDiscount(0);
        closeOrderDialog();
        setTimeout(() => {
          window.location.href = `/order/${orderNumber}`;
        }, 1500);
      } else {
        const data = await res.json();
        toast.error(data.error || "Sipariş verilirken bir hata oluştu!");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Bir hata oluştu! Lütfen tekrar deneyin.");
    } finally {
      setIsSubmittingOrder(false);
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
      <div className="min-h-screen flex items-center justify-center bg-soft-gradient">
        <div className="text-center glass-soft rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-slate-300 border-t-slate-600 mx-auto"></div>
          <p className="mt-4 text-slate-700 font-medium text-lg">Menü yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-gradient relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Large Floating Circles - More Visible */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-slate-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float-slow"></div>
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-slate-400/35 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float-fast" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-slate-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-drift" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-slate-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-subtle-float" style={{ animationDelay: '6s' }}></div>
        
        {/* Medium Floating Shapes */}
        <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-slate-400/30 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-float-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-slate-200/35 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-float-fast" style={{ animationDelay: '3s' }}></div>
        
        {/* Small Floating Particles */}
        <div className="absolute top-1/3 left-1/4 w-[200px] h-[200px] bg-slate-300/40 rounded-full mix-blend-multiply filter blur-xl opacity-45 animate-pulse-soft" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-2/3 right-1/4 w-[180px] h-[180px] bg-slate-400/35 rounded-full mix-blend-multiply filter blur-xl opacity-45 animate-pulse-soft" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute bottom-1/3 left-2/3 w-[220px] h-[220px] bg-slate-200/40 rounded-full mix-blend-multiply filter blur-xl opacity-45 animate-pulse-soft" style={{ animationDelay: '4.5s' }}></div>
        
        {/* Subtle Geometric Shapes */}
        <div className="absolute top-1/5 right-1/5 w-[150px] h-[150px] bg-slate-300/30 rounded-3xl mix-blend-multiply filter blur-lg opacity-40 rotate-45 animate-subtle-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-1/5 left-1/5 w-[120px] h-[120px] bg-slate-400/30 rounded-3xl mix-blend-multiply filter blur-lg opacity-40 -rotate-45 animate-float-fast" style={{ animationDelay: '3.5s' }}></div>
        <div className="absolute top-3/4 left-1/2 w-[100px] h-[100px] bg-slate-200/35 rounded-2xl mix-blend-multiply filter blur-lg opacity-40 rotate-12 animate-drift" style={{ animationDelay: '5s' }}></div>
      </div>
      {/* Hamburger Menu Button - Fixed Top Left - Mobile Only */}
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-[60] md:hidden p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          aria-label="Menüyü aç"
        >
          <Menu className="w-6 h-6 text-slate-700" />
        </button>
      )}

      {/* Header */}
      <header className="glass-soft border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
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

      {/* Mobile Category Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button - Slightly Inside, Protruding with Rotate Animation */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className={`absolute -right-6 top-1/2 -translate-y-1/2 z-[55] p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 border-2 border-slate-200 ${
            isMobileMenuOpen ? 'animate-rotate-in' : 'animate-rotate-out opacity-0 pointer-events-none'
          }`}
          aria-label="Menüyü kapat"
        >
          <X className="w-6 h-6 text-slate-700" />
        </button>

        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Filtreler</h2>
          </div>

          {/* Filters Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Kategoriler */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Kategoriler</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    selectedCategory === null
                      ? "bg-slate-900 text-white font-semibold"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Tüm Kategoriler
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      selectedCategory === category.id
                        ? "bg-slate-900 text-white font-semibold"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                      <div className="text-xs mt-1 opacity-75">
                        {category.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Fiyat Filtresi */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Fiyat Aralığı</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setPriceFilter("all");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    priceFilter === "all"
                      ? "bg-slate-900 text-white font-semibold"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => {
                    setPriceFilter("low");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    priceFilter === "low"
                      ? "bg-slate-900 text-white font-semibold"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  0 - 50 ₺
                </button>
                <button
                  onClick={() => {
                    setPriceFilter("medium");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    priceFilter === "medium"
                      ? "bg-slate-900 text-white font-semibold"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  50 - 150 ₺
                </button>
                <button
                  onClick={() => {
                    setPriceFilter("high");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    priceFilter === "high"
                      ? "bg-slate-900 text-white font-semibold"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  150+ ₺
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay - Mobile Only */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Arama ve Filtreler */}
            <div className="glass-soft p-6 rounded-2xl space-y-4 shadow-lg animate-fade-in-up">
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 z-10 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`h-12 input-soft text-base ${searchQuery ? 'pr-11' : 'pr-4'}`}
                  style={{ paddingLeft: '2.75rem' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 hover:scale-110 transition-transform p-1"
                    aria-label="Aramayı temizle"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                )}
              </div>

              {/* Filtreler - Desktop Only */}
              <div className="hidden md:flex flex-wrap gap-4">
                {/* Kategori Filtresi */}
                <div className="flex items-center gap-3">
                  <Filter className="w-5 h-5 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Kategori:</span>
                  <select
                    value={selectedCategory || ""}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="text-sm input-soft px-4 py-2 font-medium"
                  >
                    <option value="">Tümü</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Fiyat Filtresi */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">Fiyat:</span>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value as any)}
                    className="text-sm input-soft px-4 py-2 font-medium"
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
              <Card className="glass-soft">
                <CardContent className="py-12 text-center">
                  <p className="text-slate-700 font-medium text-lg">Aradığınız kriterlere uygun ürün bulunamadı.</p>
                </CardContent>
              </Card>
            ) : (
              filteredCategories.map((category, catIndex) => (
                <div key={category.id} className="space-y-6 animate-fade-in-up" style={{ animationDelay: `${catIndex * 0.1}s` }}>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-clip-text text-transparent mb-2">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-slate-600 font-medium">{category.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {category.products.map((product, prodIndex) => (
                      <Card key={product.id} className="card-soft overflow-hidden animate-fade-in-up" style={{ animationDelay: `${(catIndex * 0.1) + (prodIndex * 0.05)}s` }}>
                        {product.image && (
                          <div className="relative w-full h-56 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden group">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
                                  product.stock > 10 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-500'
                                }`}>
                                  Stok: {product.stock} adet
                                </p>
                              )}
                            </div>
                            <span className="text-2xl font-bold text-slate-800">
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
                            className="w-full btn-soft-primary"
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
            <Card className="sticky top-24 glass-soft shadow-xl animate-fade-in-up animate-delay-4">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-800">
                  <div className="p-2 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  Sepetim
                </h3>

                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-10 h-10 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-medium">Sepetiniz boş</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-2">
                      {cart.map((item, index) => (
                        <div
                          key={item.product.id}
                          className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all animate-fade-in-up border border-slate-200/60"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex-1">
                            <p className="font-bold text-sm text-slate-900">
                              {item.product.name}
                            </p>
                            <p className="text-xs font-semibold text-slate-600 mt-1">
                              {item.product.price.toFixed(2)} ₺
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border border-slate-300 hover:bg-slate-100 hover:border-slate-400 transition-all"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1
                                )
                              }
                            >
                              <span className="text-slate-700 font-bold">-</span>
                            </Button>
                            <span className="w-10 text-center text-sm font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border border-slate-300 hover:bg-slate-100 hover:border-slate-400 transition-all"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1
                                )
                              }
                              disabled={item.product.stock !== null && item.quantity >= item.product.stock}
                            >
                              <span className="text-slate-700 font-bold">+</span>
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
                            className="h-10 text-sm input-soft"
                          />
                          <Button
                            type="button"
                            onClick={applyCoupon}
                            size="sm"
                            className="h-10 btn-soft-primary px-4"
                          >
                            Uygula
                          </Button>
                        </div>
                        {discount > 0 && (
                          <p className="text-sm font-medium text-emerald-600">İndirim: {discount.toFixed(2)} ₺</p>
                        )}
                      </div>

                      {/* Fiyat Özeti */}
                      <div className="space-y-3 text-sm bg-slate-50 rounded-xl p-4 border border-slate-200/60">
                        <div className="flex justify-between">
                          <span className="text-slate-600 font-medium">Ara Toplam:</span>
                          <span className="text-slate-900 font-bold">{subtotal.toFixed(2)} ₺</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-emerald-600">
                            <span className="font-medium">İndirim:</span>
                            <span className="font-bold">-{discount.toFixed(2)} ₺</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                          <span className="text-xl font-bold text-slate-900">Toplam:</span>
                          <span className="text-2xl font-extrabold text-slate-900">
                            {total.toFixed(2)} ₺
                          </span>
                        </div>
                      </div>
                      <Button 
                        className="w-full btn-soft-success text-lg py-6 font-bold shadow-lg" 
                        size="lg"
                        onClick={openOrderDialog}
                        disabled={cart.length === 0}
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

      {/* Sipariş Formu Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={(open) => {
        if (!open) {
          closeOrderDialog();
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Sipariş Bilgileri
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Lütfen siparişinizi tamamlamak için bilgilerinizi girin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Sipariş Özeti */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Sipariş Özeti</h3>
              <div className="space-y-1 text-sm">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span className="text-slate-600">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-medium text-slate-900">
                      {(item.product.price * item.quantity).toFixed(2)} ₺
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="font-semibold text-slate-900">Toplam:</span>
                <span className="text-lg font-bold text-slate-900">
                  {total.toFixed(2)} ₺
                </span>
              </div>
            </div>

            {/* Form Alanları */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-sm font-medium text-slate-700">
                  İsim <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="Adınız ve soyadınız"
                  value={orderForm.customerName}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, customerName: e.target.value })
                  }
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="text-sm font-medium text-slate-700">
                  Telefon <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  value={orderForm.customerPhone}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, customerPhone: e.target.value })
                  }
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tableNumber" className="text-sm font-medium text-slate-700">
                  Masa Numarası <span className="text-slate-400 text-xs">(Opsiyonel)</span>
                </Label>
                <Input
                  id="tableNumber"
                  type="text"
                  placeholder="Örn: 5, A12"
                  value={orderForm.tableNumber}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, tableNumber: e.target.value })
                  }
                  className="h-11"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeOrderDialog}
              disabled={isSubmittingOrder}
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              type="button"
              onClick={handleOrder}
              disabled={isSubmittingOrder}
              className="flex-1 bg-slate-900 hover:bg-slate-800"
            >
              {isSubmittingOrder ? "Gönderiliyor..." : "Siparişi Onayla"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
