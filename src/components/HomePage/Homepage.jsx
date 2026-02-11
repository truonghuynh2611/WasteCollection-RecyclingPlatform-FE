import {
  Camera,
  FileText,
  Users,
  Award,
  RecycleIcon,
  Truck,
  Gift,
} from "lucide-react";

function Homepage() {
  const stats = [
    {
      icon: FileText,
      label: "SỐ LƯỢNG BÁO CÁO RÁC ĐÃ ĐƯỢC TIẾP NHẬN",
      value: "1,250",
      unit: "đơn",
      change: "+12%",
      color: "text-green-500",
    },
    {
      icon: Users,
      label: "SỐ LƯỢNG NGƯỜI DÂN ĐÃ THAM GIA BÁO CÁO RÁC",
      value: "15,400",
      unit: "",
      change: "+18%",
      color: "text-green-500",
    },
    {
      icon: Award,
      label: "ĐIỂM THƯỞNG ĐÃ TRAO",
      value: "8.5",
      unit: "triệu",
      change: "+25%",
      color: "text-green-500",
    },
  ];

  const steps = [
    {
      number: 1,
      icon: RecycleIcon,
      title: "Phân loại & Báo cáo",
      description:
        "Phân loại rác tái chế (nhựa, giấy, kim loại) và gửi yêu cầu thu gom kèm hình ảnh qua ứng dụng.",
    },
    {
      number: 2,
      icon: Truck,
      title: "Thu gom tận nơi",
      description:
        "Đội ngũ thu gom xác nhận vị trí và đến tận nơi thu nhận rác, vận chuyển về nhà máy xử lý.",
    },
    {
      number: 3,
      icon: Gift,
      title: "Tích điểm đổi quà",
      description:
        "Nhận điểm thưởng GreenPoints dựa trên khối lượng rác đóng góp. Đổi lấy voucher, tiền mặt hoặc quà tặng.",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center text-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/2131967/pexels-photo-2131967.jpeg?auto=compress&cs=tinysrgb&w=1920)",
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Giải pháp thông minh cho
          </h1>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-green-400 mb-6">
            Rác thải & Tái chế
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Dịch vụ thu gom rác thải chuyên nghiệp và đáng tin cậy. Chúng tôi
            kết nối trực tiếp với hộ gia đình để xử lý và tái chế rác thải hiệu
            quả vì một môi trường xanh sạch.
          </p>
          <button className="bg-green-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-600 transition inline-flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Báo cáo thu gom</span>
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 mb-3 tracking-wide">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </span>
                      <span className="text-lg text-gray-600">{stat.unit}</span>
                      <span className={`text-sm font-semibold ${stat.color}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`${stat.color} bg-green-50 p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Quy trình thu gom & tái chế
              </h2>
              <p className="text-gray-600">
                Biến rác thải thành tài nguyên chỉ với 3 bước đơn giản
              </p>
            </div>
            <button className="mt-4 md:mt-0 border-2 border-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:border-green-500 hover:text-green-500 transition">
              Tìm hiểu chi tiết
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition"
              >
                <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                  <step.icon className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.number}. {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Homepage;
