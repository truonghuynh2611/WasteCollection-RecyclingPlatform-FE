import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, MapPin, Send, Filter, Recycle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { createWasteReport, getWasteReports } from "../../api/waste";

const RANKS = [
  { name: "Đồng", min: 0 },
  { name: "Bạc", min: 250 },
  { name: "Vàng", min: 1000 },
  { name: "Kim cương", min: 2500 },
];

const WASTE_TYPES = [
  { id: "Giấy", label: "Giấy", icon: "📄" },
  { id: "Nhựa", label: "Nhựa", icon: "🗑️" },
  { id: "Kim loại", label: "Kim loại", icon: "⚙️" },
];

const STATUS_MAP = {
  pending: "Đang chờ",
  assigned: "Đã phân công",
  collected: "Đã thu gom",
  completed: "Hoàn thành",
  "Đang chờ": "Đang chờ",
  "Đã thu gom": "Đã thu gom",
  "Đang xử lý": "Đang xử lý",
};

const STATUS_COLORS = {
  "Đang chờ": "bg-blue-100 text-blue-800",
  "Đã phân công": "bg-indigo-100 text-indigo-800",
  "Đã thu gom": "bg-emerald-100 text-emerald-800",
  "Hoàn thành": "bg-emerald-100 text-emerald-800",
  "Đang xử lý": "bg-orange-100 text-orange-800",
};

function getRankFromPoints(points) {
  let rank = RANKS[0];
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (points >= RANKS[i].min) {
      rank = RANKS[i];
      break;
    }
  }
  return rank;
}

function getRankProgress(userPoints) {
  const currentRank = getRankFromPoints(userPoints);
  const nextRank = RANKS[RANKS.indexOf(currentRank) + 1];
  if (!nextRank)
    return { progress: 100, needed: 0, currentRank, nextRank: null };
  const progress =
    ((userPoints - currentRank.min) / (nextRank.min - currentRank.min)) * 100;
  const needed = nextRank.min - userPoints;
  return {
    progress: Math.min(progress, 100),
    needed: Math.max(needed, 0),
    currentRank,
    nextRank,
  };
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("vi-VN");
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReportWaste() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedWasteType, setSelectedWasteType] = useState("Nhựa");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const userPoints = user?.total_points ?? 0;
  const userRank = getRankFromPoints(userPoints).name;
  const { progress, needed, nextRank } = getRankProgress(userPoints);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    let cancelled = false;
    async function fetchReports() {
      try {
        const data = await getWasteReports();
        if (!cancelled && Array.isArray(data)) {
          const mine = data.filter((r) => String(r.citizenId) === String(user?.id));
          setReports(mine);
        }
      } catch {
        if (!cancelled) setReports([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchReports();
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.id, navigate]);

  const handleSubmit = async () => {
    if (!user?.id || !location?.trim()) return;
    setSubmitting(true);
    try {
      await createWasteReport({
        citizenId: user.id,
        address: location.trim(),
        waste_type: selectedWasteType,
        description: description.trim() || undefined,
      });
      setDescription("");
      const data = await getWasteReports();
      const mine = data.filter((r) => String(r.citizenId) === String(user.id));
      setReports(mine);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const displayStatus = (status) =>
    STATUS_MAP[status] || status;
  const statusColor = (status) =>
    STATUS_COLORS[displayStatus(status)] || "bg-gray-100 text-gray-800";
  const pointsDisplay = (report) => {
    const s = (report.status || "").toLowerCase();
    if (s === "completed" || s === "collected") return "+10";
    return "—";
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Xin chào, <span className="text-emerald-600">{user?.full_name}</span>
        </h1>
        <p className="text-gray-600 mt-1">
          Báo cáo rác thải và theo dõi điểm thưởng của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form báo cáo */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Camera className="text-emerald-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Báo cáo rác mới</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh hiện trường (tùy chọn)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                  <Camera className="mx-auto text-gray-400 mb-2" size={28} />
                  <p className="text-sm text-gray-500">Kéo thả ảnh hoặc nhấn để tải lên</p>
                  <p className="text-xs text-gray-400 mt-1">AI sẽ gợi ý phân loại từ ảnh</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ / Vị trí thu gom <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="VD: 123 Lê Lợi, Quận 1, TP.HCM"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Phân loại rác tại nguồn
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {WASTE_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedWasteType(type.id)}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                        selectedWasteType === type.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-2xl mb-1">{type.icon}</span>
                      <span
                        className={`text-sm font-medium ${
                          selectedWasteType === type.id ? "text-emerald-700" : "text-gray-700"
                        }`}
                      >
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả thêm (không bắt buộc)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Ghi chú về khối lượng hoặc loại rác cụ thể..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !location?.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Send size={18} />
                <span>{submitting ? "Đang gửi..." : "Gửi báo cáo"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Điểm thưởng + Lịch sử */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-emerald-100 text-sm mb-1">Điểm thưởng tích lũy</p>
                <h3 className="text-4xl font-bold">
                  {userPoints.toLocaleString()} <span className="text-2xl">pts</span>
                </h3>
                <div className="mt-2 inline-block bg-emerald-400 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Hạng {userRank}
                </div>
                {nextRank && needed > 0 && (
                  <p className="text-emerald-100 text-sm mt-2">
                    Còn {needed} điểm để lên Hạng {nextRank.name}
                  </p>
                )}
              </div>
              <Link
                to="/rewards"
                className="bg-white text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Đổi quà
              </Link>
            </div>
            <div className="w-full bg-emerald-400 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Lịch sử báo cáo</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Của bạn</span>
                <Filter size={18} className="text-gray-400" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-500 pb-2 border-b">
                <div>THỜI GIAN</div>
                <div>LOẠI RÁC</div>
                <div>TRẠNG THÁI</div>
                <div className="text-right">ĐIỂM</div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-500">Đang tải...</div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Recycle className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-500 mb-2">Chưa có báo cáo nào</p>
                  <p className="text-sm text-gray-400">
                    Gửi báo cáo rác ở form bên trái để bắt đầu tích điểm
                  </p>
                </div>
              ) : (
                reports.map((report) => (
                  <div
                    key={report.id}
                    className="grid grid-cols-4 gap-4 py-4 border-b last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(report.created_at)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(report.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-700">
                        {report.waste_type || "—"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(
                          report.status
                        )}`}
                      >
                        {displayStatus(report.status)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-600 font-semibold">
                        {pointsDisplay(report)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                <Recycle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-emerald-900 mb-1">
                  Mẹo tích điểm nhanh
                </h4>
                <p className="text-sm text-emerald-800">
                  Điền đúng địa chỉ và phân loại rác chính xác để được thu gom nhanh và
                  nhận điểm thưởng khi đơn hoàn thành.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportWaste;
