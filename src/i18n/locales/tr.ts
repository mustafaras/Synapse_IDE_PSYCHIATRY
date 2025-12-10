const tr = {
  help: {
    open: "Yardımı Aç",
    title: "Konsültasyon — Yardım",
    clinicianPoint1: "Belgelendirmeyi destekler; talimat değildir. Klinik yargınızı uygulayın.",
    clinicianPoint2: "PHI paylaşırken Redaksiyonu tercih edin; kopyalamadan önce doğrulayın.",
    clinicianPoint3: "Yerel kılavuzları izleyin; model yanıtları eksik olabilir.",
    canaryNote: "Not: Bu özellik, kanarya dağıtımı sırasında kullanıcıların bir kısmıyla sınırlı olabilir.",
    openDeveloper: "Geliştirici Rehberini Aç",
    openPlan: "Plan ve Koruyucu İlkeleri Aç",
    close: "Kapat"
  },
  tabs: {
    notes: "Notlar",
    analytics: "Analitik",
    collaboration: "İşbirliği"
  }
} as const;

export type TrMessages = typeof tr;
export default tr;
