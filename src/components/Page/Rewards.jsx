import { useState, useEffect } from "react";
import { Award, ShoppingBag, Gift, Clock, CheckCircle2, AlertCircle, ChevronRight, Star } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getVouchers, redeemVoucher } from "../../api/voucher";
import { motion, AnimatePresence } from "framer-motion";

function Rewards() {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showSuccess, setShowSuccess] = useState(null);
  const [redeemingId, setRedeemingId] = useState(null);

  const userPoints = user?.total_points ?? 0;

  useEffect(() => {
    async function fetchVouchers() {
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
    }
    fetchVouchers();
  }, []);

  const handleRedeem = async (voucher) => {
    if (userPoints < voucher.pointsRequired) return;
    
    setRedeemingId(voucher.id);
    try {
      const res = await redeemVoucher(voucher.id);
      if (res.success) {
        setShowSuccess(res.message);
        setTimeout(() => setShowSuccess(null), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRedeemingId(null);
    }
  };

  const categories = ["all", ...new Set(vouchers.map(v => v.category))];

  const filteredVouchers = activeTab === "all" 
    ? vouchers 
    : vouchers.filter(v => v.category === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Header Section */}
      <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Gift size={32} />
              Đổi Điểm Nhận Quà
            </h1>
            <p className="text-emerald-50 opacity-90 text-lg max-w-xl">
              Tích lũy điểm từ việc báo cáo rác thải và đổi lấy những phần quà hấp dẫn từ các đối tác của chúng tôi.
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 flex flex-col items-center justify-center min-w-[200px]">
            <span className="text-sm font-medium uppercase tracking-wider opacity-80 mb-1">Điểm của bạn</span>
            <span className="text-4xl font-extrabold flex items-center gap-2">
              {userPoints.toLocaleString()}
              <Star className="text-yellow-300 fill-yellow-300" size={24} />
            </span>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-4 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 shadow-md"
          >
            <CheckCircle2 size={24} className="text-emerald-600" />
            <span className="font-medium">{showSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 items-center">
        <span className="text-gray-500 mr-2 font-medium flex items-center gap-1.5">
          <ShoppingBag size={18} /> Danh mục:
        </span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
              activeTab === cat 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                : "bg-white text-gray-600 hover:bg-emerald-50 border border-gray-100"
            }`}
          >
            {cat === "all" ? "Tất cả" : cat}
          </button>
        ))}
      </div>

      {/* Vouchers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(n => (
            <div key={n} className="bg-white rounded-3xl h-80 animate-pulse border border-gray-100"></div>
          ))}
        </div>
      ) : filteredVouchers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={40} className="text-gray-300" />
          </div>
          <p className="text-gray-500 text-lg">Hiện chưa có phần quà nào trong danh mục này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVouchers.map((v) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={v.id}
              className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={v.image} 
                  alt={v.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-700 text-xs font-bold rounded-full shadow-sm">
                    {v.category}
                  </span>
                </div>
                {v.pointsRequired > userPoints && (
                  <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-xl flex items-center gap-2 font-medium">
                      <AlertCircle size={18} />
                      Cần thêm {(v.pointsRequired - userPoints).toLocaleString()} pts
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-emerald-600 transition-colors">
                    {v.name}
                  </h3>
                </div>
                <p className="text-gray-500 text-sm mb-6 flex-1 italic">
                  {v.description}
                </p>
                
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Yêu cầu</span>
                    <span className="text-2xl font-black text-emerald-600 flex items-center gap-1">
                      {v.pointsRequired.toLocaleString()}
                      <Star size={18} className="fill-emerald-600" />
                    </span>
                  </div>
                  
                  <button
                    disabled={userPoints < v.pointsRequired || redeemingId === v.id}
                    onClick={() => handleRedeem(v)}
                    className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${
                      userPoints >= v.pointsRequired
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white shadow-emerald-50"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {redeemingId === v.id ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Đổi ngay
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {v.expiryDays > 0 && (
                <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-400 font-medium">
                  <Clock size={14} />
                  Hạn sử dụng: {v.expiryDays} ngày kể từ khi đổi
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Points Tip Card */}
      <div className="mt-16 bg-emerald-50 rounded-3xl p-8 border border-emerald-100 flex flex-col md:flex-row items-center gap-8">
        <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200 rotate-3">
          <Award size={40} className="text-white" />
        </div>
        <div>
          <h4 className="text-xl font-bold text-emerald-900 mb-2">Làm thế nào để nhận thêm điểm?</h4>
          <p className="text-emerald-700 max-w-2xl leading-relaxed">
            Mỗi lần bạn gửi báo cáo rác thải hợp lệ và được nhân viên thu gom xác nhận, bạn sẽ nhận được 10 điểm thưởng. 
            Phân loại rác tại nguồn chính xác có thể giúp bạn nhận thêm điểm bonus từ các chiến dịch cộng đồng!
          </p>
        </div>
        <button 
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          className="ml-auto bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white px-6 py-3 rounded-2xl font-bold shadow-sm transition-all border border-emerald-100"
        >
          Tích điểm ngay
        </button>
      </div>
    </div>
  );
}

export default Rewards;
