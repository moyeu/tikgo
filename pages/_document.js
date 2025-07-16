import Document, { Html, Head, Main, NextScript } from "next/document";
import { i18n } from "../next.config"; // Import danh sách locales từ next.config.js

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);

    // ✅ Lấy `locale` từ Next.js, nếu không có thì dùng mặc định
    const locale = ctx?.locale || i18n?.defaultLocale || "en";

    // ✅ Fix lỗi `zh-tw` bị Next.js nhận diện thành `zh`
    const lang = locale === "zh" ? "zh-tw" : locale;

    // ✅ Nếu là tiếng Ả Rập, đặt `dir="rtl"`, ngược lại là `ltr`
    const isRTL = locale === "ar";

    return {
      ...initialProps,
      locale: lang, // ✅ Gán giá trị lang chuẩn
      dir: isRTL ? "rtl" : "ltr", // ✅ Truyền `dir` vào render()
    };
  }

  render() {
    const { locale, dir } = this.props; // ✅ Nhận giá trị từ `getInitialProps`
    
    return (
      <Html lang={locale} dir={dir}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
