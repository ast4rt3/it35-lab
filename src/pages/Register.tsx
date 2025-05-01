import { 
    IonAlert,
    IonAvatar,
    IonButton,
    IonContent, 
    IonInput, 
    IonLabel,
    IonNote,  
    IonPage,  
    IonModal,
    IonText,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonInputPasswordToggle
  } from '@ionic/react';
  import { useState } from 'react';
  import { supabase } from '../utils/supabaseClient';
  
  const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isUsernameFocused, setIsUsernameFocused] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  
    const handleOpenVerificationModal = () => {
      if (!email.endsWith("@nbsc.edu.ph")) {
        alert("Only @nbsc.edu.ph emails are allowed to register.");
        return;
      }
  
      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
      setShowVerificationModal(true);
    };
  
    const doRegister = async () => {
      if (!email.endsWith("@nbsc.edu.ph")) {
        alert("Only @nbsc.edu.ph emails are allowed to register.");
        return;
      }
  
      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
  
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
            },
          },
        });
  
        if (error) {
          throw error;
        }
  
        console.log("User registered:", data);
        setShowVerificationModal(false);
        setShowSuccessModal(true);
      } catch (err: any) {
        alert(err.message);
        console.error("Registration error:", err);
      }
    };
  
    return (
      <IonPage>
        <IonContent className="ion-padding" fullscreen style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* Left Side */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              {/* Header */}
              <div style={{ width: '80%', marginBottom: '30px', textAlign: 'left' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px', color: '#1a1b26' }}>Create Your Account</h2>
                <p style={{ fontSize: '16px', color: '#757575', margin: 0 }}>Please fill in your details to register</p>
              </div>
  
              {/* Username Field */}
              <div style={{ width: '80%', marginBottom: '30px' }}>
                <div 
                  style={{ 
                    position: 'relative',
                    borderBottom: `2px solid ${isUsernameFocused ? '#3880ff' : '#e0e0e0'}`,
                    transition: 'border-color 0.3s ease',
                    paddingBottom: '5px'
                  }}
                >
                  <IonLabel 
                    style={{ 
                      position: 'absolute',
                      top: isUsernameFocused || username ? '0' : '50%',
                      transform: isUsernameFocused || username ? 'translateY(0)' : 'translateY(-50%)',
                      left: '0',
                      color: isUsernameFocused ? '#3880ff' : '#757575',
                      fontSize: isUsernameFocused || username ? '14px' : '16px',
                      transition: 'all 0.3s ease',
                      pointerEvents: 'none'
                    }}
                  >
                    Username
                  </IonLabel>
                  <IonInput 
                    type="text" 
                    value={username} 
                    onIonChange={e => setUsername(e.detail.value!)} 
                    onIonFocus={() => setIsUsernameFocused(true)}
                    onIonBlur={() => setIsUsernameFocused(false)}
                    style={{ 
                      '--padding-top': isUsernameFocused || username ? '20px' : '0',
                      '--padding-bottom': '10px',
                      width: '100%'
                    }}
                  />
                </div>
              </div>
  
              {/* Email Field */}
              <div style={{ width: '80%', marginBottom: '30px' }}>
                <div 
                  style={{ 
                    position: 'relative',
                    borderBottom: `2px solid ${isEmailFocused ? '#3880ff' : '#e0e0e0'}`,
                    transition: 'border-color 0.3s ease',
                    paddingBottom: '5px'
                  }}
                >
                  <IonLabel 
                    style={{ 
                      position: 'absolute',
                      top: isEmailFocused || email ? '0' : '50%',
                      transform: isEmailFocused || email ? 'translateY(0)' : 'translateY(-50%)',
                      left: '0',
                      color: isEmailFocused ? '#3880ff' : '#757575',
                      fontSize: isEmailFocused || email ? '14px' : '16px',
                      transition: 'all 0.3s ease',
                      pointerEvents: 'none'
                    }}
                  >
                    Email (@nbsc.edu.ph)
                  </IonLabel>
                  <IonInput 
                    type="email" 
                    value={email} 
                    onIonChange={e => setEmail(e.detail.value!)} 
                    onIonFocus={() => setIsEmailFocused(true)}
                    onIonBlur={() => setIsEmailFocused(false)}
                    style={{ 
                      '--padding-top': isEmailFocused || email ? '20px' : '0',
                      '--padding-bottom': '10px',
                      width: '100%'
                    }}
                  />
                </div>
              </div>
  
              {/* Password Field */}
              <div style={{ width: '80%', marginBottom: '30px' }}>
                <div 
                  style={{ 
                    position: 'relative',
                    borderBottom: `2px solid ${isPasswordFocused ? '#3880ff' : '#e0e0e0'}`,
                    transition: 'border-color 0.3s ease',
                    paddingBottom: '5px'
                  }}
                >
                  <IonLabel 
                    style={{ 
                      position: 'absolute',
                      top: isPasswordFocused || password ? '0' : '50%',
                      transform: isPasswordFocused || password ? 'translateY(0)' : 'translateY(-50%)',
                      left: '0',
                      color: isPasswordFocused ? '#3880ff' : '#757575',
                      fontSize: isPasswordFocused || password ? '14px' : '16px',
                      transition: 'all 0.3s ease',
                      pointerEvents: 'none'
                    }}
                  >
                    Password
                  </IonLabel>
                  <IonInput 
                    type="password" 
                    value={password} 
                    onIonChange={e => setPassword(e.detail.value!)} 
                    onIonFocus={() => setIsPasswordFocused(true)}
                    onIonBlur={() => setIsPasswordFocused(false)}
                    style={{ 
                      '--padding-top': isPasswordFocused || password ? '20px' : '0',
                      '--padding-bottom': '10px',
                      width: '100%'
                    }}
                  >
                    <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
                  </IonInput>
                </div>
              </div>
  
              {/* Confirm Password Field */}
              <div style={{ width: '80%', marginBottom: '30px' }}>
                <div 
                  style={{ 
                    position: 'relative',
                    borderBottom: `2px solid ${isConfirmPasswordFocused ? '#3880ff' : '#e0e0e0'}`,
                    transition: 'border-color 0.3s ease',
                    paddingBottom: '5px'
                  }}
                >
                  <IonLabel 
                    style={{ 
                      position: 'absolute',
                      top: isConfirmPasswordFocused || confirmPassword ? '0' : '50%',
                      transform: isConfirmPasswordFocused || confirmPassword ? 'translateY(0)' : 'translateY(-50%)',
                      left: '0',
                      color: isConfirmPasswordFocused ? '#3880ff' : '#757575',
                      fontSize: isConfirmPasswordFocused || confirmPassword ? '14px' : '16px',
                      transition: 'all 0.3s ease',
                      pointerEvents: 'none'
                    }}
                  >
                    Confirm Password
                  </IonLabel>
                  <IonInput 
                    type="password" 
                    value={confirmPassword} 
                    onIonChange={e => setConfirmPassword(e.detail.value!)} 
                    onIonFocus={() => setIsConfirmPasswordFocused(true)}
                    onIonBlur={() => setIsConfirmPasswordFocused(false)}
                    style={{ 
                      '--padding-top': isConfirmPasswordFocused || confirmPassword ? '20px' : '0',
                      '--padding-bottom': '10px',
                      width: '100%'
                    }}
                  >
                    <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
                  </IonInput>
                </div>
              </div>
  
              <IonButton 
                onClick={handleOpenVerificationModal} 
                expand="full" 
                style={{ 
                  marginTop: '20px', 
                  width: '80%',
                  '--border-radius': '25px',
                  '--padding-top': '20px',
                  '--padding-bottom': '20px',
                  '--box-shadow': '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                Register
              </IonButton>
  
              <IonButton 
                routerLink="/it35-lab" 
                expand="full" 
                fill="clear" 
                style={{ 
                  width: '80%',
                  '--border-radius': '25px',
                  color: '#3880ff'
                }}
              >
                Already have an account? Sign in
              </IonButton>
            </div>
  
            {/* Border Line */}
            <div style={{ width: '2px', backgroundColor: 'white', height: '80%', alignSelf: 'center', opacity: 0.3, boxShadow: 'rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px' }}></div>
  
            {/* Right Side (Logo) */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1b26', height: '100%' }}>
              <IonAvatar style={{ width: '200px', height: '200px' }}>
                <img src="https://i.pinimg.com/736x/aa/ec/16/aaec16b6c7fcd29d1d42d950265c5447.jpg" alt="dark blue logo" />
              </IonAvatar>
            </div>
          </div>
        </IonContent>
  
        {/* Verification Modal */}
        <IonModal isOpen={showVerificationModal} onDidDismiss={() => setShowVerificationModal(false)}>
          <IonContent className="ion-padding" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IonCard style={{ width: '90%', maxWidth: '500px' }} className="ion-padding">
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Confirm Registration</IonCardTitle>
                <hr style={{ border: '1px solid #e0e0e0', margin: '15px 0' }}></hr>
  
                <IonCardSubtitle style={{ fontSize: '0.9rem', color: '#757575' }}>Username</IonCardSubtitle>
                <IonCardTitle style={{ fontSize: '1.2rem', marginBottom: '15px' }}>{username}</IonCardTitle>
  
                <IonCardSubtitle style={{ fontSize: '0.9rem', color: '#757575' }}>Email</IonCardSubtitle>
                <IonCardTitle style={{ fontSize: '1.2rem' }}>{email}</IonCardTitle>
              </IonCardHeader>
      
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <IonButton 
                  fill="clear"
                  onClick={() => setShowVerificationModal(false)}
                  style={{ color: '#757575' }}
                >
                  Cancel
                </IonButton>
  
                <IonButton
                  color="primary"
                  onClick={doRegister} 
                  style={{ marginLeft: '10px' }}
                >
                  Confirm
                </IonButton>
              </div> 
            </IonCard>
          </IonContent>
        </IonModal>
  
        {/* Success Modal */}
        <IonModal isOpen={showSuccessModal} onDidDismiss={() => setShowSuccessModal(false)}>
          <IonContent className="ion-padding" style={{ 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            textAlign: 'center'
          }}>
            <div style={{ maxWidth: '500px', padding: '20px' }}>
              <IonText>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#3880ff' }}>Registration Successful 🎉</h2>
                <p style={{ fontSize: '1rem', color: '#757575', margin: '20px 0' }}>
                  Your account has been created successfully. Please check your email to verify your account.
                </p>
              </IonText>
              <IonButton 
                routerLink="/it35-lab" 
                routerDirection="back" 
                color="primary"
                style={{ 
                  marginTop: '20px',
                  '--border-radius': '25px',
                  '--padding-top': '15px',
                  '--padding-bottom': '15px',
                  width: '200px'
                }}
              >
                Go to Login
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonPage>
    );
  };
  
  export default Register;