import {
  Recycle,
  ThumbsUp,
  MessageCircle,
  Youtube,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Recycle className="h-8 w-8 text-green-500" />
              <span className="text-xl font-bold text-gray-900">
                Green Vietnam
              </span>
            </div>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Sứ mệnh của chúng tôi là mang đến giải pháp tái chế thông minh,
              kết nối cộng đồng vì một Việt Nam xanh, sạch và bền vững thông qua
              công nghệ hiện đại.
            </p>
            <div className="flex space-x-3">
              <button className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200 transition">
                <ThumbsUp className="h-5 w-5" />
              </button>
              <button className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200 transition">
                <MessageCircle className="h-5 w-5" />
              </button>
              <button className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition">
                <Youtube className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Về chúng tôi
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-500 transition"
                >
                  Giới thiệu công ty
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-500 transition"
                >
                  Quy định thu gom
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-500 transition"
                >
                  Dự án cộng đồng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-500 transition"
                >
                  Tuyển dụng
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                <span className="text-gray-600">
                  Tòa nhà Green Tech, 123 Đường Láng, Đống Đa, Hà Nội
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-600">1900 123 456</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-600">hotro@greenvietnam.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm mb-4 md:mb-0">
            © 2024 Green Vietnam. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-gray-600 hover:text-green-500 text-sm transition"
            >
              Điều khoản sử dụng
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-green-500 text-sm transition"
            >
              Chính sách bảo mật
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
