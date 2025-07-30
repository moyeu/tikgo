//import { Clipboard } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import styles from '../styles/TikTokDownloader.module.css';

export default function DownloadForm({ url, setUrl, loading, handleDownload }) {
    const { t } = useTranslation();

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                setUrl(text);
            } else {
                alert(t('clipboard_empty'));
            }
        } catch (err) {
            console.error('Clipboard Error:', err);
            alert(t('clipboard_error'));
        }
    };

    return (
        <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
                <input
                    type="text"
                    placeholder={t('paste_placeholder')}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className={styles.input}
                />
                <button onClick={handlePaste} className={styles.pasteButton}>
                    <img
                        src="/icons/clipboard.svg"
                        alt="Paste"
                        width="30"
                        height="30"
                        className={styles.pasteIcon}
                        loading="lazy"
                    />
                </button>
            </div>
            <button
                className={styles.downloadButton}
                onClick={handleDownload}
                disabled={!url.trim() || loading}
            >
                {loading ? t('loading') : t('download_button')}
            </button>
        </div>
    );
}
