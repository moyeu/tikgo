import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { setCookie } from "../utils/cookies";
import styles from "../styles/SharePopup.module.css";

const getRandomShareCount = () => {
  return Math.floor(Math.random() * (500 - 100 + 1)) + 100; // Random từ 100 - 500
};

const SharePopup = ({ onClose }) => {
  const { t } = useTranslation("common");
  const [hasShared, setHasShared] = useState(false);
  const [shareCount, setShareCount] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareUrls, setShareUrls] = useState({});

  useEffect(() => {
    setShareCount(getRandomShareCount());

    // Tạo URL chia sẻ một lần duy nhất
    const currentUrl = encodeURIComponent(window.location.href);
    setShareUrls({
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${currentUrl}`,
      telegram: `https://t.me/share/url?url=${currentUrl}`,
      reddit: `https://www.reddit.com/submit?url=${currentUrl}&title=Tải video TikTok miễn phí!`,
      whatsapp: `https://api.whatsapp.com/send?text=${currentUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`,
      messenger: `https://www.messenger.com/share?link=${currentUrl}`,
      tumblr: `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${currentUrl}`,
      viber: `viber://forward?text=${currentUrl}`,
      vk: `https://vk.com/share.php?url=${currentUrl}`
    });
  }, []);

  const handleShare = (platform) => {
    window.open(shareUrls[platform], "_blank");
    setCookie("shared", "true", 1);
    setHasShared(true);
  };

  const handleCopyLink = () => {
    if (typeof navigator.clipboard !== "undefined" && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => console.error("❌ Copy failed:", err));
    } else {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        document.body.removeChild(textArea);
      } catch (err) {
        console.error("❌ Fallback copy failed:", err);
      }
    }
  };

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContainer} style={{ border: "2px solid red" }}>
        <h4 className={styles.popupTitle}>{t("popupTitle")}</h4>
        <p className={styles.popupDescription}>{t("popupDescription", { count: shareCount })}</p>

        <p className={styles.shareCountText}>🔥 {shareCount} {t("shareMessage")}</p>

        <div className={styles.shareButtons}>
          {Object.entries(shareUrls).map(([platform, url]) => (
            <button key={platform} className={styles.shareButton} onClick={() => handleShare(platform)}>
              <svg className={styles.icon}>
                <use href={`/icons/social-sprites.svg#${platform}`} />
              </svg>
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </button>
          ))}
        </div>

        {/* Nút Copy Link */}
        <div className={styles.copyLinkContainer}>
          <button className={styles.copyLinkButton} onClick={handleCopyLink}>
            📋 {t("copyLink")}
          </button>
          {copySuccess && <p className={styles.copySuccess}>{t("copySuccess")}</p>}
        </div>

        {/* Nút đóng popup */}
        <button className={styles.closeButton} onClick={onClose}>{t("skipButton")}</button>
      </div>
    </div>
  );
};

export default SharePopup;
