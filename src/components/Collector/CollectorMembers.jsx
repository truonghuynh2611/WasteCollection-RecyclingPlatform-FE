import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getAllCollectors, getAllTeams } from "../../api/team";
import { Users, Crown, Star, Phone, Mail, Shield } from "lucide-react";

export default function CollectorMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [teamInfo, setTeamInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState("Member");

  useEffect(() => {
    fetchMembers();
  }, [user]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const [collectorsRes, teamsRes] = await Promise.all([
        getAllCollectors(),
        getAllTeams(),
      ]);

      const allCollectors = collectorsRes.success ? collectorsRes.data : [];
      const allTeams = teamsRes.success ? teamsRes.data : [];

      // Find the current user's collector profile
      const myCollector = allCollectors.find(
        (c) => c.collectorId === user?.collectorId || c.userId === user?.id
      );

      if (myCollector) {
        setMyRole(myCollector.role === "Leader" ? "Leader" : "Member");
        const myTeamId = myCollector.teamId;

        // Get the team info
        const team = allTeams.find((t) => t.teamId === myTeamId);
        setTeamInfo(team);

        // Filter all collectors in the same team
        const teamMembers = allCollectors.filter(
          (c) => c.teamId === myTeamId
        );
        setMembers(teamMembers);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách thành viên:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
            Thành viên đội
          </h1>
          <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">
            {teamInfo ? teamInfo.name : "Đội của bạn"} •{" "}
            <span className="text-emerald-600">{members.length} người</span>
          </p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
          <Users className="w-6 h-6 text-emerald-600" />
        </div>
      </div>

      {/* TEAM BANNER */}
      {teamInfo && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-3xl p-6 mb-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-10 w-24 h-24 rounded-full bg-white/5 translate-y-1/2" />
          <div className="relative">
            <p className="text-emerald-100 text-xs font-black uppercase tracking-widest mb-1">
              Đội thu gom
            </p>
            <h2 className="text-2xl font-black">{teamInfo.name}</h2>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-bold">{members.length} thành viên</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-bold">
                  Bạn là: {myRole === "Leader" ? "Trưởng nhóm" : "Thành viên"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEMBER GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-56 bg-white rounded-3xl border border-gray-100" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 text-gray-300">
            <Users className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">
            Chưa có thành viên
          </h3>
          <p className="text-sm text-gray-400 mt-2">Đội của bạn chưa có ai được gán vào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {members.map((member) => {
            const isLeader = member.role === "Leader";
            const isMe = member.collectorId === user?.collectorId || member.userId === user?.id;
            return (
              <div
                key={member.collectorId}
                className={`bg-white rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col relative group overflow-hidden ${
                  isMe ? "border-emerald-200 ring-2 ring-emerald-100" : "border-gray-100"
                }`}
              >
                {/* "Bạn" badge */}
                {isMe && (
                  <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                    Bạn
                  </span>
                )}

                {/* Avatar */}
                <div className="flex flex-col items-center mb-5">
                  <div className="relative mb-3">
                    <div
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg transition-transform group-hover:scale-105 ${
                        isLeader
                          ? "bg-gradient-to-br from-amber-400 to-orange-500"
                          : "bg-gradient-to-br from-emerald-400 to-teal-600"
                      }`}
                    >
                      {(member.fullName || "?").charAt(0).toUpperCase()}
                    </div>
                    {isLeader && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                        <Crown className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-black text-gray-800 text-center text-sm">
                    {member.fullName || "Chưa có tên"}
                  </h3>
                  <span
                    className={`mt-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full ${
                      isLeader
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {isLeader ? "Trưởng nhóm" : "Thành viên"}
                  </span>
                </div>

                {/* Info rows */}
                <div className="space-y-2.5 bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate font-medium">{member.email || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-medium">{member.phone || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-medium">Đánh giá: {member.rating || 4.5} / 5</span>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${member.status ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-gray-300"}`} />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {member.status ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
