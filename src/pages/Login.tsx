import React, { useState } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonInput, 
  IonButton, 
  useIonRouter 
} from '@ionic/react';

const Login: React.FC = () => {
  const navigation = useIonRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === 'password') {
      navigation.push('/it35-lab/app', 'forward', 'replace');
    } else {
      alert('Invalid Credentials');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonInput 
          placeholder="Username" 
          onIonChange={(e) => setUsername(e.detail.value!)} 
        />
        <IonInput 
          type="password" 
          placeholder="Password" 
          onIonChange={(e) => setPassword(e.detail.value!)} 
        />
        <IonButton expand="full" onClick={handleLogin}>
          Login
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Login;
