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

    // Hiển thị popup chia sẻ
    const [showSharePopup, setShowSharePopup] = useState(false);
    // Đánh dấu tải xong video
    const [downloadCompleted, setDownloadCompleted] = useState(false);
    // Khóa nút khi đang tải video
    const [isDownloading, setIsDownloading] = useState(false);

    // Nếu progress giữa 1 và 99 => đang tải video
    useEffect(() => {
        if (progress > 0 && progress < 100) {
            setIsDownloading(true);
        } else {
            setIsDownloading(false);
        }
    }, [progress]);

    // Khi progress đạt 100% thì đánh dấu tải xong
    useEffect(() => {
        if (progress === 100) {
            setDownloadCompleted(true);
        }
    }, [progress]);

    // Hiển thị popup sau khi tải xong và chưa từng chia sẻ
    useEffect(() => {
        if (downloadCompleted && !getCookie('shared')) {
            setTimeout(() => setShowSharePopup(true), 1000);
        }
    }, [downloadCompleted]);

    if (!videoData || !videoData.medias || videoData.medias.length === 0) {
        return <p className={styles.error}>{t('no_media_found')}</p>;
    }

    const handleDownloadAnother = () => {
        if (router.pathname === `/${router.locale}` || router.pathname === '/') {
            window.location.reload();
        } else {
            router.push(`/${router.locale}`);
        }
    };

    // Tải ảnh (từng ảnh một)
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

            // Xóa URL blob sau khi tải xong
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            alert(t('download_failed'));
        }
    };

    // Tải tất cả ảnh tuần tự với delay ngẫu nhiên
    const downloadAllImages = async () => {
        const imageList = videoData.medias.filter(media => media.type === 'image');

        for (let i = 0; i < imageList.length; i++) {
            await downloadImage(imageList[i].url, i);

            // Delay ngẫu nhiên 0.5s - 1.5s
            const delay = Math.random() * (1500 - 500) + 500;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    };

    return (
        <div className={styles.resultContainer}>
            <div className={styles.videoInfo}>
                {videoData.metadata?.thumbnail && (
                    <img
                        src={videoData.metadata.thumbnail}
                        alt="Thumbnail"
                        className={styles.thumbnail}
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
                {videoData.medias.some(media => media.type === 'image') && (
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

                {/* Thanh tiến trình + nút hủy */}
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
                                className={styles.cancelIcon} 
                            />
                            {t('cancel_download')}
                        </button>
                    </>
                )}
            </div>

            {/* Nếu có video/audio */}
            {videoData.medias.some(media => media.type === 'video') ? (
                <div className={styles.downloadOptions}>
                    {videoData.medias
                        .filter(media => media.type === 'video' || media.type === 'audio')
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
                                    {media.resolution?.toUpperCase() || 'MP3'}
                                </strong>{' '}
                                {media.format.toUpperCase()} (
                                {media.size && media.size > 0
                                    ? (media.size / 1024 / 1024).toFixed(2) + ' MB'
                                    : t('unknown_size')}
                                )
                            </button>
                        ))}
                </div>
            ) : (
                <div className={styles.imageGrid}>
                    {videoData.medias
                        .filter(media => media.type === 'image')
                        .map((media, index) => (
                            <div key={index} className={styles.imageItem}>
                                <img
                                    src={media.url}
                                    alt={`Image ${index + 1}`}
                                    className={styles.image}
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

            <div className={styles.downloadAnotherWrapper}>
                <button 
                    className={styles.downloadAnother} 
                    onClick={handleDownloadAnother}
                >
                    {t('download_another')}
                </button>
            </div>
            
            {showSharePopup && <SharePopup onClose={() => setShowSharePopup(false)} />} 
        </div>
    );
}
