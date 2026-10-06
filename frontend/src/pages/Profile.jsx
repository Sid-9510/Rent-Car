import React, { useEffect, useState } from 'react';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatters';

const Profile = () => {
  const { updateUserState, showToast } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    drivingLicenseNumber: '',
  });

  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getProfile();
        setProfile(data);
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          drivingLicenseNumber: data.drivingLicenseNumber || '',
        });
      } catch (err) {
        showToast(err.friendlyMessage || 'Failed to load profile.', 'danger');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [showToast]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const updated = await userService.updateProfile(formData);
      setProfile(updated);
      updateUserState(updated);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to update profile.', 'danger');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwdData.newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'warning');
      return;
    }
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      showToast('New password and confirmation do not match.', 'warning');
      return;
    }
    try {
      setSavingPassword(true);
      await userService.changePassword(pwdData);
      setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully!', 'success');
    } catch (err) {
      showToast(err.friendlyMessage || 'Could not change password.', 'danger');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your profile..." />;
  }

  return (
    <div className="container py-5">
      <div className="row g-4">
        {/* LEFT PROFILE SUMMARY CARD */}
        <div className="col-lg-4">
          <div className="rc-card p-4 text-center">
            <div
              className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3 fw-bold fs-2"
              style={{ width: '80px', height: '80px' }}
            >
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h4 className="fw-bold mb-1">{profile?.name}</h4>
            <p className="text-muted small mb-2">{profile?.email}</p>
            <span className="badge bg-primary-subtle text-primary px-3 py-1 rounded-pill">
              {profile?.role}
            </span>

            <hr className="my-4" />

            <div className="text-start small d-flex flex-column gap-2">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Phone:</span>
                <span className="fw-medium">{profile?.phone || '—'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Driving License:</span>
                <span className="fw-medium">{profile?.drivingLicenseNumber || 'Not set'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Account Status:</span>
                <span className="badge bg-success-subtle text-success">{profile?.status}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Member Since:</span>
                <span className="fw-medium">{formatDate(profile?.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT FORMS */}
        <div className="col-lg-8">
          {/* EDIT PROFILE */}
          <div className="rc-card p-4 mb-4">
            <h5 className="fw-bold mb-3 pb-2 border-bottom">
              <i className="bi bi-person-lines-fill text-primary me-2"></i>Edit Profile
            </h5>
            <form onSubmit={handleProfileSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Email (Read-only)</label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    value={profile?.email || ''}
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Driving License Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. GJ01-20210045678"
                    value={formData.drivingLicenseNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, drivingLicenseNumber: e.target.value })
                    }
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Residential Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Street, Area, City, State"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-3 text-end">
                <button type="submit" className="btn btn-rc-primary" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* CHANGE PASSWORD */}
          <div className="rc-card p-4">
            <h5 className="fw-bold mb-3 pb-2 border-bottom">
              <i className="bi bi-shield-lock-fill text-primary me-2"></i>Change Password
            </h5>
            <form onSubmit={handlePasswordSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={pwdData.currentPassword}
                    onChange={(e) => setPwdData({ ...pwdData, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Min 6 characters"
                    value={pwdData.newPassword}
                    onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={pwdData.confirmPassword}
                    onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="mt-3 text-end">
                <button type="submit" className="btn btn-outline-primary" disabled={savingPassword}>
                  {savingPassword ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
