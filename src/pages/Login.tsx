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
import bcrypt from 'bcryptjs';

const registerUser = async (email: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const { user, error } = await supabase.auth.signUp({
    email,
    password: hashedPassword,
  });

  if (error) {
    console.error('Error registering user:', error.message);
  } else {
    console.log('User registered:', user);
  }
};

const Login: React.FC = () => {
  const navigation = useIonRouter();
  const [currentFact, setCurrentFact] = useState<string>('Loading cat fact...');

  useEffect(() => {
    const fetchCatFact = async () => {
      try {
        const response = await fetch('https://catfact.ninja/fact');
        const data = await response.json();
        setCurrentFact(data.fact);
      } catch (error) {
        console.error('Error fetching cat fact:', error);
      }
    };

    fetchCatFact();
    const interval = setInterval(fetchCatFact, 10000);
    return () => clearInterval(interval);
  }, []);

  const doLogin = () => {
    navigation.push('/it35-lab/app', 'forward', 'replace');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding' fullscreen style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
          
          {/* Left Side - Registration Form */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <label style={{ alignSelf: 'flex-start', marginLeft: '10%', marginBottom: '5px' }}>Email</label>
            <IonItem lines="none" className="ion-text-center" style={{ width: '80%' }}>
              <IonInput type="email" fill="solid" labelPlacement="floating" helperText="Enter a valid email" errorText="Invalid email" style={{ color: 'black' }} />
            </IonItem>
            
            <label style={{ alignSelf: 'flex-start', marginLeft: '10%', marginTop: '15px', marginBottom: '5px' }}>Password</label>
            <IonItem lines="none" className="ion-text-center" style={{ width: '80%' }}>
              <IonInput type="password" fill="solid" labelPlacement="floating" helperText="Enter a valid password" errorText="Invalid password" style={{ color: 'black' }} />
            </IonItem>

            <IonButton onClick={doLogin} expand="full" style={{ marginTop: '20px', width: '80%' }}>
              Login
            </IonButton>

            <IonNote style={{ marginTop: '15px' }}>Or Log in Using</IonNote>

            <div style={{ display: 'flex', marginTop: '10px' }}>
              {[...Array(3)].map((_, index) => (
                <IonAvatar key={index} style={{ width: '50px', height: '50px', margin: '10px' }}>
                  <img src="https://mailmeteor.com/logos/assets/PNG/Gmail_Logo_512px.png" alt="Gmail icon" />
                </IonAvatar>
              ))}
            </div>

            <IonLabel style={{ marginTop: '10px' }}>No Account? <a href="/signup"> Sign Up</a></IonLabel>
          </div>
          
          {/* Border Line */}
          <div style={{ width: '2px', backgroundColor: 'white', height: '80%', alignSelf: 'center' }}></div>
          
          {/* Right Side - Logo */}
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
