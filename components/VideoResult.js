import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import styles from '../styles/TikTokDownloader.module.css';
import SharePopup from './SharePopup';
import { getCookie } from '../utils/cookies';

export default function VideoResult({ 
    videoData, 
    progress, 
    handleVideoDownload, 
    cancelDownload, 
    isRegionReady, 
    userIP, 
    userRegion 
}) {
    const { t } = useTranslation();
    const router = useRouter();

    /* ------------------------------------------------------------ */
    /* 🟢  Local state                                               */
    /* ------------------------------------------------------------ */
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [downloadCompleted, setDownloadCompleted] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    /* ------------------------------------------------------------ */
    /* 🔄  Progress / Download flags                                 */
    /* ------------------------------------------------------------ */
    useEffect(() => {
        setIsDownloading(progress > 0 && progress < 100);
    }, [progress]);

    useEffect(() => {
        if (progress === 100) setDownloadCompleted(true);
    }, [progress]);

    useEffect(() => {
        if (downloadCompleted && !getCookie('shared')) {
            setTimeout(() => setShowSharePopup(true), 1000);
        }
    }, [downloadCompleted]);

    /* ------------------------------------------------------------ */
    /* ⛔  No media guard                                            */
    /* ------------------------------------------------------------ */
    if (!videoData || !videoData.medias || videoData.medias.length === 0) {
        return <p className={styles.error}>{t('no_media_found')}</p>;
    }

    /* ------------------------------------------------------------ */
    /* 🛠  Helpers                                                   */
    /* ------------------------------------------------------------ */
    const handleDownloadAnother = () => {
        if (router.pathname === `/${router.locale}` || router.pathname === '/') {
            window.location.reload();
        } else {
            router.push(`/${router.locale}`);
        }
    };

    // Helpers for image download remain unchanged
    const downloadImage = async (imageUrl, index) => {
        try {
            const response = await fetch(imageUrl, { mode: 'cors', cache: 'no-cache' });
            if (!response.ok) throw new Error();

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `slide-tiktok-${index + 1}.jpg`;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            alert(t('download_failed'));
        }
    };

    const downloadAllImages = async () => {
        const imageList = videoData.medias.filter(m => m.type === 'image');
        for (let i = 0; i < imageList.length; i++) {
            await downloadImage(imageList[i].url, i);
            const delay = Math.random() * (1500 - 500) + 500;
            await new Promise(res => setTimeout(res, delay));
        }
    };

    /* ------------------------------------------------------------ */
    /* 🧮  Derive media categories                                   */
    /* ------------------------------------------------------------ */
    const hasVideoOrAudio = videoData.medias.some(m => m.type === 'video' || m.type === 'audio');
    const hasImagesOnly  = !hasVideoOrAudio && videoData.medias.some(m => m.type === 'image');

    return (
        <div className={styles.resultContainer}>
            {/* --------- Info / Thumbnail ------------------------ */}
            <div className={styles.videoInfo}>
                {videoData.metadata?.thumbnail && (
                    <img
                        src={videoData.metadata.thumbnail}
                        width="100"
                        height="100"
                        alt="Thumbnail"
                        className={styles.thumbnail}
                        loading="lazy"
                    />
                )}

                <p className={styles.author}>{videoData.metadata?.author || t('unknown_author')}</p>
                {videoData.metadata?.title && (
                    <p className={styles.caption}>
                        {videoData.metadata.title.length > 100
                            ? videoData.metadata.title.slice(0, 100) + '...'
                            : videoData.metadata.title}
                    </p>
                )}

                {/* Nút tải xuống tất cả ảnh */}
                {videoData.medias.some(m => m.type === 'image') && (
                    <div className={styles.downloadAllWrapper}>
                        <button
                            className={styles.downloadAllButton}
                            onClick={downloadAllImages}
                            disabled={isDownloading}
                        >
                            {t('download_all_images')}
                        </button>
                    </div>
                )}

                {/* Progress bar + Cancel */}
                {progress > 0 && progress < 100 && (
                    <>
                        <div className={styles.progressBarContainer}>
                            <div
                                className={styles.progressBar}
                                style={{ width: `${progress}%` }}
                            ></div>
                            <p className={styles.progressText}>{progress}%</p>
                        </div>
                        <button
                            className={styles.cancelButton}
                            onClick={() => cancelDownload && cancelDownload()}
                        >
                            <img
                                src="/icons/cancel.svg"
                                alt="Cancel"
                                width="18"
                                height="18"
                                className={styles.cancelIcon}
                                loading="lazy"
                            />
                            {t('cancel_download')}
                        </button>
                    </>
                )}
            </div>

            {/* --------- Download buttons ------------------------ */}
            {hasVideoOrAudio && (
                <div className={styles.downloadOptions}>
                    {videoData.medias
                        .filter(m => m.type === 'video' || m.type === 'audio')
                        .map((media, index) => (
                            <button
                                key={index}
                                className={`${styles.downloadOption} ${
                                    media.type === 'video'
                                        ? styles.videoDownload
                                        : styles.audioDownload
                                }`}
                                onClick={() => handleVideoDownload(media)}
                                disabled={isDownloading}
                            >
                                <strong>
                                    {media.type === 'audio'
                                        ? 'MP3'
                                        : media.resolution?.toUpperCase() || ''}
                                </strong>{' '}
                                {media.format.toUpperCase()} (
                                {media.size && media.size > 0
                                    ? (media.size / 1024 / 1024).toFixed(2) + ' MB'
                                    : t('unknown_size')}
                                )
                            </button>
                        ))}
                </div>
            )}

            {/* --------- Image grid (slide) ---------------------- */}
            {hasImagesOnly && (
                <div className={styles.imageGrid}>
                    {videoData.medias
                        .filter(m => m.type === 'image')
                        .map((media, index) => (
                            <div key={index} className={styles.imageItem}>
                                <img
                                    src={media.url}
                                    alt={`Image ${index + 1}`}
                                    width="200"
                                    height="250"
                                    className={styles.image}
                                    loading="lazy"
                                />
                                <button
                                    className={styles.imageDownloadButton}
                                    onClick={() => downloadImage(media.url, index)}
                                    disabled={isDownloading}
                                >
                                    {t('download_button')}
                                </button>
                            </div>
                        ))}
                </div>
            )}

            {/* --------- Download another ------------------------ */}
            <div className={styles.downloadAnotherWrapper}>
                <button className={styles.downloadAnother} onClick={handleDownloadAnother}>
                    {t('download_another')}
                </button>
            </div>

            {showSharePopup && <SharePopup onClose={() => setShowSharePopup(false)} />}
        </div>
    );
}