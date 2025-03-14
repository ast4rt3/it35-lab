import { 
  IonButton,
  IonContent, 
  IonHeader, 
  IonInput, 
  IonItem, 
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
      
      
    <IonItem lines="none" className="ion-text-center">
      <img src="https://imgs.search.brave.com/vkbSq7AQTJknNciczCdf8uMJSmAPoMswIFnLic5T6pE/rs:fit:200:200:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMud2lraWEubm9j/b29raWUubmV0L3Np/bGx5LWNhdC9pbWFn/ZXMvNC80ZC9Nci5f/RnJlc2gucG5nL3Jl/dmlzaW9uL2xhdGVz/dD9jYj0yMDI0MDEx/NzE3MDY0Nw" alt="Centered Kitten" style={{ width: '150px', height: '150px', borderRadius: '50%' }} />
    </IonItem>

      <IonItem>
        <IonInput label="Email" type="email" placeholder=""></IonInput>
      </IonItem>
      <IonItem>
      <IonInput label="Password" type="password" value=""></IonInput>
      </IonItem>

        <IonButton onClick={doLogin} expand="full">
          Login
        </IonButton>

        {/* Scrolling Cat Fact at the Bottom */}
        <div className="ticker-container">
          <div className="ticker-text">{currentFact}</div>
        </div>
      </IonContent>

      {/* Add Styles */}
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
