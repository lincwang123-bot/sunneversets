import { ArrowUpRight } from "lucide-react";
import { contact } from "../data/business";
import { useLanguage } from "../i18n";
import "../styles/contact.css";

export default function ContactOptions() {
  const { t } = useLanguage();
  return (
    <div className="contact-options" aria-label={t("咨询与购买", "Inquiries and purchases")}>
      <div className="contact-intro"><strong>{t("咨询或购买，先添加客服。", "Contact support to ask or buy.")}</strong><p>Telegram · {contact.handle}</p></div>
      {contact.qrImage && (
        <figure>
          <img src={contact.qrImage} alt={t("开通咨询二维码", "QR code for setup inquiries")} />
          <figcaption>{t(contact.qrCaption, "Scan to ask about getting started")}</figcaption>
        </figure>
      )}
      {contact.link && (
        <a href={contact.link} target="_blank" rel="noopener noreferrer">
          {t(contact.linkLabel, "Contact on Telegram")} <ArrowUpRight size={16} />
        </a>
      )}
    </div>
  );
}
