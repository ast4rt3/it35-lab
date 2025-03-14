import { 
  IonAvatar,
  IonButton,
  IonContent, 
  IonHeader, 
  IonIcon, 
  IonInput, 
  IonItem, 
  IonNote, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  useIonRouter
} from '@ionic/react';

import { useEffect, useState } from 'react';

const Login: React.FC = () => {
  const navigation = useIonRouter();
  const [catFact, setCatFact] = useState<string>('Loading cat fact...');
  const [queue, setQueue] = useState<string[]>([]); // Queue for multiple facts
  const [currentFact, setCurrentFact] = useState<string>('Loading cat fact...');

  // Function to fetch cat facts continuously
  const fetchCatFact = async () => {
    try {
      const response = await fetch('https://catfact.ninja/fact');
      const data = await response.json();
      
      setQueue((prevQueue) => [...prevQueue, data.fact]); // Add to queue
    } catch (error) {
      console.error('Error fetching cat fact:', error);
    }
  };

  // Fetch a cat fact initially and every 5 seconds
  useEffect(() => {
    fetchCatFact(); // Initial fetch
    const interval = setInterval(fetchCatFact, 10000); // Fetch every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Rotate facts every 5 seconds
  useEffect(() => {
    if (queue.length > 0) {
      const interval = setInterval(() => {
        setCurrentFact(queue[0]); // Show first fact
        setQueue((prevQueue) => prevQueue.slice(1)); // Remove first fact
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [queue]);

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
      <IonContent className='ion-padding'>
      
      
    <IonItem lines="none" className="ion-text-center" style={{ justifyContent: 'center', alignItems: 'center'}}>
      <IonAvatar style={{ width: '150px', height: '150px', margin: '30px', display: 'flex'}}>
        <img src="https://imgs.search.brave.com/vkbSq7AQTJknNciczCdf8uMJSmAPoMswIFnLic5T6pE/rs:fit:200:200:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMud2lraWEubm9j/b29raWUubmV0L3Np/bGx5LWNhdC9pbWFn/ZXMvNC80ZC9Nci5f/RnJlc2gucG5nL3Jl/dmlzaW9uL2xhdGVz/dD9jYj0yMDI0MDEx/NzE3MDY0Nw" alt="Centered Kitten" />
      </IonAvatar>
    </IonItem>

    <IonInput
      type="email"
      fill="solid"
      label="Email"
      labelPlacement="floating"
      helperText="Enter a valid email"
      errorText="Invalid email"
      style={{ color: 'black', '--background': 'var(--ion-color-primary)', }}
    ></IonInput>
    
        <IonInput
      type="password"
      fill="solid"
      label="Password"
      labelPlacement="floating"
      helperText="Enter a valid password"
      errorText="Invalid password"
      style={{ color: 'black', '--background': 'var(--ion-color-primary)',top: '20px' }}
    ></IonInput>


        <div style={{ height: '50px'}}></div>
        <IonButton onClick={doLogin} expand="full">
          Login
        </IonButton>


        <IonNote style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Or Log in Using</IonNote>


        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

          <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer">
            <IonAvatar style={{ width: '50px', height: '50px', margin: '10px', display: 'flex', overflow: 'hidden' }}>
              <img src="https://mailmeteor.com/logos/assets/PNG/Gmail_Logo_512px.png" alt="Gmail icon" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            </IonAvatar>
          </a>
          <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer">
            <IonAvatar style={{ width: '50px', height: '50px', margin: '10px', display: 'flex' }}>
              <img src="https://mailmeteor.com/logos/assets/PNG/Gmail_Logo_512px.png" alt="Gmail icon" />
            </IonAvatar>
          </a>
          <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer">
            <IonAvatar style={{ width: '50px', height: '50px', margin: '10px', display: 'flex' }}>
              <img src="https://mailmeteor.com/logos/assets/PNG/Gmail_Logo_512px.png" alt="Gmail icon" />
            </IonAvatar>
          </a>
        </div>
        <IonNote style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>No Account?</IonNote>

        <div className="ticker-container">
          <div className="ticker-text">{currentFact}</div>
        </div>
      </IonContent>

      <style>
        {`
          .ticker-container {
            position: absolute;
            bottom: 10px;
            width: 98%;
            overflow: hidden;
            background-color: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 18px;
            font-weight: bold;
            white-space: nowrap;
          }

          .ticker-text {
            display: inline-block;
            padding-left: 100%;
            animation: ticker 30s linear infinite;
          }

          @keyframes ticker {
            from { transform: translateX(100%); }
            to { transform: translateX(-100%); }
          }
        `}
      </style>
    </IonPage>
  );
};

export default Login;
