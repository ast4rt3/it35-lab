import React, { useState, useRef, useEffect } from 'react';
import {
  IonContent, IonPage, IonInput, IonButton, IonAlert, IonHeader, IonToolbar, IonTitle,
  IonBackButton, IonButtons, IonItem, IonText, IonCol, IonGrid,
  IonRow, IonInputPasswordToggle, IonImg, IonAvatar, IonSpinner, IonLabel,
} from '@ionic/react';
import { supabase } from '../utils/supabaseClient';
import { useHistory } from 'react-router-dom';

const EditAccount: React.FC = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: ''
  });
  const [currentEmail, setCurrentEmail] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertHeader, setAlertHeader] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const history = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setProfileNotFound(false);
      try {
        // First check if we have a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error('No valid session found:', sessionError);
          history.push('/it35-lab');
          return;
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user || !user.id) {
          console.error('Authentication error or user not found:', authError);
          history.push('/it35-lab');
          return;
        }

        setCurrentEmail(user.email || 'No email found');

        // Modified query with proper headers and format
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('username, user_firstname, user_lastname, user_avatar_url')
          .eq('id', user.id)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          if (userError.code === 'PGRST116') {
            setProfileNotFound(true);
          } else {
            setAlertHeader('Profile Error');
            setAlertMessage('Could not load profile data. Please try again later.');
            setShowAlert(true);
          }
          setIsLoading(false);
          return;
        }

        if (!userData) {
          console.error('No user data found');
          setProfileNotFound(true);
          setIsLoading(false);
          return;
        }

        setFormData(prev => ({
          ...prev,
          firstName: userData.user_firstname || '',
          lastName: userData.user_lastname || '',
          username: userData.username || ''
        }));
        setAvatarPreview(userData.user_avatar_url);

      } catch (error: any) {
        console.error('Error in fetchUserData:', error);
        setAlertHeader('Loading Error');
        setAlertMessage(error.message || 'Failed to load profile data. Please try again later.');
        setShowAlert(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [history]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setAlertHeader('File Error');
        setAlertMessage('Please select an image file (JPEG, PNG, GIF, WebP).');
        setShowAlert(true);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setAlertHeader('File Error');
        setAlertMessage('Image size must be less than 5MB.');
        setShowAlert(true);
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      throw new Error(`Failed to upload avatar: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(filePath);

    if (!data || !data.publicUrl) {
      console.warn('Could not get public URL for avatar');
      return null;
    }

    return `${data.publicUrl}?t=${new Date().getTime()}`;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdate = async () => {
    if (formData.password && formData.password.length < 6) {
      setAlertHeader('Validation Error');
      setAlertMessage("New password must be at least 6 characters long.");
      setShowAlert(true);
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setAlertHeader('Validation Error');
      setAlertMessage("New passwords don't match.");
      setShowAlert(true);
      return;
    }

    if (!formData.currentPassword) {
      setAlertHeader('Verification Required');
      setAlertMessage("Please enter your current password to save changes.");
      setShowAlert(true);
      return;
    }

    setIsUpdating(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user || !user.id || !user.email) {
        throw new Error(authError?.message || 'User session invalid. Please log in again.');
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: formData.currentPassword,
      });

      if (signInError) {
        throw new Error('Incorrect current password.');
      }

      let newAvatarUrl: string | null | undefined = undefined;
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar(avatarFile, user.id);
      }

      const updates: { [key: string]: any } = {
        username: formData.username,
        user_firstname: formData.firstName,
        user_lastname: formData.lastName,
        updated_at: new Date().toISOString(),
      };

      if (newAvatarUrl !== undefined) {
        updates.user_avatar_url = newAvatarUrl;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (updateError) {
        throw new Error(`Failed to update profile details: ${updateError.message}`);
      }

      if (formData.password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.password,
        });

        if (passwordError) {
          throw new Error(`Failed to update password: ${passwordError.message}`);
        }
      }

      setAlertHeader('Success');
      setAlertMessage('Profile updated successfully!');
      setShowAlert(true);

      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        password: '',
        confirmPassword: ''
      }));
      setAvatarFile(null);

    } catch (error: any) {
      console.error('Error during profile update:', error);
      setAlertHeader('Update Error');
      setAlertMessage(error.message || 'An unexpected error occurred.');
      setShowAlert(true);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/it35-lab/app" />
            </IonButtons>
            <IonTitle>Edit Account</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding ion-text-center" fullscreen>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IonSpinner name="crescent" style={{ transform: 'scale(1.5)', marginBottom: '20px' }} />
            <p>Loading profile data...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Add a new component for when profile is not found
  const ProfileNotFound = () => (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/it35-lab/app" />
          </IonButtons>
          <IonTitle>Profile Not Found</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          textAlign: 'center',
          padding: '20px'
        }}>
          <IonText color="medium" style={{ marginBottom: '20px' }}>
            <h2>Profile Not Found</h2>
            <p>It seems your profile hasn't been set up yet. Would you like to set up your profile now?</p>
          </IonText>
          <IonButton
            expand="block"
            onClick={() => history.push('/it35-lab/app/profile-setup')}
            style={{ maxWidth: '300px' }}
          >
            Set Up Profile
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );

  // Show ProfileNotFound component if there's an error or no user data
  if (showAlert && (alertHeader === 'Profile Error' || alertHeader === 'Loading Error')) {
    return <ProfileNotFound />;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/it35-lab/app" />
          </IonButtons>
          <IonTitle>Edit Account</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow className="ion-justify-content-center ion-align-items-center ion-margin-bottom">
            <IonCol size="12" size-sm="8" size-md="6" className="ion-text-center">
              <IonAvatar
                style={{
                  width: '120px',
                  height: '120px',
                  margin: '0 auto 15px auto',
                  border: '3px solid var(--ion-color-light-shade, #f4f5f8)'
                }}
              >
                {avatarPreview ? (
                  <IonImg src={avatarPreview} alt="User Avatar" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'var(--ion-color-light, #f4f5f8)', borderRadius: '50%'
                  }}>
                    <IonText color="medium" style={{ fontSize: '0.8em' }}>No Avatar</IonText>
                  </div>
                )}
              </IonAvatar>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/png, image/jpeg, image/gif, image/webp"
                onChange={handleAvatarChange}
              />

              <IonButton
                size="small"
                fill="outline"
                onClick={triggerFileInput}
              >
                {avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
              </IonButton>
            </IonCol>
          </IonRow>

          <IonRow className="ion-justify-content-center">
            <IonCol size="12" size-sm="10" size-md="8">
              <IonItem lines="none" style={{ marginBottom: '15px' }}>
                <IonLabel position="stacked" color="medium">Email</IonLabel>
                <IonInput
                  type="email"
                  value={currentEmail}
                  readonly={true}
                  style={{ color: 'var(--ion-color-medium)', '--padding-top': '8px' }}
                />
              </IonItem>

              <IonItem lines="none" style={{ marginBottom: '15px' }}>
                <IonLabel position="stacked" color="medium">Username</IonLabel>
                <IonInput
                  type="text"
                  placeholder="Enter username"
                  value={formData.username}
                  onIonChange={(e) => handleInputChange('username', e.detail.value!)}
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow className="ion-justify-content-center">
            <IonCol size="12" size-sm="5" size-md="4">
              <IonItem lines="none" style={{ marginBottom: '15px' }}>
                <IonLabel position="stacked" color="medium">First Name</IonLabel>
                <IonInput
                  type="text"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onIonChange={(e) => handleInputChange('firstName', e.detail.value!)}
                />
              </IonItem>
            </IonCol>
            <IonCol size="12" size-sm="5" size-md="4">
              <IonItem lines="none" style={{ marginBottom: '15px' }}>
                <IonLabel position="stacked" color="medium">Last Name</IonLabel>
                <IonInput
                  type="text"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onIonChange={(e) => handleInputChange('lastName', e.detail.value!)}
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow className="ion-justify-content-center">
            <IonCol size="12" size-sm="10" size-md="8">
              <IonText color="dark">
                <h3 style={{ marginBottom: '15px', fontSize: '1.1em', fontWeight: '600' }}>Change Password (Optional)</h3>
              </IonText>

              <IonItem lines="none" style={{ marginBottom: '15px' }}>
                <IonLabel position="stacked" color="medium">New Password</IonLabel>
                <IonInput
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={formData.password}
                  onIonChange={(e) => handleInputChange('password', e.detail.value!)}
                >
                  <IonInputPasswordToggle slot="end" />
                </IonInput>
              </IonItem>

              <IonItem lines="none" style={{ marginBottom: '15px' }}>
                <IonLabel position="stacked" color="medium">Confirm New Password</IonLabel>
                <IonInput
                  type="password"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onIonChange={(e) => handleInputChange('confirmPassword', e.detail.value!)}
                  disabled={!formData.password}
                >
                  <IonInputPasswordToggle slot="end" />
                </IonInput>
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow className="ion-justify-content-center">
            <IonCol size="12" size-sm="10" size-md="8">
              <IonText color="dark">
                <h3 style={{ marginBottom: '15px', fontSize: '1.1em', fontWeight: '600' }}>Verify Changes</h3>
              </IonText>
              <IonItem lines="none" style={{ marginBottom: '25px' }}>
                <IonLabel position="stacked" color="medium">Current Password *</IonLabel>
                <IonInput
                  type="password"
                  placeholder="Enter current password to save"
                  value={formData.currentPassword}
                  onIonChange={(e) => handleInputChange('currentPassword', e.detail.value!)}
                  required
                >
                  <IonInputPasswordToggle slot="end" />
                </IonInput>
                <IonText color="medium" style={{fontSize: '0.8em', marginTop: '5px'}}>* Required to save any changes</IonText>
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow className="ion-justify-content-center">
            <IonCol size="12" size-sm="10" size-md="8">
              <IonButton
                expand="block"
                onClick={handleUpdate}
                disabled={isUpdating || !formData.currentPassword}
                style={{ '--border-radius': '8px' }}
              >
                {isUpdating ? <IonSpinner name="dots" /> : 'Update Account'}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={alertHeader}
        message={alertMessage}
        buttons={['OK']}
      />
    </IonPage>
  );
};

export default EditAccount;