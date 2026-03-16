import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { 
  User, Mail, Phone, Shield, Award, History, 
  ArrowRight, Edit2, Save, X, MapPin, Camera
} from "lucide-react";
import { getMyPointHistory } from "../../api/point";
import { getAllDistricts, getDistrictDetails } from "../../api/district";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [pointHistory, setPointHistory] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Edit logic states
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    streetAddress: "",
    districtId: "",
    areaId: "",
    avatar: ""
  });
  
  // Address metadata states
  const [districts, setDistricts] = useState([]);
  const [areas, setAreas] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        streetAddress: user.streetAddress || "",
        districtId: user.districtId || "",
        areaId: user.areaId || "",
        avatar: user.avatar || ""
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchPoints = async () => {
      if (user?.id) {
        try {
          const history = await getMyPointHistory(user.id);
          setPointHistory(history);
          const total = history.reduce((sum, item) => sum + (item.points || 0), 0);
          setTotalPoints(total);
        } catch (error) {
          console.error("Error fetching points:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPoints();
  }, [user?.id]);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await getAllDistricts();
        if (res.success) setDistricts(res.data);
      } catch (err) {
        console.error("Failed to fetch districts", err);
      }
    };
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (!formData.districtId) {
      setAreas([]);
      return;
    }
    const fetchAreas = async () => {
      try {
        const res = await getDistrictDetails(formData.districtId);
        if (res.success) setAreas(res.data.areas || []);
      } catch (err) {
        console.error("Failed to fetch areas", err);
      }
    };
    fetchAreas();
  }, [formData.districtId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const districtName = districts.find(d => String(d.districtId) === String(formData.districtId))?.districtName || "";
      const areaName = areas.find(a => String(a.areaId) === String(formData.areaId))?.areaName || "";
      
      const payload = {
        ...formData,
        districtName,
        areaName
      };
      
      updateUser(payload);
      setIsEditing(false);
      setMessage({ type: "success", text: "Cập nhật thông tin thành công!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Có lỗi xảy ra khi lưu thông tin." });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl text-center font-bold animate-in fade-in slide-in-from-top-4 duration-300 ${
          message.type === "success" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-red-100 text-red-700 border border-red-200"
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-500">
        {/* Header/Banner Area */}
        <div className="h-48 bg-gradient-to-r from-emerald-500 to-green-400 relative">
          <div className="absolute -bottom-16 left-8">
            <div className="p-2 bg-white rounded-3xl shadow-lg relative group cursor-pointer" onClick={handleAvatarClick}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                className="hidden" 
                accept="image/*"
              />
              <div className="w-32 h-32 bg-emerald-100 rounded-2xl flex items-center justify-center border-4 border-white overflow-hidden">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-emerald-600" />
                )}
              </div>
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <Camera size={24} />
                </div>
              )}
            </div>
          </div>
          
          <div className="absolute top-6 right-8">
            {isEditing ? (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-xl font-bold transition-all border border-white/30"
                >
                  <X size={18} /> Hủy
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-white text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-xl font-bold shadow-lg transition-all border border-white"
                >
                  <Save size={18} /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-white text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-xl font-bold shadow-lg transition-all border border-white"
              >
                <Edit2 size={18} /> Chỉnh sửa
              </button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="pt-20 pb-12 px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="flex-1">
              {isEditing ? (
                <div className="max-w-md">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Họ và tên</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                    className="text-4xl font-black text-gray-900 mb-2 w-full bg-gray-50 border-b-2 border-emerald-500 focus:outline-none focus:bg-emerald-50 transition-colors p-1 rounded-t-lg"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-4xl font-black text-gray-900 mb-2">{user.full_name}</h1>
                  <p className="text-gray-500 flex items-center gap-2">
                    <Shield size={18} className="text-emerald-500" />
                    <span className="font-semibold uppercase tracking-wider text-sm">{user.roleName}</span>
                  </p>
                </>
              )}
            </div>
            
            <div className="bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 flex items-center gap-4">
              <div className="p-3 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-200">
                <Award size={24} className="text-white" />
              </div>
              <div>
                <p className="text-emerald-700 text-xs font-bold uppercase tracking-tight">Tổng điểm tích lũy</p>
                <p className="text-3xl font-black text-emerald-900">{totalPoints.toLocaleString()} <span className="text-sm font-normal">điểm</span></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Info Cards */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                Thông tin cá nhân
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-emerald-200 hover:bg-white transition-all duration-300">
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 italic">
                    <Mail size={20} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="text-gray-900 font-semibold w-full bg-transparent border-b border-gray-200 focus:border-emerald-500 focus:outline-none py-1"
                      />
                    ) : (
                      <p className="text-gray-900 font-semibold">{user.email || "Chưa cập nhật"}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-emerald-200 hover:bg-white transition-all duration-300">
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                    <Phone size={20} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">Số điện thoại</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="text-gray-900 font-semibold w-full bg-transparent border-b border-gray-200 focus:border-emerald-500 focus:outline-none py-1"
                      />
                    ) : (
                      <p className="text-gray-900 font-semibold">{user.phone || "Chưa cập nhật"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                <MapPin size={22} className="text-emerald-500" />
                Địa chỉ liên lạc
              </h3>
              
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1 block">Số nhà, tên đường</label>
                      <input
                        type="text"
                        name="streetAddress"
                        value={formData.streetAddress}
                        onChange={handleInputChange}
                        placeholder="VD: 123 Lê Lợi"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:border-emerald-500 focus:outline-none font-medium text-gray-900"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1 block">Quận/Huyện</label>
                        <select
                          name="districtId"
                          value={formData.districtId}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:border-emerald-500 focus:outline-none font-medium text-sm text-gray-900"
                        >
                          <option value="">Chọn Quận/Huyện</option>
                          {districts.map(d => (
                            <option key={d.districtId} value={d.districtId}>{d.districtName}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1 block">Phường/Xã</label>
                        <select
                          name="areaId"
                          value={formData.areaId}
                          onChange={handleInputChange}
                          disabled={!formData.districtId}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:border-emerald-500 focus:outline-none font-medium text-sm text-gray-900 disabled:opacity-50"
                        >
                          <option value="">Chọn Phường/Xã</option>
                          {areas.map(a => (
                            <option key={a.areaId} value={a.areaId}>{a.areaName}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {user.streetAddress || user.districtName ? (
                      <>
                        <p className="text-gray-900 font-bold text-lg leading-tight">
                          {user.streetAddress || "Chưa cập nhật số nhà"}
                        </p>
                        <p className="text-gray-500 font-medium">
                          {user.areaName ? `${user.areaName}, ` : ""}{user.districtName || ""}
                        </p>
                      </>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-gray-400 italic text-sm">Chưa cập nhật thông tin địa chỉ</p>
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="mt-3 text-emerald-600 font-bold text-sm hover:underline"
                        >
                          + Thêm địa chỉ
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* History Section */}
          <div className="mb-0">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
              <History size={22} className="text-emerald-500" />
              Lịch sử tích điểm gần đây
            </h3>
            
            <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-gray-400">Đang tải...</div>
              ) : pointHistory.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {pointHistory.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="p-5 flex items-center justify-between hover:bg-white transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${item.points > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                          <Award size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{item.action || "Thu gom rác thải"}</p>
                          <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                      <p className={`font-black ${item.points > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {item.points > 0 ? '+' : ''}{item.points}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm italic">
                    <History size={32} className="text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-medium">Chưa có lịch sử giao dịch nào.</p>
                </div>
              )}
            </div>
            
            {!isEditing && (
              <div className="mt-8 bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Bạn có {totalPoints.toLocaleString()} điểm!</h3>
                    <p className="text-gray-400 text-sm">Sử dụng điểm của bạn để nhận những phần quà ý nghĩa từ Green Vietnam.</p>
                  </div>
                  <button className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 px-8 rounded-2xl transition-all whitespace-nowrap">
                    Đổi quà ngay <ArrowRight size={20} />
                  </button>
                </div>
                <Award className="absolute -bottom-10 -right-10 text-white/5 w-64 h-64 rotate-12" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
