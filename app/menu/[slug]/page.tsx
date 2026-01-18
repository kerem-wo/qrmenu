"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isAvailable: boolean;
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

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
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
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

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
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
        }),
      });

      if (res.ok) {
        alert("Siparişiniz alındı! Teşekkür ederiz.");
        setCart([]);
      } else {
        const data = await res.json();
        alert(data.error || "Sipariş verilirken bir hata oluştu!");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Bir hata oluştu! Lütfen tekrar deneyin.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Menü yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          {restaurant && (
            <div className="text-center">
              {restaurant.logo && (
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <Image
                    src={restaurant.logo}
                    alt={restaurant.name}
                    fill
                    className="object-contain rounded-full"
                  />
                </div>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {restaurant.name}
              </h1>
              {restaurant.description && (
                <p className="text-gray-600">{restaurant.description}</p>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Content */}
          <div className="lg:col-span-2 space-y-8">
            {categories.map((category) => (
              <div key={category.id} className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-gray-600">{category.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.products
                    .filter((p) => p.isAvailable)
                    .map((product) => (
                      <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        {product.image && (
                          <div className="relative w-full h-48 bg-gray-200">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {product.name}
                            </h3>
                            <span className="text-lg font-bold text-primary">
                              {product.price.toFixed(2)} ₺
                            </span>
                          </div>
                          {product.description && (
                            <p className="text-sm text-gray-600 mb-4">
                              {product.description}
                            </p>
                          )}
                          <Button
                            onClick={() => addToCart(product)}
                            className="w-full"
                            size="sm"
                          >
                            Sepete Ekle
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Sepetim
                </h3>

                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Sepetiniz boş
                  </p>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cart.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.product.price.toFixed(2)} ₺
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1
                                )
                              }
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1
                                )
                              }
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold">Toplam:</span>
                        <span className="text-xl font-bold text-primary">
                          {total.toFixed(2)} ₺
                        </span>
                      </div>
                      <Button 
                        className="w-full" 
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
