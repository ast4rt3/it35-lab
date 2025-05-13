import { 
  IonAlert,
  IonAvatar,
  IonButton,
  IonContent, 
  IonIcon, 
  IonInput, 
  IonItem, 
  IonLabel,
  IonNote,  
  IonPage,  
  IonToast,  
  IonRouterLink,
  IonSpinner
} from '@ionic/react';
import { logoIonic } from 'ionicons/icons';
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useHistory } from 'react-router-dom';

const AlertBox: React.FC<{ message: string; isOpen: boolean; onClose: () => void }> = ({ message, isOpen, onClose }) => {
  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={onClose}
      header="Notification"
      message={message}
      buttons={['OK']}
    />
  );
};

const Login: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const doLogin = async () => {
    if (!email || !password) {
      setAlertMessage('Please enter both email and password');
      setShowAlert(true);
      return;
    }

    try {
      setIsLoggingIn(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setAlertMessage(error.message);
        setShowAlert(true);
        return;
      }

      if (data.session) {
        setShowToast(true);
        // Use window.location for a hard redirect
        window.location.href = '/it35-lab/app/home';
      }
    } catch (err) {
      setAlertMessage('An error occurred during login');
      setShowAlert(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoggingIn) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}>
            <IonSpinner />
          </div>
        </IonContent>
      </IonPage>
    );
  }
  
  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <div style={{ 
          display: 'flex', 
          width: '100%', 
          height: '100%', 
          overflow: 'hidden',
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row' 
        }}>
          {/* Left Side */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            padding: window.innerWidth <= 768 ? '20px' : '0'
          }}>
            <h1 style={{
              position: window.innerWidth <= 768 ? 'relative' : 'absolute',
              top: window.innerWidth <= 768 ? 'auto' : '15%',
              left: window.innerWidth <= 768 ? 'auto' : '15%',
              transform: window.innerWidth <= 768 ? 'none' : 'translate(-50%, -50%)',
              fontSize: window.innerWidth <= 768 ? '1.8rem' : '3rem',
              fontWeight: 'bold',
              marginBottom: window.innerWidth <= 768 ? '20px' : '0',
              textAlign: window.innerWidth <= 768 ? 'center' : 'left',
              width: window.innerWidth <= 768 ? '100%' : 'auto',
              padding: window.innerWidth <= 768 ? '0 20px' : '0'
            }}>
              Welcome Back
            </h1>

            <div style={{ width: window.innerWidth <= 768 ? '100%' : '80%', marginBottom: '30px' }}>
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
                  Email
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

            <div style={{ width: window.innerWidth <= 768 ? '100%' : '80%', marginBottom: '30px' }}>
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
                />
              </div>
            </div>

            <IonButton 
              onClick={doLogin} 
              expand="full" 
              style={{ 
                marginTop: '20px', 
                width: window.innerWidth <= 768 ? '100%' : '80%',
                '--border-radius': '25px',
                '--padding-top': '20px',
                '--padding-bottom': '20px',
                '--box-shadow': '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              Login
            </IonButton>

            <IonNote style={{ marginTop: '15px', color: '#757575' }}>Or Log in Using</IonNote>

            <div style={{ display: 'flex', marginTop: '10px' }}>
              <IonAvatar style={{ width: '40px', height: '50px', margin: '10px', cursor: 'pointer', transition: 'transform 0.2s' }}>
                <img src="https://mailmeteor.com/logos/assets/PNG/Gmail_Logo_512px.png" alt="Gmail icon" />
              </IonAvatar>
              <IonAvatar style={{ width: '50px', height: '50px', margin: '10px', cursor: 'pointer', transition: 'transform 0.2s' }}>
                <img src="https://static.vecteezy.com/system/resources/previews/018/930/476/original/facebook-logo-facebook-icon-transparent-free-png.png" alt="Facebook icon" />
              </IonAvatar>
              <IonAvatar style={{ width: '50px', height: '50px', margin: '10px', cursor: 'pointer', transition: 'transform 0.2s' }}>
                <img src="https://mailmeteor.com/logos/assets/PNG/Gmail_Logo_512px.png" alt="Gmail icon" />
              </IonAvatar>
            </div>

            <IonLabel style={{ marginTop: '10px', color: '#757575' }}>
              No Account? <IonRouterLink routerLink="/it35-lab/register" style={{ color: '#3880ff', textDecoration: 'none' }}>Sign Up</IonRouterLink>
            </IonLabel>
          </div>

          {/* Border Line */}
          <div style={{ 
            width: window.innerWidth <= 768 ? '100%' : '2px', 
            height: window.innerWidth <= 768 ? '2px' : '80%', 
            backgroundColor: 'white', 
            alignSelf: 'center', 
            opacity: 0.3, 
            boxShadow: 'rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px',
            margin: window.innerWidth <= 768 ? '20px 0' : '0'
          }}></div>

          {/* Right Side (Logo) */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            backgroundColor: '#1a1b26', 
            height: window.innerWidth <= 768 ? 'auto' : '100%',
            padding: window.innerWidth <= 768 ? '40px 0' : '0'
          }}>
            <IonAvatar style={{ 
              width: window.innerWidth <= 768 ? '150px' : '200px', 
              height: window.innerWidth <= 768 ? '150px' : '200px' 
            }}>
              <img src="https://i.pinimg.com/736x/aa/ec/16/aaec16b6c7fcd29d1d42d950265c5447.jpg" alt="dark blue logo" />
            </IonAvatar>
          </div>
        </div>
      </IonContent>

      {/* Reusable AlertBox Component */}
      <AlertBox message={alertMessage} isOpen={showAlert} onClose={() => setShowAlert(false)} />

      {/* IonToast for success message */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message="Login successful! Redirecting..."
        duration={1500}
        position="top"
        color="primary"
      />
    </IonPage>
  );
};

export default Login;
