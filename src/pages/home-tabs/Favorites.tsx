import { 
  IonButtons,
  IonContent, 
  IonHeader, 
  IonMenuButton, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonCard
} from '@ionic/react';

import { useEffect, useState } from 'react';

const Favorites: React.FC = () => {
  const [catFact, setCatFact] = useState<string>('Loading cat fact...');

  // Function to fetch a cat fact
  const fetchCatFact = async () => {
    try {
      const response = await fetch('https://catfact.ninja/fact');
      const data = await response.json();
      setCatFact(data.fact);
    } catch (error) {
      setCatFact('Failed to load cat fact.');
      console.error('Error fetching cat fact:', error);
    }
  };

  // Fetch the cat fact when the component mounts
  useEffect(() => {
    fetchCatFact();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>Cat Facts</IonTitle> {/* Updated Widget Name */}
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            flexDirection: 'column',
            textAlign: 'center',
            padding: '20px',
          }}
        >
          <IonCard style={{ padding: '20px', width: '80%' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Random Cat Fact</h2>
            <p style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '10px' }}>{catFact}</p> {/* Large Text */}
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Favorites;
