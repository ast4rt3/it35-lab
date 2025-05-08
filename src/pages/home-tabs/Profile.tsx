import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const Profile: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* Profile content will go here */}
      </IonContent>
    </IonPage>
  );
};

export default Profile; 