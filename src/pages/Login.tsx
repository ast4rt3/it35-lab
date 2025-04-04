import { 
  IonAvatar,
  IonButton,
  IonContent, 
  IonHeader, 
  IonInput, 
  IonItem, 
  IonLabel, 
  IonNote, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  useIonRouter
} from '@ionic/react';

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const Login: React.FC = () => {
  const navigation = useIonRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Login Error:', error.message);
    } else {
      navigation.push('/it35-lab/app', 'forward', 'replace');
    }
    
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" fullscreen style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>

          {/* Left Side*/}

            <h1 style={{ 
            position: 'absolute', 
            top: '15%', 
            left: '15%', 
            transform: 'translate(-50%, -50%)', 
            fontSize: '3rem', 
            fontWeight: 'bold', 
           
            }}>
            Header test
            </h1>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <label style={{ alignSelf: 'flex-start', marginLeft: '10%', marginBottom: '5px', fontSize: '20px'  }}>Email</label>
            <IonItem lines="none" className="ion-text-center" style={{ width: '80%' }}>
              <IonInput type="email" value={email} onIonChange={e => setEmail(e.detail.value!)} fill="solid" labelPlacement="floating" helperText="Enter a valid email" errorText="Invalid email" style={{ color: 'black' }} />
            </IonItem>
            
            <label style={{ alignSelf: 'flex-start', marginLeft: '10%', marginTop: '15px', marginBottom: '5px', fontSize: '20px'   }}>Password</label>
            <IonItem lines="none" className="ion-text-center" style={{ width: '80%' }}>
              <IonInput type="password" value={password} onIonChange={e => setPassword(e.detail.value!)} fill="solid" labelPlacement="floating" helperText="Enter a valid password" errorText="Invalid password" style={{ color: 'black' }} />
            </IonItem>

            <IonButton onClick={handleLogin} expand="full" style={{ marginTop: '20px', width: '80%' }}>
              Login
            </IonButton>

            <IonNote style={{ marginTop: '15px' }}>Or Log in Using</IonNote>

            <div style={{ display: 'flex', marginTop: '10px' }}>
                <IonAvatar style={{ width: '40px', height: '50px', margin: '10px' }}>
                  <img src="https://mailmeteor.com/logos/assets/PNG/Gmail_Logo_512px.png" alt="Gmail icon" />
                </IonAvatar>
                <IonAvatar style={{ width: '50px', height: '50px', margin: '10px' }}>
                  <img src="https://static.vecteezy.com/system/resources/previews/018/930/476/original/facebook-logo-facebook-icon-transparent-free-png.png" alt="Gmail icon" />
                </IonAvatar>
                <IonAvatar style={{ width: '50px', height: '50px', margin: '10px' }}>
                  <img src="https://mailmeteor.com/logos/assets/PNG/Gmail_Logo_512px.png" alt="Gmail icon" />
                </IonAvatar>
            </div>

            <IonLabel style={{ marginTop: '10px' }}>
            No Account? 
            <a href="/it35-lab/register" >
                  Sign Up
            </a>
            </IonLabel>

          </div>
          
          {/* Border Line */}
            <div style={{ width: '2px', backgroundColor: 'white', height: '80%', alignSelf: 'center', opacity: 0.3, boxShadow: 'rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px' }}></div>
        
          {/* Logo */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1b26', height: '100%' }}>
            <IonAvatar style={{ width: '200px', height: '200px' }}>
              <img src="https://i.pinimg.com/736x/aa/ec/16/aaec16b6c7fcd29d1d42d950265c5447.jpg" alt="dark blue logo" />
            </IonAvatar>
          </div>
          
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
function setCurrentFact(fact: any) {
  throw new Error('Function not implemented.');
}

