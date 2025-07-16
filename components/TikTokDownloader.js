import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { flushSync } from 'react-dom';
import { useUserRegion } from '../context/UserRegionContext';
import DownloadForm from './DownloadForm';
import VideoResult from './VideoResult';
import useDownloadManager from '../hooks/useDownloadManager';
import { validateUrl } from '../utils/urlValidator';
import styles from '../styles/TikTokDownloader.module.css';

export default function TikTokDownloader({ setHasResults }) {
    const { t } = useTranslation();
    const { userRegion, userIP } = useUserRegion();

    const [url, setUrl] = useState('');
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { progress, handleVideoDownload, cancelDownload } = useDownloadManager(userRegion, userIP);
    const [isRegionReady, setIsRegionReady] = useState(false);
    const [currentIP, setCurrentIP] = useState('');

    const [showVideo, setShowVideo] = useState(false); // 🔹 Trạng thái hiển thị video hướng dẫn
    const [videoLoaded, setVideoLoaded] = useState(false); // 🔹 Kiểm soát việc tải video

    const translations = useMemo(() => ({
        invalidUrl: t('invalid_url'),
        errorFetchingData: t('error_fetching_data'),
        errorNoValidData: t('error_no_valid_data')
    }), [t]);

    useEffect(() => {
        if (userRegion && userRegion !== "Unknown" && !isRegionReady) {
            setIsRegionReady(true);
        }
    }, [userRegion, isRegionReady]);

    useEffect(() => {
        if (userIP && userIP !== currentIP) {
            setCurrentIP(userIP);
            //console.log("📡 Cập nhật IP người dùng:", userIP);
        }
    }, [userIP, currentIP]);

    const handleDownload = async () => {
        if (!url.trim()) return;

        setLoading(true);
        setError('');
        setVideoData(null);

        const validation = validateUrl(url);
        if (!validation.isValid) {
            setError(translations.invalidUrl);
            setLoading(false);
            return;
        }

        try {
            const apiResponse = await fetch('/api/', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: validation.extractedUrl }) 
            });

            if (!apiResponse.ok) {
                flushSync(() => setError(translations.errorFetchingData));
                return;
            }

            const jsonData = await apiResponse.json();
            if (jsonData.medias) {
                flushSync(() => {
                    setVideoData(jsonData);
                    setHasResults(true);
                });
            } else {
                flushSync(() => setError(translations.errorNoValidData));
            }
        } catch (err) {
            //console.error("❌ Lỗi API:", err);
            flushSync(() => setError(translations.errorFetchingData));
        } finally {
            flushSync(() => setLoading(false));
        }
    };

    return (
        <div className={styles.container}>
            {!videoData && (
                <DownloadForm 
                    url={url} 
                    setUrl={setUrl} 
                    loading={loading} 
                    handleDownload={handleDownload} 
                />
            )}

            {error && <p className={styles.error}>{error}</p>}

            {/* 🔹 Hướng dẫn tải video (How to download) - Lazy Load Video */}
            <div className={styles.guideContainer}>
                <p 
                    className={styles.guideText} 
                    onClick={() => setShowVideo(!showVideo)}
                >
                    ▶️ {t('how_to_download')}
                </p>

                {showVideo && (
                    <div className={styles.videoContainer} onClick={() => setVideoLoaded(true)}>
                        {!videoLoaded ? (
                            <div className={styles.thumbnailContainer}>
                                <img
                                    src="https://img.youtube.com/vi/P8goZfTxTmY/maxresdefault.jpg"
                                    alt={t('how_to_download')}
                                    className={styles.videoThumbnail}
                                />
                                <div className={styles.playButton}>▶</div>
                            </div>
                        ) : (
                            <iframe
                                src="https://www.youtube.com/embed/P8goZfTxTmY?autoplay=1"
                                title="Hướng dẫn tải video"
                                frameBorder="0"
                                allowFullScreen
                            ></iframe>
                        )}
                    </div>
                )}
            </div>

            {/*<div className={styles.adBanner}>
                <p>Ad Space - Banner</p>
            </div>*/}

            {videoData && (
                <VideoResult 
                    videoData={videoData} 
                    progress={progress} 
                    handleVideoDownload={handleVideoDownload} 
                    cancelDownload={cancelDownload}
                    isRegionReady={isRegionReady}
                    userIP={userIP}
                    userRegion={userRegion}
                />
            )}
        </div>
    );
}
