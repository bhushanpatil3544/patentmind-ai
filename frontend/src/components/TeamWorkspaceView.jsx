import React, { useState } from 'react';
import { Users, UserPlus, Shield, CheckCircle2, Mail, MoreHorizontal, Sparkles } from 'lucide-react';

export default function TeamWorkspaceView() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Patent Attorney');

  const members = [
    { name: 'Bhushan Patil', email: 'bhushan@patentmind.ai', role: 'Enterprise Admin', status: 'ACTIVE', avatar: '' },
    { name: 'Dr. Aris Thorne', email: 'aris.t@patentmind.ai', role: 'Lead Patent Attorney', status: 'ACTIVE', avatar: 'AT' },
    { name: 'Elena Rostova', email: 'elena.r@patentmind.ai', role: 'Senior AI Researcher', status: 'ACTIVE', avatar: 'ER' },
    { name: 'Marcus Vance', email: 'marcus.v@patentmind.ai', role: 'IP Analyst', status: 'INVITED', avatar: 'MV' }
  ];

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B7CFA]/10 border border-[#5B7CFA]/30 text-[#00C2FF] text-xs font-mono uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Collaborative Enterprise Seat Management</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
            Team Workspace
          </h1>
          <p className="text-sm text-slate-300 font-sans mt-1">
            Manage organization members, assign role permissions, and collaborate on patent dossiers.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="btn-theme px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Seat Meter Banner */}
      <div className="wrangler-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-[#5B7CFA]/10 to-[#00C2FF]/10">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white font-heading">Enterprise Organization License</h4>
          <p className="text-xs text-slate-300 font-sans">
            4 of 10 Team Seats Allocated (6 Seats Remaining)
          </p>
        </div>
        <div className="w-full md:w-64 h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#5B7CFA] to-[#00C2FF]" style={{ width: '40%' }}></div>
        </div>
      </div>

      {/* Members Table */}
      <div className="wrangler-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white font-heading">Active Members</h3>
        <div className="divide-y divide-white/5">
          {members.map((m, idx) => (
            <div key={idx} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#5B7CFA] to-[#00C2FF] flex items-center justify-center text-white font-bold text-xs font-mono shadow-md">
                  {m.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-heading">{m.name}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">{m.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-xs font-mono text-[#00C2FF] bg-[#5B7CFA]/10 px-3 py-1 rounded-full border border-[#5B7CFA]/30">
                  {m.role}
                </span>
                <span className={`text-[10px] font-mono font-bold ${m.status === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#050816] border border-white/10 wrangler-card p-6 md:p-8 max-w-md w-full space-y-5 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase text-white font-bold flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#00C2FF]" />
                INVITE TEAM MEMBER
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white font-mono text-xs"></button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <label className="text-slate-400 font-mono block mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00C2FF]"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono block mb-1">Role Permissions</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-[#050816] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00C2FF]"
                >
                  <option value="Patent Attorney">Lead Patent Attorney</option>
                  <option value="Senior AI Researcher">Senior AI Researcher</option>
                  <option value="IP Analyst">IP Analyst</option>
                  <option value="Viewer">Read-Only Viewer</option>
                </select>
              </div>

              <button
                onClick={() => {
                  alert(`Invitation sent to ${inviteEmail || 'colleague'} as ${inviteRole}`);
                  setShowInviteModal(false);
                }}
                className="w-full py-3 btn-theme font-semibold text-xs rounded-xl mt-2"
              >
                SEND INVITATION EMAIL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
