"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Mail, Lock, User, FileText, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { DocumentUpload } from "@/components/DocumentUpload";

export default function RestaurantRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    restaurantName: "",
    email: "",
    password: "",
    confirmPassword: "",
    kvkkConsent: false,
    privacyConsent: false,
    marketingSmsConsent: false,
  });
  
  const [documents, setDocuments] = useState({
    taxDocument: null as File | null,
    businessLicense: null as File | null,
    tradeRegistry: null as File | null,
    identityDocument: null as File | null,
  });
  
  const [uploadingDocs, setUploadingDocs] = useState({
    taxDocument: false,
    businessLicense: false,
    tradeRegistry: false,
    identityDocument: false,
  });
  
  const [uploadedDocs, setUploadedDocs] = useState({
    taxDocument: "",
    businessLicense: "",
    tradeRegistry: "",
    identityDocument: "",
  });

  const handleDocumentUpload = async (file: File, docType: keyof typeof documents) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Sadece JPG, PNG veya PDF dosyaları yüklenebilir");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır");
      return;
    }

    setUploadingDocs((prev) => ({ ...prev, [docType]: true }));
    setDocuments((prev) => ({ ...prev, [docType]: file }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUploadedDocs((prev) => ({ ...prev, [docType]: data.url }));
        toast.success(`${docType === 'taxDocument' ? 'Vergi Levhası' : docType === 'businessLicense' ? 'İşletme Ruhsatı' : docType === 'tradeRegistry' ? 'Ticaret Sicil Belgesi' : 'Kimlik Belgesi'} yüklendi`);
      } else {
        const error = await res.json();
        toast.error(error.error || "Dosya yüklenirken bir hata oluştu");
        setDocuments((prev) => ({ ...prev, [docType]: null }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Dosya yüklenirken bir hata oluştu");
      setDocuments((prev) => ({ ...prev, [docType]: null }));
    } finally {
      setUploadingDocs((prev) => ({ ...prev, [docType]: false }));
    }
  };

  const handleDocumentRemove = (docType: keyof typeof documents) => {
    setDocuments((prev) => ({ ...prev, [docType]: null }));
    setUploadedDocs((prev) => ({ ...prev, [docType]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.restaurantName.trim()) {
      toast.error("Restoran adı gereklidir");
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      toast.error("E-posta adresi gereklidir");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Şifreler eşleşmiyor");
      setLoading(false);
      return;
    }

    // KVKK onayları kontrolü
    if (!formData.kvkkConsent) {
      toast.error("KVKK Aydınlatma Metni'ni onaylamanız zorunludur");
      setLoading(false);
      return;
    }

    if (!formData.privacyConsent) {
      toast.error("Gizlilik Politikası'nı onaylamanız zorunludur");
      setLoading(false);
      return;
    }

    if (!formData.marketingSmsConsent) {
      toast.error("SMS ile ticari pazarlama bildirimi onayını vermeniz zorunludur");
      setLoading(false);
      return;
    }

    // Zorunlu belgeler kontrolü
    if (!uploadedDocs.taxDocument) {
      toast.error("Vergi Levhası yüklenmesi zorunludur");
      setLoading(false);
      return;
    }

    if (!uploadedDocs.businessLicense) {
      toast.error("İşletme Ruhsatı yüklenmesi zorunludur");
      setLoading(false);
      return;
    }

    if (!uploadedDocs.identityDocument) {
      toast.error("Yetkili Kişi Kimlik Belgesi yüklenmesi zorunludur");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/restaurant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName: formData.restaurantName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          kvkkConsent: formData.kvkkConsent,
          privacyConsent: formData.privacyConsent,
          marketingSmsConsent: formData.marketingSmsConsent,
          taxDocument: uploadedDocs.taxDocument,
          businessLicense: uploadedDocs.businessLicense,
          tradeRegistry: uploadedDocs.tradeRegistry,
          identityDocument: uploadedDocs.identityDocument,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Restoran kaydı başarıyla oluşturuldu! Hesabınız incelendikten sonra aktif olacaktır.");
        
        // Platform admin onayı bekleniyor, otomatik login yapma
        // Kullanıcıyı login sayfasına yönlendir
        setTimeout(() => {
          router.push("/admin/login");
        }, 3000);
      } else {
        toast.error(data.error || "Kayıt sırasında bir hata oluştu");
      }
    } catch (error) {
      console.error("Register error:", error);
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen premium-bg-gradient flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl animate-premium-scale-in">
        <div className="premium-card p-10">
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-600 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
                <Building2 className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="premium-heading-2 mb-3">Restoran Kaydı</h1>
            <p className="text-gray-600 font-medium text-lg">
              Restoranınızı kaydedin ve dijital menünüzü oluşturun
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Restoran Adı */}
              <div className="space-y-2">
                <Label htmlFor="restaurantName" className="text-gray-700 font-bold">
                  Restoran Adı *
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="restaurantName"
                    type="text"
                    placeholder="Örn: Lezzet Durağı"
                    value={formData.restaurantName}
                    onChange={(e) =>
                      setFormData({ ...formData, restaurantName: e.target.value })
                    }
                    className="premium-input premium-input-with-icon"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-bold">
                  E-posta Adresi *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@restoran.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="premium-input premium-input-with-icon"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Bu e-posta admin paneli girişi için kullanılacak
                </p>
              </div>

              {/* Şifre */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-bold">
                  Şifre *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="En az 6 karakter"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="premium-input premium-input-with-icon"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Şifre Tekrar */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-bold">
                  Şifre Tekrar *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Şifrenizi tekrar girin"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className="premium-input premium-input-with-icon"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Resmi Belgeler */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Resmi Belgeler *</h3>
                <p className="text-xs text-gray-600 font-medium">
                  Lütfen aşağıdaki belgeleri yükleyiniz. Belgeler JPG, PNG veya PDF formatında olmalıdır (Max: 10MB).
                </p>

                {/* Vergi Levhası */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-bold">
                    Vergi Levhası *
                  </Label>
                  <DocumentUpload
                    label="Vergi Levhası"
                    file={documents.taxDocument}
                    uploading={uploadingDocs.taxDocument}
                    uploadedUrl={uploadedDocs.taxDocument}
                    onFileSelect={(file) => handleDocumentUpload(file, 'taxDocument')}
                    onRemove={() => handleDocumentRemove('taxDocument')}
                  />
                </div>

                {/* İşletme Ruhsatı */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-bold">
                    İşletme Ruhsatı *
                  </Label>
                  <DocumentUpload
                    label="İşletme Ruhsatı"
                    file={documents.businessLicense}
                    uploading={uploadingDocs.businessLicense}
                    uploadedUrl={uploadedDocs.businessLicense}
                    onFileSelect={(file) => handleDocumentUpload(file, 'businessLicense')}
                    onRemove={() => handleDocumentRemove('businessLicense')}
                  />
                </div>

                {/* Ticaret Sicil Belgesi */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-bold">
                    Ticaret Sicil Belgesi
                  </Label>
                  <DocumentUpload
                    label="Ticaret Sicil Belgesi (Opsiyonel)"
                    file={documents.tradeRegistry}
                    uploading={uploadingDocs.tradeRegistry}
                    uploadedUrl={uploadedDocs.tradeRegistry}
                    onFileSelect={(file) => handleDocumentUpload(file, 'tradeRegistry')}
                    onRemove={() => handleDocumentRemove('tradeRegistry')}
                    optional
                  />
                </div>

                {/* Kimlik Belgesi */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-bold">
                    Yetkili Kişi Kimlik Belgesi *
                  </Label>
                  <DocumentUpload
                    label="Kimlik Belgesi"
                    file={documents.identityDocument}
                    uploading={uploadingDocs.identityDocument}
                    uploadedUrl={uploadedDocs.identityDocument}
                    onFileSelect={(file) => handleDocumentUpload(file, 'identityDocument')}
                    onRemove={() => handleDocumentRemove('identityDocument')}
                  />
                </div>
              </div>

              {/* KVKK ve Onaylar */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Yasal Onaylar *</h3>
                
                {/* KVKK Onayı */}
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <Checkbox
                    id="kvkkConsent"
                    checked={formData.kvkkConsent}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, kvkkConsent: checked === true })
                    }
                    className="mt-1"
                    required
                  />
                  <Label htmlFor="kvkkConsent" className="text-sm text-gray-700 cursor-pointer flex-1 font-medium">
                    <Link href="/kvkk" target="_blank" className="text-gray-900 font-bold hover:text-green-600 transition-colors">
                      KVKK Aydınlatma Metni
                    </Link>
                    {' '}ni okudum, anladım ve kabul ediyorum. *
                  </Label>
                </div>

                {/* Gizlilik Politikası */}
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <Checkbox
                    id="privacyConsent"
                    checked={formData.privacyConsent}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, privacyConsent: checked === true })
                    }
                    className="mt-1"
                    required
                  />
                  <Label htmlFor="privacyConsent" className="text-sm text-slate-700 cursor-pointer flex-1">
                    <Link href="/gizlilik-politikasi" target="_blank" className="text-slate-900 font-semibold hover:underline">
                      Gizlilik Politikası
                    </Link>
                    {' '}nı okudum, anladım ve kabul ediyorum. *
                  </Label>
                </div>

                {/* SMS Pazarlama */}
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <Checkbox
                    id="marketingSmsConsent"
                    checked={formData.marketingSmsConsent}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, marketingSmsConsent: checked === true })
                    }
                    className="mt-1"
                    required
                  />
                  <Label htmlFor="marketingSmsConsent" className="text-sm text-slate-700 cursor-pointer flex-1">
                    SMS ile ticari pazarlama bildirimlerinin gönderilmesine onay veriyorum. *
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="premium-btn-primary w-full"
                disabled={loading}
              >
                {loading ? "Kaydediliyor..." : "Restoran Kaydet"}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-4 border-t border-slate-200">
                <p className="text-sm text-gray-600 font-medium">
                  Zaten hesabınız var mı?{" "}
                  <Link
                    href="/admin/login"
                    className="text-slate-900 font-medium hover:underline"
                  >
                    Giriş Yap
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
