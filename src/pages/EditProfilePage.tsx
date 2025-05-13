import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonImg,
  IonSpinner,
  IonAlert,
  IonAvatar,
  IonIcon,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonModal,
} from '@ionic/react';
import { cameraOutline, mailOutline, personOutline, saveOutline, lockClosedOutline } from 'ionicons/icons';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import './EditProfilePage.css';

const EditProfilePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    user_firstname: '',
    user_lastname: '',
    user_avatar_url: null as string | null,
    email: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    console.log('EditProfilePage mounted, authLoading:', authLoading, 'user:', user);
    if (!authLoading) {
      if (user) {
        fetchUserData();
      } else {
        console.log('No user found, setting loading to false');
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data for:', user?.id);
      setLoading(true);
      setProfileNotFound(false);
      setError(null);

      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      console.log('User fetch result:', { existingUser, fetchError });

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          console.log('User not found, creating new user');
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: user?.id,
                email: user?.email,
                username: user?.email?.split('@')[0] || 'user',
                user_firstname: '',
                user_lastname: '',
                user_avatar_url: null
              }
            ]);

          if (insertError) {
            console.error('Error creating user:', insertError);
            throw insertError;
          }

          console.log('New user created successfully');
          setFormData({
            username: user?.email?.split('@')[0] || 'user',
            user_firstname: '',
            user_lastname: '',
            user_avatar_url: null,
            email: user?.email || ''
          });
        } else {
          console.error('Error fetching user:', fetchError);
          throw fetchError;
        }
      } else if (existingUser) {
        console.log('Existing user found:', existingUser);
        setFormData({
          username: existingUser.username || '',
          user_firstname: existingUser.user_firstname || '',
          user_lastname: existingUser.user_lastname || '',
          user_avatar_url: existingUser.user_avatar_url,
          email: existingUser.email || user?.email || ''
        });
        if (existingUser.user_avatar_url) {
          setAvatarPreview(existingUser.user_avatar_url);
        }
      }
    } catch (err) {
      console.error('Error in fetchUserData:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const verifyPassword = async () => {
    if (!user?.email) return;
    
    try {
      setPasswordError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password
      });

      if (error) {
        setPasswordError('Incorrect password. Please try again.');
        return false;
      }

      setShowPasswordModal(false);
      setPassword('');
      return true;
    } catch (err) {
      console.error('Error verifying password:', err);
      setPasswordError('An error occurred. Please try again.');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Show password verification modal
    setShowPasswordModal(true);
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      let avatarUrl = formData.user_avatar_url;

      if (avatarFile) {
        try {
          // Validate file size (max 5MB)
          if (avatarFile.size > 5 * 1024 * 1024) {
            throw new Error('File size must be less than 5MB');
          }

          // Validate file type
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
          if (!allowedTypes.includes(avatarFile.type)) {
            throw new Error('Only JPEG, PNG and GIF images are allowed');
          }

          const fileExt = avatarFile.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;
          const filePath = `public/${fileName}`; // Add public folder to path

          console.log('Attempting to upload file:', {
            bucket: 'user-avatars',
            path: filePath,
            fileType: avatarFile.type,
            fileSize: avatarFile.size
          });

          // Upload file
          const { error: uploadError, data } = await supabase.storage
            .from('user-avatars')
            .upload(filePath, avatarFile, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadError) {
            console.error('Upload error details:', {
              error: uploadError,
              message: uploadError.message,
              name: uploadError.name
            });
            throw new Error(uploadError.message || 'Failed to upload avatar');
          }

          console.log('File uploaded successfully:', data);

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('user-avatars')
            .getPublicUrl(filePath);

          console.log('Generated public URL:', publicUrl);
          avatarUrl = publicUrl;
        } catch (uploadErr) {
          console.error('Avatar upload error:', uploadErr);
          throw new Error(uploadErr instanceof Error ? uploadErr.message : 'Failed to upload avatar');
        }
      }

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          email: formData.email,
          username: formData.username,
          user_firstname: formData.user_firstname,
          user_lastname: formData.user_lastname,
          user_avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      setSuccess('Profile updated successfully!');
      setAvatarFile(null);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Profile Settings</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Loading profile...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Profile Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {error && (
          <IonAlert
            isOpen={!!error}
            onDidDismiss={() => setError(null)}
            header="Error"
            message={error}
            buttons={['OK']}
          />
        )}

        {success && (
          <IonAlert
            isOpen={!!success}
            onDidDismiss={() => setSuccess(null)}
            header="Success"
            message={success}
            buttons={['OK']}
          />
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <IonCard className="profile-card">
            <IonCardContent>
              <div className="avatar-section">
                <IonAvatar className="profile-avatar">
                  {avatarPreview ? (
                    <IonImg src={avatarPreview} alt="Profile" />
                  ) : (
                    <div className="avatar-placeholder">
                      <IonIcon icon={personOutline} />
                    </div>
                  )}
                </IonAvatar>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload" className="avatar-upload-label">
                  <IonIcon icon={cameraOutline} />
                  Change Photo
                </label>
              </div>

              <IonGrid>
                <IonRow>
                  <IonCol size="12" sizeMd="6">
                    <IonItem className="custom-input">
                      <IonLabel position="stacked">
                        <IonIcon icon={personOutline} />
                        Username
                      </IonLabel>
                      <IonInput
                        value={formData.username}
                        onIonChange={e => handleInputChange('username', e.detail.value!)}
                        required
                      />
                    </IonItem>
                  </IonCol>
                  <IonCol size="12" sizeMd="6">
                    <IonItem className="custom-input">
                      <IonLabel position="stacked">
                        <IonIcon icon={mailOutline} />
                        Email
                      </IonLabel>
                      <IonInput
                        type="email"
                        value={formData.email}
                        onIonChange={e => handleInputChange('email', e.detail.value!)}
                        required
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="12" sizeMd="6">
                    <IonItem className="custom-input">
                      <IonLabel position="stacked">
                        <IonIcon icon={personOutline} />
                        First Name
                      </IonLabel>
                      <IonInput
                        value={formData.user_firstname}
                        onIonChange={e => handleInputChange('user_firstname', e.detail.value!)}
                      />
                    </IonItem>
                  </IonCol>
                  <IonCol size="12" sizeMd="6">
                    <IonItem className="custom-input">
                      <IonLabel position="stacked">
                        <IonIcon icon={personOutline} />
                        Last Name
                      </IonLabel>
                      <IonInput
                        value={formData.user_lastname}
                        onIonChange={e => handleInputChange('user_lastname', e.detail.value!)}
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>

              <div className="save-button-container">
                <IonButton
                  expand="block"
                  type="submit"
                  disabled={saving}
                  className="save-button"
                >
                  <IonIcon icon={saveOutline} slot="start" />
                  {saving ? <IonSpinner name="crescent" /> : 'Save Changes'}
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </form>

        {/* Password Verification Modal */}
        <IonModal isOpen={showPasswordModal} onDidDismiss={() => setShowPasswordModal(false)}>
          <IonContent className="ion-padding">
            <div className="password-modal-content">
              <IonIcon icon={lockClosedOutline} className="password-icon" />
              <h2>Verify Your Password</h2>
              <p>Please enter your password to save changes</p>
              
              <IonItem className="custom-input">
                <IonLabel position="stacked">
                  <IonIcon icon={lockClosedOutline} />
                  Password
                </IonLabel>
                <IonInput
                  type="password"
                  value={password}
                  onIonChange={e => setPassword(e.detail.value!)}
                  required
                />
              </IonItem>

              {passwordError && (
                <IonText color="danger" className="password-error">
                  {passwordError}
                </IonText>
              )}

              <div className="password-modal-buttons">
                <IonButton
                  fill="outline"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </IonButton>
                <IonButton
                  onClick={async () => {
                    const verified = await verifyPassword();
                    if (verified) {
                      handleSaveChanges();
                    }
                  }}
                >
                  Verify & Save
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default EditProfilePage;