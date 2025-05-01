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
  useIonRouter
} from '@ionic/react';
import { logoIonic } from 'ionicons/icons';
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

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
  const navigation = useIonRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const doLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setAlertMessage(error.message);
      setShowAlert(true);
      return;
    }

    setShowToast(true); 
    setTimeout(() => {
      navigation.push('/it35-lab/app', 'forward', 'replace');
    }, 300);
  };
  
  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
          {/* Left Side */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <h1 style={{
              position: 'absolute',
              top: '15%',
              left: '15%',
              transform: 'translate(-50%, -50%)',
              fontSize: '3rem',
              fontWeight: 'bold',
            }}>
            </h1>

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
                />
              </div>
            </div>

            <IonButton 
              onClick={doLogin} 
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
              Login
            </IonButton>

            <IonNote style={{ marginTop: '15px', color: '#757575' }}>Or Log in Using</IonNote>

            <div style={{ display: 'flex', marginTop: '10px' }}>
              <IonAvatar style={{ width: '40px', height: '50px', margin: '10px', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.1)' } }}>
                <img src="https://mailmeteor.com/logos/assets/PNG/Gmail_Logo_512px.png" alt="Gmail icon" />
              </IonAvatar>
              <IonAvatar style={{ width: '50px', height: '50px', margin: '10px', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.1)' } }}>
                <img src="https://static.vecteezy.com/system/resources/previews/018/930/476/original/facebook-logo-facebook-icon-transparent-free-png.png" alt="Facebook icon" />
              </IonAvatar>
              <IonAvatar style={{ width: '50px', height: '50px', margin: '10px', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.1)' } }}>
                <img src="https://mailmeteor.com/logos/assets/PNG/Gmail_Logo_512px.png" alt="Gmail icon" />
              </IonAvatar>
            </div>

            <IonLabel style={{ marginTop: '10px', color: '#757575' }}>
              No Account? <a href="/it35-lab/register" style={{ color: '#3880ff', textDecoration: 'none' }}>Sign Up</a>
            </IonLabel>
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