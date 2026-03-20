// Nhập các hook quản lý trạng thái và hiệu ứng từ React
import { useState, useEffect } from "react";
// Nhập các biểu tượng trang trí từ lucide-react (Cúp, Túi mua sắm, Quà tặng, Đồng hồ, Sao...)
import { Award, ShoppingBag, Gift, Clock, CheckCircle2, AlertCircle, ChevronRight, Star, X, Copy, ExternalLink, Tag } from "lucide-react";
// Nhập context xác thực để lấy thông tin người dùng và số điểm hiện có
import { useAuth } from "../../contexts/AuthContext";
// Nhập các hàm gọi API xử lý Voucher (Lấy danh sách, Đổi quà)
import { getVouchers, redeemVoucher } from "../../api/voucher";

// Cấu hình URL cơ sở cho API và hàm lấy đường dẫn ảnh từ server
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");
const getImageUrl = (path) => path ? (path.startsWith("http") ? path : `${API_BASE}${path}`) : null;
// Nhập thư viện framer-motion để tạo các hiệu ứng chuyển động mượt mà cho UI
import { motion, AnimatePresence } from "framer-motion";

/**
 * COMPONENT ĐỔI THƯỞNG (REWARDS)
 * Chức năng: Cho phép người dùng xem danh sách quà tặng (voucher) và dùng điểm tích lũy để đổi
 */
function Rewards() {
  // Lấy dữ liệu người dùng và hàm cập nhật thông tin từ AuthContext
  const { user, updateUser } = useAuth();
  
  // CÁC TRẠNG THÁI (STATE) QUẢN LÝ DỮ LIỆU VÀ CỬA SỔ TỰ CHỌN
  const [vouchers, setVouchers] = useState([]); // Danh sách toàn bộ quà tặng
  const [loading, setLoading] = useState(true); // Trạng thái đang tải từ API
  const [activeTab, setActiveTab] = useState("all"); // Danh mục hiện tại đang được chọn lọc
  const [successRedemption, setSuccessRedemption] = useState(null); // Lưu thông tin quà đã đổi thành công để hiện Modal chúc mừng
  const [redeemingId, setRedeemingId] = useState(null); // ID của quà đang trong quá trình xử lý đổi
  const [confirmRedemption, setConfirmRedemption] = useState(null); // Lưu quà đang chờ xác nhận từ người dùng

  // Tổng số điểm hiện tại của người dùng (mặc định là 0 nếu chưa có thông tin)
  const userPoints = user?.totalPoints ?? 0;

  // Tự động gọi API lấy danh sách quà tặng khi trang vừa được tải
  useEffect(() => {
    fetchVouchers();
  }, []);

  /**
   * Hàm gọi API lấy danh sách Voucher
   */
  const fetchVouchers = async () => {
    try {
      const res = await getVouchers();
      if (res.success) {
        setVouchers(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch vouchers", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Bước 1: Kiểm tra xem người dùng có đủ điểm không trước khi hiện Modal xác nhận
   */
  const triggerConfirm = (voucher) => {
    if (userPoints < voucher.pointsRequired) return;
    setConfirmRedemption(voucher);
  };

  /**
   * Bước 2: Xử lý thực thi việc đổi quà (Gửi yêu cầu lên server)
   */
  const handleRedeem = async (voucher) => {
    // Kiểm tra thông tin định danh công dân
    if (!user || !user.citizenId) {
      alert("Không tìm thấy thông tin công dân. Vui lòng đăng nhập lại.");
      setConfirmRedemption(null);
      return;
    }

    setConfirmRedemption(null); // Đóng modal xác nhận
    setRedeemingId(voucher.voucherId); // Bắt đầu hiệu ứng loading trên nút
    try {
      const res = await redeemVoucher(user.citizenId, voucher.voucherId);
      if (res.success) {
        // Cập nhật lại số điểm trong context ngay lập tức để UI đồng bộ (không cần tải lại trang)
        updateUser({ totalPoints: user.totalPoints - voucher.pointsRequired });
        
        // Hiển thị thông tin Voucher vừa đổi thành công (mã code, tên quà)
        setSuccessRedemption({
          message: res.message || "Đổi quà thành công!",
          code: res.voucherCode || voucher.voucherCode || "WELCOME2026",
          voucherName: res.voucherName || voucher.voucherName
        });
        fetchVouchers(); // Tải lại danh sách để cập nhật số lượng tồn kho (stock)
      } else {
        alert(res.message || "Lỗi khi đổi quà.");
      }
    } catch (err) {
      console.error(err);
      alert("Đã có lỗi xảy ra khi đổi quà.");
    } finally {
      setRedeemingId(null);
    }
  };

  // Tạo danh sách các danh mục duy nhất từ dữ liệu Voucher để làm bộ lọc (Tabs)
  const categories = ["all", ...new Set(vouchers.map(v => v.category).filter(Boolean))];

  // Lọc danh sách quà theo Tab đang được chọn
  const filteredVouchers = activeTab === "all" 
    ? vouchers 
    : vouchers.filter(v => v.category === activeTab);

  /**
   * Hàm hỗ trợ sao chép mã Voucher vào bộ nhớ tạm (Clipboard)
   */
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Có thể thêm Toast thông báo "Đã sao chép" ở đây
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-gray-50/30">
      
      {/* PHẦN ĐẦU TRANG: Banner điểm số hiện tại (Hero Section) */}
      <div className="relative mb-12 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 p-10 text-white shadow-2xl shadow-emerald-200/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black mb-3 flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-md">
                <Gift size={36} className="text-white fill-white/20" />
              </div>
              Đổi Điểm Nhận Quà
            </h1>
            <p className="text-emerald-50 opacity-90 text-lg max-w-xl font-medium leading-relaxed">
              Tích lũy điểm từ việc báo cáo rác thải và đổi lấy những phần quà hấp dẫn từ các đối tác hàng đầu.
            </p>
          </div>
          {/* Box hiển thị số điểm nổi bật */}
          <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 border border-white/20 flex flex-col items-center justify-center min-w-[240px] shadow-inner">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100 mb-2">Số dư điểm hiện tại</span>
            <span className="text-5xl font-black flex items-center gap-3 tabular-nums">
              {userPoints.toLocaleString()}
              <Star className="text-yellow-300 fill-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]" size={32} />
            </span>
          </div>
        </div>
        
        {/* Các phần tử trang trí nền (Blurry circles) */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-emerald-300/20 rounded-full blur-[120px]"></div>
      </div>

      {/* THANH DANH MỤC LỌC (CATEGORIES) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 mr-2">
            <ShoppingBag size={18} className="text-emerald-600" />
            <span className="text-sm font-bold text-gray-700">Danh mục</span>
          </div>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-6 py-2.5 rounded-2xl text-sm font-bold capitalize transition-all duration-300 ${
                activeTab === cat 
                  ? "bg-emerald-600 text-white shadow-xl shadow-emerald-200 scale-105" 
                  : "bg-white text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-100 shadow-sm"
              }`}
            >
              {cat === "all" ? "Tất cả" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* HIỂN THỊ DANH SÁCH QUÀ TẶNG (VOUCHERS GRID) */}
      {loading ? (
        // Khung chờ (Skeleton loading) khi đang tải dữ liệu
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1,2,3,4,5,6].map(n => (
            <div key={n} className="bg-white rounded-[2.5rem] h-[28rem] animate-pulse border border-gray-100 shadow-sm"></div>
          ))}
        </div>
      ) : filteredVouchers.length === 0 ? (
        // Hiển thị khi không có quà nào trong danh mục
        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 shadow-inner">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <ShoppingBag size={48} className="text-gray-200" />
          </div>
          <h3 className="text-2xl font-bold text-gray-400">Chưa có quà tặng nào</h3>
          <p className="text-gray-400 mt-2 max-w-sm mx-auto font-medium">Chúng tôi đang cập nhật thêm quà tặng mới. Vui lòng quay lại sau nhé!</p>
        </div>
      ) : (
        // Hiển thị lưới quà tặng
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredVouchers.map((v) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              key={v.voucherId}
              className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-emerald-200/30 transition-all duration-500 flex flex-col relative"
            >
              {/* PHẦN ẢNH VÀ NHÃN (IMAGE & TAGS) */}
              <div className="relative h-60 overflow-hidden shrink-0">
                <img 
                  src={getImageUrl(v.image) || "https://images.unsplash.com/photo-1549463510-274ce4897d7d?q=80&w=2070&auto=format&fit=crop"} 
                  alt={v.voucherName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                />
                {/* Nhãn danh mục */}
                <div className="absolute top-5 left-5">
                  <span className="px-4 py-1.5 bg-white/95 backdrop-blur-md text-emerald-700 text-xs font-black rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
                    <Tag size={12} />
                    {v.category || "Chung"}
                  </span>
                </div>
                
                {/* Hiển thị điểm cần đổi đè lên ảnh */}
                <div className="absolute bottom-5 right-5">
                  <div className="bg-emerald-600 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 font-black tabular-nums border border-white/20">
                    {v.pointsRequired.toLocaleString()}
                    <Star size={16} className="fill-white" />
                  </div>
                </div>

                {/* Lớp phủ thông báo khi người dùng không đủ điểm (chỉ hiện khi hover) */}
                {v.pointsRequired > userPoints && (
                  <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[4px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-white/20 backdrop-blur-xl text-white border border-white/30 px-6 py-3 rounded-[2rem] flex flex-col items-center transform scale-90 group-hover:scale-100 transition-transform duration-500">
                      <AlertCircle size={24} className="mb-2 text-yellow-300" />
                      <span className="font-black text-sm uppercase tracking-wider">Cần thêm {(v.pointsRequired - userPoints).toLocaleString()} pts</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* PHẦN NỘI DUNG (CONTENT) */}
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-black text-gray-900 leading-[1.2] group-hover:text-emerald-600 transition-colors">
                    {v.voucherName}
                  </h3>
                </div>
                
                <p className="text-gray-500 text-sm mb-8 flex-1 leading-relaxed font-medium line-clamp-3 italic">
                  {v.description || "Voucher có giá trị sử dụng tại tất cả các hệ thống cửa hàng trên toàn quốc. Không áp dụng đồng thời với các khuyến mãi khác."}
                </p>
                
                {/* FOOTER CỦA CARD: Số lượng tồn và Nút Đổi */}
                <div className="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Số lượng còn lại</span>
                    <span className={`text-lg font-black ${v.stockQuantity < 10 ? 'text-red-500' : 'text-gray-900'}`}>{v.stockQuantity}</span>
                  </div>
                  
                  <button
                    disabled={userPoints < v.pointsRequired || v.stockQuantity === 0 || redeemingId === v.voucherId}
                    onClick={() => triggerConfirm(v)}
                    className={`px-8 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${
                      userPoints >= v.pointsRequired && v.stockQuantity > 0
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white shadow-lg shadow-emerald-100 hover:shadow-emerald-200 hover:-translate-y-1"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {redeemingId === v.voucherId ? (
                      <div className="w-5 h-5 border-[3px] border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        {v.stockQuantity === 0 ? "Hết quà" : "Đổi ngay"}
                        <ChevronRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* NHÃN HẠN DÙNG DƯỚI ĐÁY (EXPIRY FOOTER) */}
              {v.expiryDays > 0 && (
                <div className="px-8 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-wider">
                  <Clock size={16} className="text-gray-300" />
                  Hạn dùng: {v.expiryDays} ngày kể từ khi đổi
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* THẺ GỢI Ý CÁCH KIẾM ĐIỂM (TIP CARD) */}
      <div className="mt-20 bg-emerald-600 rounded-[3rem] p-12 text-white flex flex-col lg:flex-row items-center gap-10 shadow-2xl shadow-emerald-200 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl rotate-6 group-hover:rotate-12 transition-transform">
          <Award size={48} className="text-emerald-600" />
        </div>
        <div className="relative z-10 flex-1 text-center lg:text-left">
          <h4 className="text-3xl font-black mb-4 leading-tight">Làm thế nào để nhận thêm điểm?</h4>
          <p className="text-emerald-50 text-xl font-medium max-w-2xl leading-relaxed opacity-90 text-center lg:text-left mx-auto lg:mx-0">
            Mỗi lần gửi báo cáo rác thải hợp lệ và được xác nhận, bạn sẽ nhận được <span className="text-yellow-300 font-black">10 - 50 điểm thưởng</span>. Hãy tích cực bảo vệ môi trường nhé!
          </p>
        </div>
        <button 
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          className="relative z-10 bg-white text-emerald-600 hover:bg-emerald-50 px-10 py-5 rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          Bắt đầu ngay
        </button>
      </div>

      {/* MODAL THÔNG BÁO ĐỔI QUÀ THÀNH CÔNG (SUCCESS MODAL) */}
      <AnimatePresence>
        {successRedemption && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSuccessRedemption(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden p-10 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-inner">
                <CheckCircle2 size={56} className="animate-bounce" />
              </div>
              
              <h3 className="text-3xl font-black text-emerald-900 mb-2">{successRedemption.message}</h3>
              <p className="text-gray-500 font-bold mb-10 text-lg">Bạn đã đổi thành công <span className="text-emerald-600">{successRedemption.voucherName}</span></p>
              
              {/* Hiển thị mã Voucher cho người dùng copy */}
              <div className="w-full bg-emerald-50 rounded-[2rem] p-8 border-2 border-dashed border-emerald-200 mb-10 group relative">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-4 block">Mã ưu đãi của bạn</span>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-5xl font-black text-emerald-700 tracking-wider font-mono select-all">
                    {successRedemption.code}
                  </span>
                  <button 
                    onClick={() => copyToClipboard(successRedemption.code)}
                    className="p-3 bg-white text-emerald-600 rounded-2xl shadow-md hover:bg-emerald-600 hover:text-white transition-all active:scale-90"
                  >
                    <Copy size={24} />
                  </button>
                </div>
                {/* Trang trí hình nửa vòng tròn ở 2 bên mã voucher (giống cuống vé) */}
                <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 bg-white rounded-full border border-emerald-50 shadow-inner"></div>
                <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 bg-white rounded-full border border-emerald-50 shadow-inner"></div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  onClick={() => setSuccessRedemption(null)}
                  className="py-5 px-6 border-2 border-gray-100 text-gray-500 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
                <button 
                  onClick={() => setSuccessRedemption(null)}
                  className="py-5 px-6 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  Dùng ngay <ExternalLink size={20} />
                </button>
              </div>
              
              <button 
                onClick={() => setSuccessRedemption(null)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL XÁC NHẬN ĐỔI QUÀ (CONFIRM MODAL) */}
      <AnimatePresence>
        {confirmRedemption && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmRedemption(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden p-8 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Gift size={40} />
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-2">Bạn có chắc chắn đổi quà không?</h3>
              <p className="text-gray-500 font-medium mb-8">
                Hệ thống sẽ trừ <span className="font-bold text-yellow-500">{confirmRedemption.pointsRequired} điểm</span> để đổi <span className="font-bold text-gray-800">{confirmRedemption.voucherName}</span>.
              </p>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  onClick={() => setConfirmRedemption(null)}
                  className="py-4 px-6 border border-gray-200 text-gray-600 rounded-[1.2rem] font-bold shadow-sm hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={() => handleRedeem(confirmRedemption)}
                  className="py-4 px-6 bg-emerald-600 text-white rounded-[1.2rem] font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors"
                >
                  Xác nhận
                </button>
              </div>
              
              <button 
                onClick={() => setConfirmRedemption(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Rewards;
