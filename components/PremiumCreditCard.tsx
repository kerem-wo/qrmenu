"use client";

import { useState, useEffect, useRef } from "react";
import { CreditCard } from "lucide-react";

interface CardType {
  name: string;
  pattern: RegExp;
  logo: string;
  gradient: string;
  cvvLength: number;
}

const CARD_TYPES: CardType[] = [
  {
    name: "visa",
    pattern: /^4/,
    logo: "VISA",
    gradient: "linear-gradient(135deg, #1a1f71 0%, #192f6d 100%)",
    cvvLength: 3,
  },
  {
    name: "mastercard",
    pattern: /^5[1-5]/,
    logo: "MC",
    gradient: "linear-gradient(135deg, #eb001b 0%, #f79e1b 100%)",
    cvvLength: 3,
  },
  {
    name: "amex",
    pattern: /^3[47]/,
    logo: "AMEX",
    gradient: "linear-gradient(135deg, #006fcf 0%, #012169 100%)",
    cvvLength: 4,
  },
];

const detectCardType = (number: string): CardType | null => {
  const cleaned = number.replace(/\s/g, "");
  for (const cardType of CARD_TYPES) {
    if (cardType.pattern.test(cleaned)) {
      return cardType;
    }
  }
  return null;
};

const luhnCheck = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, "");
  if (cleaned.length < 13) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, "");
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(" ").slice(0, 19);
};

const formatExpiry = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
  }
  return cleaned;
};

interface PremiumCreditCardProps {
  onSubmit?: (data: {
    cardNumber: string;
    cardName: string;
    expiry: string;
    cvv: string;
  }) => void;
  onCancel?: () => void;
  amount?: number;
}

export default function PremiumCreditCard({
  onSubmit,
  onCancel,
  amount = 0,
}: PremiumCreditCardProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cardType = detectCardType(cardNumber);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusedField === "cvv") {
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
    }
  }, [focusedField]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 13) {
      newErrors.cardNumber = "Geçerli bir kart numarası girin";
    } else if (!luhnCheck(cardNumber)) {
      newErrors.cardNumber = "Geçersiz kart numarası";
    }

    if (!cardName || cardName.trim().length < 3) {
      newErrors.cardName = "Kart sahibi adı gerekli";
    }

    if (!expiry || expiry.length < 5) {
      newErrors.expiry = "Son kullanma tarihi gerekli";
    } else {
      const [month, year] = expiry.split("/");
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;

      if (
        parseInt(month) < 1 ||
        parseInt(month) > 12 ||
        parseInt(year) < currentYear ||
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)
      ) {
        newErrors.expiry = "Geçersiz tarih";
      }
    }

    const cvvLength = cardType?.cvvLength || 3;
    if (!cvv || cvv.length !== cvvLength) {
      newErrors.cvv = `CVV ${cvvLength} haneli olmalıdır`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && onSubmit) {
      onSubmit({
        cardNumber: cardNumber.replace(/\s/g, ""),
        cardName: cardName.trim(),
        expiry,
        cvv,
      });
    }
  };

  const displayCardNumber = cardNumber || "0000 0000 0000 0000";
  const displayName = cardName.toUpperCase() || "KART SAHİBİ ADI";
  const displayExpiry = expiry || "MM/YY";
  const displayCvv = cvv || "000";

  return (
    <div className="w-full max-w-md mx-auto p-6">
      {/* 3D Credit Card */}
      <div className="relative mb-8" style={{ perspective: "1000px" }}>
        <div
          ref={cardRef}
          className="relative w-full h-56 rounded-2xl shadow-2xl transition-transform duration-700"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            background: cardType
              ? cardType.gradient
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          {/* Front of Card */}
          <div
            className="absolute inset-0 rounded-2xl p-6 text-white flex flex-col justify-between"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            {/* Card Logo */}
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <CreditCard className="w-6 h-6" />
              </div>
              {cardType && (
                <div className="text-xs font-bold bg-white/20 px-3 py-1 rounded backdrop-blur-sm">
                  {cardType.logo}
                </div>
              )}
            </div>

            {/* Card Number */}
            <div className="mt-auto">
              <div className="text-2xl font-mono tracking-wider mb-4">
                {displayCardNumber.split("").map((char, index) => (
                  <span
                    key={index}
                    className={`transition-all duration-300 ${
                      char === "0" && !cardNumber
                        ? "opacity-30"
                        : "opacity-100"
                    }`}
                  >
                    {char}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs opacity-70 mb-1">KART SAHİBİ</div>
                  <div className="text-sm font-semibold tracking-wide">
                    {displayName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-70 mb-1">SON KULLANMA</div>
                  <div className="text-sm font-semibold">{displayExpiry}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Back of Card */}
          <div
            className="absolute inset-0 rounded-2xl p-6 text-white flex flex-col justify-between"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: cardType
                ? cardType.gradient
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <div className="w-full h-12 bg-black/30 mt-4"></div>
            <div className="flex justify-end">
              <div className="bg-white rounded px-4 py-2">
                <div className="text-xs text-gray-800 mb-1">CVV</div>
                <div className="text-lg font-mono font-bold text-gray-900">
                  {displayCvv}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Kart Numarası
          </label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => {
              const formatted = formatCardNumber(e.target.value);
              setCardNumber(formatted);
            }}
            onFocus={() => setFocusedField("cardNumber")}
            onBlur={() => setFocusedField(null)}
            placeholder="0000 0000 0000 0000"
            maxLength={19}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
              errors.cardNumber
                ? "border-red-500 focus:border-red-600"
                : focusedField === "cardNumber"
                ? "border-[#FF6F00] focus:border-[#FF8F33] shadow-lg shadow-[#FF6F00]/20"
                : "border-gray-300 focus:border-[#FF6F00]"
            } focus:outline-none focus:ring-4 focus:ring-[#FF6F00]/10`}
          />
          {errors.cardNumber && (
            <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p>
          )}
        </div>

        {/* Card Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Kart Sahibi Adı
          </label>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            onFocus={() => setFocusedField("cardName")}
            onBlur={() => setFocusedField(null)}
            placeholder="AD SOYAD"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
              errors.cardName
                ? "border-red-500 focus:border-red-600"
                : focusedField === "cardName"
                ? "border-[#FF6F00] focus:border-[#FF8F33] shadow-lg shadow-[#FF6F00]/20"
                : "border-gray-300 focus:border-[#FF6F00]"
            } focus:outline-none focus:ring-4 focus:ring-[#FF6F00]/10 uppercase`}
          />
          {errors.cardName && (
            <p className="mt-1 text-xs text-red-600">{errors.cardName}</p>
          )}
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Son Kullanma
            </label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => {
                const formatted = formatExpiry(e.target.value);
                setExpiry(formatted);
              }}
              onFocus={() => setFocusedField("expiry")}
              onBlur={() => setFocusedField(null)}
              placeholder="MM/YY"
              maxLength={5}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                errors.expiry
                  ? "border-red-500 focus:border-red-600"
                  : focusedField === "expiry"
                  ? "border-[#FF6F00] focus:border-[#FF8F33] shadow-lg shadow-[#FF6F00]/20"
                  : "border-gray-300 focus:border-[#FF6F00]"
              } focus:outline-none focus:ring-4 focus:ring-[#FF6F00]/10`}
            />
            {errors.expiry && (
              <p className="mt-1 text-xs text-red-600">{errors.expiry}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              CVV
            </label>
            <input
              type="text"
              value={cvv}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, "");
                const maxLength = cardType?.cvvLength || 3;
                setCvv(cleaned.slice(0, maxLength));
              }}
              onFocus={() => setFocusedField("cvv")}
              onBlur={() => setFocusedField(null)}
              placeholder="000"
              maxLength={cardType?.cvvLength || 3}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                errors.cvv
                  ? "border-red-500 focus:border-red-600"
                  : focusedField === "cvv"
                  ? "border-[#FF6F00] focus:border-[#FF8F33] shadow-lg shadow-[#FF6F00]/20"
                  : "border-gray-300 focus:border-[#FF6F00]"
              } focus:outline-none focus:ring-4 focus:ring-[#FF6F00]/10`}
            />
            {errors.cvv && (
              <p className="mt-1 text-xs text-red-600">{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* Amount Display */}
        {amount > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">
                Toplam Tutar:
              </span>
              <span className="text-xl font-black text-gray-900">
                {amount.toFixed(2)} ₺
              </span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
            >
              İptal
            </button>
          )}
          <button
            type="submit"
            className="flex-1 bg-[#FF6F00] hover:bg-[#FF8F33] text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-[#FF6F00]/20 hover:shadow-xl hover:shadow-[#FF6F00]/30 transform hover:-translate-y-0.5"
          >
            Ödemeyi Tamamla
          </button>
        </div>
      </form>
    </div>
  );
}
