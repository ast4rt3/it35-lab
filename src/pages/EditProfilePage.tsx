import React, { useState, useRef, useEffect } from 'react';
import {
  IonContent, IonPage, IonInput, IonButton, IonAlert, IonHeader, IonToolbar, IonTitle, // Added Toolbar and Title
  IonBackButton, IonButtons, IonItem, IonText, IonCol, IonGrid,
  IonRow, IonInputPasswordToggle, IonImg, IonAvatar, IonSpinner, IonLabel, // Added IonLabel for inputs
} from '@ionic/react';
import { supabase } from '../utils/supabaseClient';
import { useHistory } from 'react-router-dom';


const EditAccount: React.FC = () => {
  const [formData, setFormData] = useState({
    // Email is fetched but generally not editable directly via profile form
    // email: '',
    currentPassword: '',
    password: '',          // New password
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: ''
  });
  const [currentEmail, setCurrentEmail] = useState(''); // To display non-editable email
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null); // Holds URL or local blob URL
  const [showAlert, setShowAlert] = useState(false);
  const [alertHeader, setAlertHeader] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Start loading initially
  const [isUpdating, setIsUpdating] = useState(false);
  const history = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Fetch User Data ---
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // 1. Get the currently authenticated user from Supabase Auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user || !user.id) {
           // If no user, redirect to login immediately
           console.error('Authentication error or user not found:', authError);
           history.push('/it35-lab'); // Adjust login route if different
           return; // Stop execution
        }
         console.log('Authenticated User ID:', user.id);
         setCurrentEmail(user.email || 'No email found'); // Store email for display

        // 2. Fetch profile data from the custom 'users' table using the user's ID
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('username, user_firstname, user_lastname, user_avatar_url') // Select only needed fields
          .eq('id', user.id) // **Query using the user's unique ID (FK to auth.users.id)**
          .single(); // Expect exactly one row, throws error if 0 or >1

        if (userError) {
           // Handle case where user exists in auth but not in users table (shouldn't happen with correct registration)
           console.error('Error fetching user data from users table:', userError);
           if (userError.code === 'PGRST116') { // Code for 'JWSError JWSInvalidSignature' often means 0 rows found with .single()
                setAlertHeader('Profile Error');
                setAlertMessage('Could not find profile data. Please contact support.');
                setShowAlert(true);
           } else {
               throw userError; // Rethrow other Supabase errors
           }
           // Keep loading indicator or show specific error state? For now, stop loading.
           setIsLoading(false);
           return;
        }

        // 3. Populate form state with fetched data
        setFormData(prev => ({
          ...prev, // Keep password fields empty initially
          firstName: userData.user_firstname || '', // Use fetched data or default to empty string
          lastName: userData.user_lastname || '',
          username: userData.username || ''
        }));
        setAvatarPreview(userData.user_avatar_url); // Set current avatar URL

      } catch (error: any) {
        console.error('Error in fetchUserData:', error);
        setAlertHeader('Loading Error');
        setAlertMessage(error.message || 'Failed to load profile data.');
        setShowAlert(true);
         // Maybe redirect if it's an auth error? Handled partially above.
      } finally {
        setIsLoading(false); // Stop loading indicator
      }
    };

    fetchUserData();
    // Disable ESLint warning about history dependency if needed, but it's generally safe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]); // Rerun if history object changes (rare)

  // --- Avatar Handling ---
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setAlertHeader('File Error');
        setAlertMessage('Please select an image file (JPEG, PNG, GIF, WebP).');
        setShowAlert(true);
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setAlertHeader('File Error');
        setAlertMessage('Image size must be less than 5MB.');
        setShowAlert(true);
        return;
      }
      setAvatarFile(file); // Store the File object for upload
      setAvatarPreview(URL.createObjectURL(file)); // Show local preview immediately
    }
  };

  const triggerFileInput = () => {
      // Optional: Add Capacitor Camera integration here for native apps
      fileInputRef.current?.click();
  };

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`; // Include user ID for better organization
    const filePath = `public/${fileName}`; // Store in a 'public' subfolder within the bucket

    console.log(`Uploading avatar to: user-avatars/${filePath}`);

    const { error: uploadError } = await supabase.storage
      .from('user-avatars') // Ensure this bucket name is correct and RLS allows uploads
      .upload(filePath, file, {
        cacheControl: '3600', // Cache for 1 hour
        upsert: true,        // Overwrite if file with same name exists (useful for retries)
      });

    if (uploadError) {
       console.error('Avatar upload error:', uploadError);
       throw new Error(`Failed to upload avatar: ${uploadError.message}`);
    }

    // Get the public URL (ensure your bucket is configured for public access if needed)
     const { data } = supabase.storage
       .from('user-avatars')
       .getPublicUrl(filePath);

     console.log('Avatar public URL data:', data);

     if (!data || !data.publicUrl) {
        console.warn('Could not get public URL for avatar, might be accessible via signed URL only.');
        // Decide how to handle this - maybe return the filePath instead? Or throw error?
        // For simplicity here, return null or the path. Ensure your RLS/display logic handles this.
        return null; // Or return filePath;
     }

    // Add timestamp query param to bypass browser cache after update
     return `${data.publicUrl}?t=${new Date().getTime()}`;
  };

  // --- Input Change Handler ---
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // --- Update Profile ---
  const handleUpdate = async () => {
    // Basic Password validation
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
    // Require current password only if the user is trying to change the password OR other sensitive info (optional)
    // For simplicity here, require current password for ANY update.
    if (!formData.currentPassword) {
      setAlertHeader('Verification Required');
      setAlertMessage("Please enter your current password to save changes.");
      setShowAlert(true);
      return;
    }

    setIsUpdating(true);

    try {
      // 1. Get user again to ensure session is valid and get ID/email
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user || !user.id || !user.email) {
        throw new Error(authError?.message || 'User session invalid. Please log in again.');
      }
      const userId = user.id;
      const userEmail = user.email;

      // 2. Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail, // Use the fetched email
        password: formData.currentPassword,
      });

      if (signInError) {
         // Don't reveal if the email or password was specifically wrong for security
         console.error("Password verification failed:", signInError);
         throw new Error('Incorrect current password.');
      }
       console.log("Current password verified successfully.");


      // 3. Upload new avatar if one was selected
      let newAvatarUrl: string | null | undefined = undefined; // Use undefined to signify no change intended initially
      if (avatarFile) {
        console.log("Attempting to upload new avatar...");
        newAvatarUrl = await uploadAvatar(avatarFile, userId); // Pass userId for filename
        console.log("New avatar URL:", newAvatarUrl); // Will be null if public URL failed
      }

      // 4. Prepare data for the 'users' table update
      const updates: { [key: string]: any } = {
        username: formData.username,
        user_firstname: formData.firstName,
        user_lastname: formData.lastName,
        updated_at: new Date().toISOString(), // Track last update time
      };
      // Only include avatar URL in updates if it was successfully uploaded/changed
       if (newAvatarUrl !== undefined) { // Check if an upload was attempted (could be null or a URL string)
            updates.user_avatar_url = newAvatarUrl;
        }


      // 5. Update the 'users' table
      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId); // **Update using the user's unique ID**

      if (updateError) {
        console.error("Error updating users table:", updateError);
        throw new Error(`Failed to update profile details: ${updateError.message}`);
      }
       console.log("User profile details updated in 'users' table.");


      // 6. Update password in Supabase Auth IF a new password was provided
      if (formData.password) {
        console.log("Attempting to update password in Auth...");
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.password,
        });

        if (passwordError) {
            console.error("Error updating password in Auth:", passwordError);
            // Provide specific feedback if possible, e.g., password complexity requirements
            if (passwordError.message.includes("Password should be at least 6 characters")) {
                 throw new Error('New password does not meet complexity requirements.');
            } else {
                throw new Error(`Failed to update password: ${passwordError.message}`);
            }
        }
         console.log("Password updated successfully in Auth.");
      }

      // 7. Success!
      setAlertHeader('Success');
      setAlertMessage('Profile updated successfully!');
      setShowAlert(true);

       // Clear password fields after successful update
      setFormData(prev => ({
           ...prev,
           currentPassword: '',
           password: '',
           confirmPassword: ''
      }));
      setAvatarFile(null); // Clear staged file

      // Optionally navigate back or refresh data after a short delay
      // setTimeout(() => history.goBack(), 1500); // Go back instead of push
      // Or update local state if staying on page: setAvatarPreview(newAvatarUrl);

    } catch (error: any) {
      console.error('Error during profile update:', error);
      setAlertHeader('Update Error');
      setAlertMessage(error.message || 'An unexpected error occurred.');
      setShowAlert(true);
    } finally {
      setIsUpdating(false); // Stop update indicator
    }
  };

  // --- Render Logic ---
  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
           <IonToolbar>
              <IonButtons slot="start">
                 <IonBackButton defaultHref="/it35-lab/app" /> {/* Adjust default route */}
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

  return (
    <IonPage>
      <IonHeader>
         <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/it35-lab/app" /> {/* Adjust default route */}
            </IonButtons>
            <IonTitle>Edit Account</IonTitle>
         </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid>
           {/* --- Avatar Section --- */}
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
                accept="image/png, image/jpeg, image/gif, image/webp" // Specify accepted types
                onChange={handleAvatarChange}
              />

              <IonButton
                size="small" // Smaller button for upload
                fill="outline"
                onClick={triggerFileInput}
              >
                {avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
              </IonButton>
            </IonCol>
          </IonRow>

          {/* --- Profile Information Section --- */}
           <IonRow className="ion-justify-content-center">
               <IonCol size="12" size-sm="10" size-md="8">
                    <IonItem lines="none" style={{ marginBottom: '15px' }}>
                        <IonLabel position="stacked" color="medium">Email</IonLabel>
                        <IonInput
                           type="email"
                           value={currentEmail}
                           readonly={true} // Email usually not changed here
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

           {/* --- Password Change Section --- */}
            <IonRow className="ion-justify-content-center ion-margin-top">
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
                            disabled={!formData.password} // Disable if new password is blank
                         >
                             <IonInputPasswordToggle slot="end" />
                         </IonInput>
                    </IonItem>
                </IonCol>
            </IonRow>

            {/* --- Current Password Verification --- */}
            <IonRow className="ion-justify-content-center ion-margin-top">
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
                            required // Visually indicate requirement
                         >
                            <IonInputPasswordToggle slot="end" />
                         </IonInput>
                          <IonText color="medium" style={{fontSize: '0.8em', marginTop: '5px'}}>* Required to save any changes</IonText>
                    </IonItem>
                </IonCol>
            </IonRow>

            {/* --- Update Button --- */}
            <IonRow className="ion-justify-content-center">
                <IonCol size="12" size-sm="10" size-md="8">
                    <IonButton
                        expand="block"
                        onClick={handleUpdate}
                        disabled={isUpdating || !formData.currentPassword} // Disable if updating or no current password entered
                        style={{ '--border-radius': '8px' }}
                    >
                        {isUpdating ? <IonSpinner name="dots" /> : 'Update Account'}
                    </IonButton>
                </IonCol>
            </IonRow>

        </IonGrid>
      </IonContent>

      {/* --- Alert --- */}
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={alertHeader || 'Alert'} // Use state for header
        message={alertMessage}
        buttons={['OK']}
      />
    </IonPage>
  );
};

export default EditAccount;