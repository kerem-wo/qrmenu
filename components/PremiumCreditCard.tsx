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
    <div className="w-full max-w-md mx-auto p-4 sm:p-6">
      {/* 3D Credit Card - Enhanced Design */}
      <div className="relative mb-8" style={{ perspective: "2000px" }}>
        <div
          ref={cardRef}
          className="relative w-full h-40 sm:h-64 rounded-2xl sm:rounded-3xl shadow-2xl transition-transform duration-700 ease-in-out"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            background: cardType
              ? cardType.gradient
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow: isFlipped
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
              : "0 20px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
          }}
        >
          {/* Glossy Overlay Effect */}
          <div
            className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)",
              mixBlendMode: "overlay",
            }}
          />

          {/* Front of Card */}
          <div
            className="absolute inset-0 rounded-2xl sm:rounded-3xl p-2 sm:p-6 md:p-8 text-white flex flex-col justify-between overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full blur-3xl -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
            <div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-white/5 rounded-full blur-2xl -ml-10 sm:-ml-12 -mb-10 sm:-mb-12"></div>

            {/* Card Logo & Chip */}
            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Chip */}
                <div className="w-8 h-7 sm:w-12 sm:h-10 bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 rounded-md border border-yellow-300/30 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-6 h-4 sm:w-8 sm:h-6 bg-gradient-to-br from-yellow-200/40 to-yellow-400/40 rounded border border-yellow-300/50"></div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              {cardType && (
                <div className="text-[10px] sm:text-xs font-black bg-white/25 px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg backdrop-blur-md border border-white/30 shadow-lg">
                  {cardType.logo}
                </div>
              )}
            </div>

            {/* Card Number */}
            <div className="mt-auto relative z-10 min-h-0 max-w-full">
              <div className="text-xs sm:text-2xl md:text-3xl font-mono tracking-[0.05em] sm:tracking-[0.15em] md:tracking-[0.2em] mb-2 sm:mb-6 font-light overflow-hidden max-w-full">
                <div className="flex flex-wrap justify-center items-center gap-x-0.5 sm:gap-x-1 leading-tight max-w-full break-words">
                  {displayCardNumber.split(" ").map((group, groupIndex) => (
                    <span key={groupIndex} className="inline-flex items-center max-w-full">
                      {group.split("").map((char, charIndex) => (
                        <span
                          key={`${groupIndex}-${charIndex}`}
                          className={`inline-block transition-all duration-300 whitespace-nowrap ${
                            char === "0" && !cardNumber
                              ? "opacity-20"
                              : "opacity-100"
                          } ${
                            focusedField === "cardNumber" && 
                            groupIndex * 4 + charIndex < cardNumber.replace(/\s/g, "").length
                              ? "scale-110 text-yellow-200"
                              : ""
                          }`}
                          style={{
                            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                          }}
                        >
                          {char}
                        </span>
                      ))}
                      {groupIndex < displayCardNumber.split(" ").length - 1 && (
                        <span className="mx-0.5 sm:mx-1 opacity-100 whitespace-pre"> </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-end gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[8px] sm:text-[10px] opacity-60 mb-1 sm:mb-1.5 tracking-wider uppercase">
                    KART SAHİBİ
                  </div>
                  <div className="text-xs sm:text-sm md:text-base font-semibold tracking-wider truncate max-w-full">
                    {displayName.split("").map((char, index) => (
                      <span
                        key={index}
                        className={`transition-all duration-200 ${
                          char === " " ? "mx-1" : ""
                        } ${
                          focusedField === "cardName" && index < cardName.length
                            ? "text-yellow-200 scale-105"
                            : ""
                        }`}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right ml-2 sm:ml-4 flex-shrink-0">
                  <div className="text-[8px] sm:text-[10px] opacity-60 mb-1 sm:mb-1.5 tracking-wider uppercase">
                    SON KULLANMA
                  </div>
                  <div className="text-xs sm:text-sm md:text-base font-semibold tracking-wider whitespace-nowrap">
                    {displayExpiry.split("").map((char, index) => (
                      <span
                        key={index}
                        className={`transition-all duration-200 ${
                          focusedField === "expiry" && index < expiry.length
                            ? "text-yellow-200 scale-110"
                            : ""
                        }`}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back of Card */}
          <div
            className="absolute inset-0 rounded-2xl sm:rounded-3xl p-2 sm:p-6 md:p-8 text-white flex flex-col justify-between overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: cardType
                ? cardType.gradient
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -ml-12 -mb-12"></div>

            {/* Magnetic Strip */}
            <div className="w-full h-14 bg-black/40 mt-6 rounded relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            </div>

            {/* CVV Section */}
            <div className="flex justify-end items-end relative z-10">
              <div className="bg-white rounded-xl px-5 py-3 shadow-2xl border-2 border-white/20">
                <div className="text-[10px] text-gray-600 mb-1 font-semibold uppercase tracking-wider">
                  CVV
                </div>
                <div className="text-xl font-mono font-black text-gray-900 tracking-wider">
                  {displayCvv.split("").map((char, index) => (
                    <span
                      key={index}
                      className={`transition-all duration-200 ${
                        focusedField === "cvv" && index < cvv.length
                          ? "scale-110 text-gray-700"
                          : ""
                      }`}
                    >
                      {char}
                    </span>
                  ))}
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
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 transition-all duration-300 text-sm sm:text-base ${
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
          <label className="block text-sm font-bold text-gray-800 mb-2.5">
            Kart Sahibi Adı
          </label>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            onFocus={() => setFocusedField("cardName")}
            onBlur={() => setFocusedField(null)}
            placeholder="AD SOYAD"
            className={`w-full px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-xl border-2 transition-all duration-300 text-sm sm:text-base font-medium ${
              errors.cardName
                ? "border-red-500 focus:border-red-600 bg-red-50"
                : focusedField === "cardName"
                ? "border-[#FF6F00] focus:border-[#FF8F33] shadow-xl shadow-[#FF6F00]/25 bg-white"
                : "border-gray-300 focus:border-[#FF6F00] bg-white hover:border-gray-400"
            } focus:outline-none focus:ring-4 focus:ring-[#FF6F00]/15 uppercase`}
          />
          {errors.cardName && (
            <p className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {errors.cardName}
            </p>
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
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 transition-all duration-300 text-sm sm:text-base ${
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
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 transition-all duration-300 text-sm sm:text-base ${
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
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Toplam Tutar:
              </span>
              <span className="text-2xl font-black text-gray-900">
                {amount.toFixed(2)} <span className="text-lg">₺</span>
              </span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-100 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md text-sm sm:text-base whitespace-nowrap min-w-0"
            >
              İptal
            </button>
          )}
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-[#FF6F00] to-[#FF8F33] hover:from-[#FF8F33] hover:to-[#FF6F00] text-white px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl font-black transition-all duration-300 shadow-xl shadow-[#FF6F00]/30 hover:shadow-2xl hover:shadow-[#FF6F00]/40 transform hover:-translate-y-1 active:scale-95 text-sm sm:text-base whitespace-nowrap min-w-0"
          >
            Ödemeyi Tamamla
          </button>
        </div>
      </form>
    </div>
  );
}
