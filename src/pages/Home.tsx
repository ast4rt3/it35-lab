import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonButton expand="full" onClick={() => history.push('/it35-lab/details')}>
          Go to Details
        </IonButton>
        <IonButton expand="full" color="danger" onClick={() => history.push('/it35-lab/login')}>
          Logout
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Home;
