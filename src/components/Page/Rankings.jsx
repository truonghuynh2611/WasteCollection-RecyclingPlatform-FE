// Nhập các hook từ React
import { useState, useEffect } from "react";
// Nhập các icon từ thư viện lucide-react để minh họa thứ hạng và thành tích
import { Trophy, Medal, Search, TrendingUp, User, MapPin, Award, Star, Crown } from "lucide-react";
// Nhập hook useAuth để biết thông tin người dùng hiện tại (để làm nổi bật họ trong bảng)
import { useAuth } from "../../contexts/AuthContext";
// Nhập hàm gọi API lấy danh sách xếp hạng
import { getCitizenRankings } from "../../api/ranking";
// Thư viện framer-motion để tạo các hiệu ứng chuyển động mượt mà
import { motion } from "framer-motion";

/**
 * COMPONENT BẢNG XẾP HẠNG (RANKINGS)
 * Hiển thị các công dân xanh có tích điểm cao nhất hệ thống
 */
function Rankings() {
  const { user: currentUser } = useAuth();
  const [rankings, setRankings] = useState([]); // Danh sách toàn bộ bảng xếp hạng
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu
  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm công dân

  // Lấy dữ liệu xếp hạng từ server khi component khởi chạy
  useEffect(() => {
    async function fetchRankings() {
      try {
        const res = await getCitizenRankings();
        if (res.success) {
          setRankings(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch rankings", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRankings();
  }, []);

  // Lọc danh sách theo tên hoặc email khi người dùng nhập vào ô tìm kiếm
  const filteredRankings = rankings.filter(r => 
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tách 3 người dẫn đầu để hiển thị trên bục vinh quang (Podium)
  const topThree = filteredRankings.slice(0, 3);
  const rest = filteredRankings.slice(3);

  // Hàm phụ trợ lấy Icon tương ứng với thứ hạng (Hạng 1: Vương miện, Hạng 2&3: Huy chương)
  const getRankIcon = (rank) => {
    switch(rank) {
      case 0: return <Crown className="text-yellow-400" size={32} />;
      case 1: return <Medal className="text-gray-400" size={28} />;
      case 2: return <Medal className="text-amber-600" size={28} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* PHẦN TIÊU ĐỀ VÀ MÔ TẢ (TITLE & DESCRIPTION) */}
      <div className="text-center mb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-2xl text-emerald-600 mb-6"
        >
          <Trophy size={40} />
        </motion.div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Bảng Xếp Hạng Công Dân Xanh</h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Tôn vinh những cá nhân có đóng góp tích cực nhất trong việc giữ gìn vệ sinh môi trường đô thị.
        </p>
      </div>

      {/* BỤC VINH QUANG CHO TOP 3 (PODIUM) */}
      {!loading && topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-end max-w-5xl mx-auto">
          
          {/* HẠNG NHÌ (SECOND PLACE) */}
          {topThree[1] && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="order-2 md:order-1 flex flex-col items-center"
            >
              <div className="relative mb-4 group">
                <div className="w-24 h-24 rounded-full border-4 border-gray-200 p-1 bg-white overflow-hidden shadow-xl">
                  <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-3xl uppercase">
                    {topThree[1].fullName[0]}
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-3 bg-white rounded-full p-2 shadow-lg border border-gray-100">
                  <Medal className="text-gray-400" size={24} />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-gray-900 text-lg truncate w-40">{topThree[1].fullName}</h3>
                <div className="text-emerald-600 font-black text-2xl flex items-center justify-center gap-1">
                  {topThree[1].totalPoints.toLocaleString()}
                  <Star size={18} className="fill-emerald-600" />
                </div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Hạng 2</span>
              </div>
              <div className="w-full h-32 bg-gradient-to-t from-gray-100 to-transparent mt-4 rounded-t-3xl border-x border-t border-gray-50"></div>
            </motion.div>
          )}

          {/* HẠNG NHẤT (FIRST PLACE) - Nằm ở giữa */}
          {topThree[0] && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="order-1 md:order-2 flex flex-col items-center"
            >
              <div className="relative mb-6 group">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce">
                  <Crown className="text-yellow-400 drop-shadow-lg" size={48} />
                </div>
                <div className="w-32 h-32 rounded-full border-4 border-yellow-400 p-1 bg-white overflow-hidden shadow-2xl relative z-10">
                  <div className="w-full h-full rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 font-black text-4xl uppercase">
                    {topThree[0].fullName[0]}
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full bg-yellow-400 blur-xl opacity-20 scale-125"></div>
              </div>
              <div className="text-center relative z-10">
                <h3 className="font-black text-gray-900 text-2xl truncate w-56 mb-1">{topThree[0].fullName}</h3>
                <div className="bg-yellow-400 text-white px-4 py-1.5 rounded-full font-black text-xl flex items-center justify-center gap-1 shadow-lg shadow-yellow-100 mb-2">
                  {topThree[0].totalPoints.toLocaleString()}
                  <Star size={20} className="fill-white" />
                </div>
                <span className="text-xs text-yellow-600 font-black uppercase tracking-widest">Nhà Vô Địch</span>
              </div>
              <div className="w-full h-48 bg-gradient-to-t from-yellow-50 to-transparent mt-4 rounded-t-3xl border-x border-t border-yellow-100 relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <Trophy size={80} className="text-yellow-400" />
                </div>
              </div>
            </motion.div>
          )}

          {/* HẠNG BA (THIRD PLACE) */}
          {topThree[2] && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="order-3 flex flex-col items-center"
            >
              <div className="relative mb-4 group">
                <div className="w-20 h-20 rounded-full border-4 border-amber-600/30 p-1 bg-white overflow-hidden shadow-xl">
                  <div className="w-full h-full rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-2xl uppercase">
                    {topThree[2].fullName[0]}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg border border-gray-100">
                  <Medal className="text-amber-600" size={20} />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-gray-900 text-lg truncate w-40">{topThree[2].fullName}</h3>
                <div className="text-emerald-600 font-black text-xl flex items-center justify-center gap-1">
                  {topThree[2].totalPoints.toLocaleString()}
                  <Star size={16} className="fill-emerald-600" />
                </div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Hạng 3</span>
              </div>
              <div className="w-full h-24 bg-gradient-to-t from-amber-50/50 to-transparent mt-4 rounded-t-3xl border-x border-t border-amber-50"></div>
            </motion.div>
          )}
        </div>
      )}

      {/* BẢNG CHI TIẾT THỨ HẠNG (MAIN RANKING TABLE) */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden mb-12">
        {/* Thanh tiêu đề bảng và thanh tìm kiếm */}
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">Chi Tiết Thứ Hạng</h2>
              <p className="text-sm text-gray-400 font-medium">{filteredRankings.length} công dân đang hoạt động</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm công dân..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-gray-900 font-medium text-sm"
            />
          </div>
        </div>

        {/* Cấu trúc bảng dữ liệu */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 text-left">
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Hạng</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Công Dân</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hidden sm:table-cell">Khu Vực</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Tổng Điểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                // Hiển thị khung xương (Skeleton) khi đang tải
                [1,2,3,4,5].map(n => (
                  <tr key={n} className="animate-pulse">
                    <td className="px-8 py-6 h-20 bg-white"></td>
                    <td className="px-8 py-6 h-20 bg-white"></td>
                    <td className="px-8 py-6 h-20 bg-white"></td>
                    <td className="px-8 py-6 h-20 bg-white"></td>
                  </tr>
                ))
              ) : (
                // Duyệt qua danh sách đã lọc để hiển thị từng dòng
                filteredRankings.map((person, index) => {
                  const isCurrentUser = String(person.userId) === String(currentUser?.id);
                  return (
                    <motion.tr 
                      key={person.userId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`group hover:bg-emerald-50/30 transition-all duration-300 ${isCurrentUser ? "bg-emerald-50/50 ring-2 ring-inset ring-emerald-500/20" : ""}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <span className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-lg ${
                            index < 3 ? "bg-white shadow-sm" : "bg-gray-50 text-gray-400"
                          }`}>
                            {index + 1}
                          </span>
                          {index < 3 && getRankIcon(index)}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          {/* Avatar chữ cái đầu của tên */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl uppercase ${
                            isCurrentUser ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
                          }`}>
                            {person.fullName[0]}
                          </div>
                          <div>
                            <p className="font-black text-gray-900 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                              {person.fullName}
                              {isCurrentUser && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">Bạn</span>}
                            </p>
                            <p className="text-xs text-gray-400 font-medium">{person.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 hidden sm:table-cell">
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                          <MapPin size={16} className="text-emerald-500 opacity-60" />
                          Quận 1, TP.HCM
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span className="text-2xl font-black text-gray-900 flex items-center gap-1.5 leading-none">
                            {person.totalPoints.toLocaleString()}
                            <Star size={20} className="fill-emerald-500 text-emerald-500" />
                          </span>
                          <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1 opacity-60">Thành viên vàng</span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CÁC THẺ THỐNG KÊ PHỤ (STATS CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cộng đồng tham gia */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600">
            <User size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Cộng đồng</p>
            <h4 className="text-3xl font-black text-gray-900">1,240+</h4>
            <p className="text-xs text-gray-400 mt-1">Người tham gia mới tháng này</p>
          </div>
        </div>
        
        {/* Thành tích tích lũy */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600">
            <Medal size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Thành tích</p>
            <h4 className="text-3xl font-black text-gray-900">15.4k</h4>
            <p className="text-xs text-gray-400 mt-1">Điểm thưởng đã được cấp</p>
          </div>
        </div>

        {/* Quà tặng đã đổi */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-600">
            <Award size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Quà tặng</p>
            <h4 className="text-3xl font-black text-gray-900">450+</h4>
            <p className="text-xs text-gray-400 mt-1">Voucher đã được quy đổi</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Rankings;
