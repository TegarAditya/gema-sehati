import { useState } from 'react';
import React from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSupabaseQuery, mutate } from '../lib/swrHooks';
import { userScopedKeys } from '../lib/swrKeys';
import { User } from 'lucide-react';

export function Profile() {
  const { user } = useAuth();
  
  // SWR query for user profile
  const { data: profileData } = useSupabaseQuery(
    user ? userScopedKeys(user.id).USER_PROFILE : null,
    async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();
      return data;
    }
  );

  const [profileName, setProfileName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Initialize profile name from SWR data
  React.useEffect(() => {
    if (profileData?.full_name) {
      setProfileName(profileData.full_name);
    } else if (user?.user_metadata?.full_name) {
      setProfileName(user.user_metadata.full_name);
    }
  }, [profileData, user]);

  const handleUpdateProfile = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    if (!user) return;

    const trimmedName = profileName.trim();
    if (!trimmedName) {
      setProfileError('Nama tidak boleh kosong');
      setProfileSuccess('');
      return;
    }

    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const { error: profileUpdateError } = await supabase
        .from('user_profiles')
        .update({ full_name: trimmedName })
        .eq('id', user.id);

      if (profileUpdateError) throw profileUpdateError;

      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          full_name: trimmedName,
        },
      });

      if (authUpdateError) throw authUpdateError;

      // Invalidate profile cache so fresh data is fetched on next SWR revalidation
      await mutate(userScopedKeys(user.id).USER_PROFILE);

      setProfileSuccess('Informasi akun berhasil diperbarui');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui informasi akun';
      setProfileError(message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    if (!user || !user.email) return;

    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Semua field password harus diisi');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password baru tidak sama');
      return;
    }

    setPasswordLoading(true);

    try {
      const { data: verifiedUser, error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError || !verifiedUser.user || verifiedUser.user.id !== user.id) {
        setPasswordError('Password lama tidak sesuai');
        setPasswordLoading(false);
        return;
      }

      const { error: updatePasswordError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updatePasswordError) {
        throw updatePasswordError;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Password berhasil diperbarui');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui password';
      setPasswordError(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-7 h-7 text-blue-600" />
            Profil Saya
        </h2>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-gray-900">Informasi Akun</h3>

        <form onSubmit={handleUpdateProfile} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              className="w-full px-4 py-2 border border-gray-200 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed outline-none"
              disabled
            />
          </div>
          {profileError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {profileError}
            </div>
          )}
          {profileSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
              {profileSuccess}
            </div>
          )}
          <button
            type="submit"
            disabled={profileLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {profileLoading ? 'Menyimpan...' : 'Simpan Informasi'}
          </button>
        </form>

        <form onSubmit={handleChangePassword} className="space-y-3 border-t border-gray-100 pt-6">
          <h4 className="font-semibold text-gray-900">Ubah Password</h4>
          <input
            type="password"
            placeholder="Password lama"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password baru (minimal 6 karakter)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            minLength={6}
            required
          />
          <input
            type="password"
            placeholder="Konfirmasi password baru"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            minLength={6}
            required
          />
          {passwordError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
              {passwordSuccess}
            </div>
          )}
          <button
            type="submit"
            disabled={passwordLoading}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {passwordLoading ? 'Memproses...' : 'Ubah Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
