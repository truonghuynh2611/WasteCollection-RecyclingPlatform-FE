import React, { useState, useEffect } from 'react';
import { getAllConfigs, updateConfig } from '../../api/config';
import toast from 'react-hot-toast';

const PointConfiguration = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await getAllConfigs();
      setConfigs(data || []);
    } catch (error) {
      toast.error('Lỗi khi tải cấu hình hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleValueChange = (key, newValue) => {
    setConfigs(configs.map(c => c.key === key ? { ...c, value: newValue } : c));
  };

  const handleSave = async (key, value) => {
    try {
      setSaving(true);
      await updateConfig(key, value);
      toast.success('Lưu cấu hình thành công!');
      fetchConfigs();
    } catch (error) {
      toast.error('Lỗi khi lưu cấu hình. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 transition-all duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="pb-4">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Cấu Hình Hệ Thống</h1>
          <p className="mt-2 text-slate-500 text-sm md:text-base">
            Quản lý các thông số cốt lõi và điểm thưởng của nền tảng EcoConnect.
          </p>
        </div>

        {/* Info Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 md:p-8 text-white shadow-lg shadow-emerald-200/50">
          <div className="relative z-10 flex flex-col md:flex-row gap-5 items-start md:items-center">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-wide">Điểm Thưởng Tích Lũy</h3>
              <p className="text-emerald-50 mt-1.5 leading-relaxed text-sm md:text-base max-w-2xl">
                Cấu hình số điểm mà người dân (Citizen) sẽ nhận được sau khi báo cáo thu gom rác thải được xử lý thành công. Khuyến khích người dùng tham gia bảo vệ môi trường bằng những phần thưởng xứng đáng.
              </p>
            </div>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-48 h-48 bg-teal-900/20 rounded-full blur-2xl"></div>
        </div>

        {/* Configuration Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-6 md:p-8">
            <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Thiết Lập Mức Điểm
            </h4>

            {configs.length === 0 ? (
              <div className="py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                <p className="text-slate-500">Hệ thống chưa có cấu hình nào được thiết lập.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {configs
                  .filter((config) => config.key === 'Points_CompletedReport')
                  .map((config) => (
                  <div key={config.key} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-base font-semibold text-slate-800">
                          Thưởng Hoàn Thành Báo Cáo
                        </h5>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                          Active
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">Mặc định, công dân sẽ nhận được số điểm này sau khi báo cáo thu gom của họ được nhân viên xác nhận hoàn thành.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <input
                          type="number"
                          value={config.value}
                          onChange={(e) => handleValueChange(config.key, e.target.value)}
                          className="w-32 pl-9 pr-12 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder-slate-400"
                          placeholder="0"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-slate-400 text-sm font-medium">điểm</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleSave(config.key, config.value)}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 shadow-sm"
                      >
                        {saving ? (
                          <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        Lưu
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-slate-50 border-t border-slate-100 p-4 sm:px-8">
            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Các thay đổi sẽ được lưu trữ an toàn trong hệ thống và có hiệu lực lập tức.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PointConfiguration;
