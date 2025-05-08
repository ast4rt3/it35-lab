import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const Notifications: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Notifications</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* Notifications content will go here */}
      </IonContent>
    </IonPage>
  );
};

export default Notifications; 